import { DRAFT_KEY, BACKUP_PREFIX, saveWithBackup, listCharacters } from './data/storage';
import { createPresetSave } from './data/presets';
import type { PresetCharacter } from './data/presets';
import PresetPicker from './components/PresetPicker';
import { normalizeCharacter, level } from './data/character';
import type { Character } from './data/character';
import { useRef, useState, useMemo, useEffect } from 'react';
import { FileText, Image as ImageIcon, Save, Download, Users } from 'lucide-react';
import { saveAs } from 'file-saver';
import {
  ACADEMIC_SKILLS, SOCIAL_SKILLS, TECH_SKILLS, GENERAL_SKILLS,
  OCCUPATION_DESC,
  VARIANT_RULES, INVESTIGATION_SKILLS, parseCreditRange,
  FREE_SANITY, FREE_STABILITY, FREE_HEALTH, NON_CLASS_ELIGIBLE
} from './data/constants';
import InfoPage from './components/InfoPage';
import SkillsPage from './components/SkillsPage';
import MemoPage from './components/MemoPage';
import RulesPage from './components/RulesPage';

function App() {
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [characterRevision, setCharacterRevision] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [exportImage, setExportImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'memo' | 'guide_rules'>('info');
  const [showOccupations, setShowOccupations] = useState(false);
  const [showDrives, setShowDrives] = useState(false);
  const [showPillars, setShowPillars] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Point allocation state
  const [variantIdx, setVariantIdx] = useState(0);
  const [playerCount, setPlayerCount] = useState(4);
  const [customInvPoints, setCustomInvPoints] = useState<number | null>(null);
  const [customGenPoints, setCustomGenPoints] = useState<number | null>(null);

  // App-level Creation state
  const [isCompleted, setIsCompleted] = useState(false);
  const [frozenStats, setFrozenStats] = useState({ invUsed: 0, genUsed: 0 });

  const [data, setData] = useState<Character>({
    player: '',
    name: '',
    avatar: '',
    drive: '',
    occupation: '',
    specialty: '',
    pillar: '',
    wealth: '',
    sanity: 4,
    stability: 1,
    health: 1,
    sourceOfStability: '',
    notes: '',
    campaignMemo: '',
    equipment: '',
    equipmentItems: [],
    gender: '',
    age: '',
    appearance: '',
    distinguishing: '',
    personality: '',
    backstory: '',
    skills: {}
  });

  const toggleClassSkill = (skill: string) => {
    if (isCompleted || NON_CLASS_ELIGIBLE.includes(skill)) return;
    setData((prev: Character) => {
      let curr = prev.customClassSkills;
      if (curr === undefined || curr === null) {
        curr = prev.occupation && OCCUPATION_DESC[prev.occupation] ? [...OCCUPATION_DESC[prev.occupation].skills] : [];
      }
      const newSkills = curr.includes(skill)
        ? curr.filter((s: string) => s !== skill)
        : [...curr, skill];
      return { ...prev, customClassSkills: newSkills };
    });
  };

  // === Point Allocation Computation ===
  const variant = VARIANT_RULES[variantIdx];
  const invPointsTotal = customInvPoints ?? (variant.investigationPoints[Math.min(playerCount, 4)] ?? variant.investigationPoints[4]);
  const genPointsTotal = customGenPoints ?? variant.generalPoints;

  const pointStats = useMemo(() => {
    const classSkills: string[] = data.customClassSkills ?? (data.occupation && OCCUPATION_DESC[data.occupation] ? OCCUPATION_DESC[data.occupation].skills : []);
    const occData = data.occupation && OCCUPATION_DESC[data.occupation] ? OCCUPATION_DESC[data.occupation] : null;
    const [creditMin, creditMax] = occData ? parseCreditRange(occData.credit) : [0, 0];
    const isWindyDandy = data.occupation === '风雅子弟';

    let invUsed = 0;
    let genUsed = 0;
    const warnings: string[] = [];
    const generalLevels: { name: string; level: number }[] = [];

    // Get athletic level for escape discount
    const athleticLevel = parseInt(data.skills['运动'] || '0') || 0;

    const allSkills = [...ACADEMIC_SKILLS, ...SOCIAL_SKILLS, ...TECH_SKILLS, ...GENERAL_SKILLS];

    for (const skill of allSkills) {
      const rawLevel = level(data, skill);
      if (rawLevel === 0) continue;

      const isInvestigation = INVESTIGATION_SKILLS.includes(skill);
      const isClass = classSkills.includes(skill);

      if (skill === '信誉等级') {
        // Credit rating: free initial = creditMin, within range = 1:1, over max = 2:1
        const paidLevel = Math.max(0, rawLevel - creditMin);
        let cost = 0;
        if (isWindyDandy) {
          cost = paidLevel; // no upper limit for 风雅子弟
        } else {
          const withinRange = Math.min(paidLevel, Math.max(0, creditMax - creditMin));
          const overRange = Math.max(0, paidLevel - withinRange);
          cost = withinRange + overRange * 2;
        }
        invUsed += cost;
      } else if (skill === '逃脱(7)') {
        // Escape: over 2x athletics is half price
        const threshold = athleticLevel * 2;
        if (rawLevel > threshold) {
          const normalPart = threshold;
          const discountPart = rawLevel - threshold;
          genUsed += normalPart + Math.ceil(discountPart / 2);
        } else {
          genUsed += rawLevel;
        }
      } else if (skill === '心智(9)') {
        genUsed += Math.max(0, rawLevel - FREE_SANITY);
        generalLevels.push({ name: '心智', level: rawLevel });
      } else if (skill === '坚毅(9)') {
        genUsed += Math.max(0, rawLevel - FREE_STABILITY);
        generalLevels.push({ name: '坚毅', level: rawLevel });
      } else if (skill === '健康(9)') {
        genUsed += Math.max(0, rawLevel - FREE_HEALTH);
        generalLevels.push({ name: '健康', level: rawLevel });
      } else if (isInvestigation) {
        invUsed += isClass ? Math.ceil(rawLevel / 2) : rawLevel;
      } else {
        // General skill
        genUsed += isClass ? Math.ceil(rawLevel / 2) : rawLevel;
        generalLevels.push({ name: skill, level: rawLevel });
      }
    }

    if (occData && level(data, '信誉等级') < creditMin) warnings.push(`信誉等级不得低于职业最低值 ${creditMin}`);
    if (!isCompleted && level(data, '克苏鲁神话(4)') > 0) warnings.push('创建时购买克苏鲁神话需要主持人许可');
    if (!isCompleted && level(data, '催眠(8)') > 0 && (variant.name !== '通俗风格' || !['精神病学家', '灵异现象研究者'].includes(data.occupation))) warnings.push('催眠仅限通俗风格的精神病学家或灵异现象研究者');

    // Validation
    if (invUsed > invPointsTotal) warnings.push(`调查能力点数超支 ${invUsed - invPointsTotal} 点`);
    if (genUsed > genPointsTotal) warnings.push(`一般能力点数超支 ${genUsed - genPointsTotal} 点`);

    // Second-highest general ability must be >= half of highest
    generalLevels.sort((a, b) => b.level - a.level);
    if (generalLevels.length >= 2 && generalLevels[0].level > 0) {
      const half = Math.ceil(generalLevels[0].level / 2);
      if (generalLevels[1].level < half) {
        warnings.push(`一般能力第二高(${generalLevels[1].name}:${generalLevels[1].level})不得低于最高(${generalLevels[0].name}:${generalLevels[0].level})的一半(${half})`);
      }
    }

    // Sanity cap
    const cthulhuLevel = parseInt(data.skills['克苏鲁神话(4)'] || '0') || 0;
    const sanityCap = Math.min(10, 10 - cthulhuLevel);
    const currentSanity = level(data, '心智(9)');
    if (currentSanity > sanityCap) warnings.push(`心智(${currentSanity})超过上限(${sanityCap})`);

    // Health/Stability cap
    const currentHealth = level(data, '健康(9)');
    const currentStability = level(data, '坚毅(9)');
    if (currentHealth > 12) warnings.push(`健康(${currentHealth})超过上限(12)`);
    if (currentStability > 12) warnings.push(`坚毅(${currentStability})超过上限(12)`);

    // If completed, freeze the displayed used points, but continue calculating cap warnings
    if (isCompleted) {
      return { invUsed: frozenStats.invUsed, genUsed: frozenStats.genUsed, warnings };
    }

    return { invUsed, genUsed, warnings };
  }, [data, invPointsTotal, genPointsTotal, isCompleted, frozenStats, variant.name]);

  // === Save/Load functionality ===
  const [initialStorage] = useState(() => {
    try { return { names: listCharacters(localStorage), draft: localStorage.getItem(DRAFT_KEY), error: '' }; }
    catch { return { names: [] as string[], draft: null, error: '浏览器存储无法读取，不能确认是否存在存档。请使用原来的设备和浏览器，或导入 JSON 备份。' }; }
  });
  const [savedCharacters, setSavedCharacters] = useState<string[]>(initialStorage.names);
  const [pendingDraft, setPendingDraft] = useState<string | null>(initialStorage.draft);
  const [storageError, setStorageError] = useState(initialStorage.error);
  const [draftStatus, setDraftStatus] = useState('');
  const lastDraft = useRef<string | null>(null);
  const settings = { variantIdx, playerCount, customInvPoints, customGenPoints };

  const draftPayload = JSON.stringify({ version: 2, settings, data, isCompleted, frozenStats });
  useEffect(() => {
    if (lastDraft.current === null) { lastDraft.current = draftPayload; return; }
    if (pendingDraft || lastDraft.current === draftPayload) return;
    setDraftStatus('正在保存草稿…');
    const persist = () => {
      try {
        localStorage.setItem(DRAFT_KEY, draftPayload);
        lastDraft.current = draftPayload;
        setDraftStatus('草稿已自动保存到此浏览器');
        setStorageError('');
      } catch {
        setDraftStatus('草稿自动保存失败');
        setStorageError('浏览器存储不可用或空间不足，当前修改尚未保存。请立即导出 JSON 备份。');
      }
    };
    const onHidden = () => { if (document.visibilityState === 'hidden') persist(); };
    const timer = window.setTimeout(persist, 500);
    window.addEventListener('pagehide', persist);
    document.addEventListener('visibilitychange', onHidden);
    return () => { window.clearTimeout(timer); window.removeEventListener('pagehide', persist); document.removeEventListener('visibilitychange', onHidden); };
  }, [draftPayload, pendingDraft]);

  const refreshSaved = () => {
    try { setSavedCharacters(listCharacters(localStorage)); setStorageError(''); }
    catch { setStorageError('浏览器存储无法读取，不能确认是否存在存档。请勿将此提示视为存档已删除。'); }
  };

  const saveCharacterUnsafe = () => {
    if (!data.name.trim()) { alert('请至少填写调查员姓名再保存！'); return; }
    let completed = isCompleted;
    if (!completed) {
      const valid = pointStats.invUsed === invPointsTotal && pointStats.genUsed === genPointsTotal && pointStats.warnings.length === 0;
      completed = valid || confirm('点数尚未完整分配或存在规则警告。仍然完成建卡并进入跑团吗？\n取消将保存草稿。');
    }
    const frozen = completed && !isCompleted ? { invUsed: pointStats.invUsed, genUsed: pointStats.genUsed } : frozenStats;
    const normalized = normalizeCharacter(data);
    saveWithBackup(localStorage, data.name, JSON.stringify({ version: 2, settings, data: normalized, isCompleted: completed, frozenStats: frozen }));
    setData(normalized);
    setIsCompleted(completed);
    setFrozenStats(frozen);
    setSavedCharacters(prev => Array.from(new Set([...prev, data.name])));
    alert(completed ? '角色已保存，跑团模式已开启。' : '角色草稿已保存。');
  };

  const saveCharacter = () => {
    try { saveCharacterUnsafe(); }
    catch { alert('保存失败：浏览器存储空间不足或不可用，请导出 JSON 备份。'); }
  };
  const exportJSON = () => saveAs(new Blob([JSON.stringify({ version: 2, settings, data, isCompleted, frozenStats }, null, 2)], { type: 'application/json' }), `TOC角色卡_${data.name || '未命名'}.json`);

  const applySave = (raw: string, notify = true) => {
    const parsed = JSON.parse(raw);
    if (!parsed.data || !parsed.data.skills || typeof parsed.data.name !== 'string' || !Array.isArray(parsed.data.equipmentItems ?? [])) throw new Error('存档格式无效');
    const restored = normalizeCharacter(parsed.data);
    setData(restored);
    setExportImage(null);
    setVariantIdx(Math.max(0, Math.min(VARIANT_RULES.length - 1, Math.trunc(Number(parsed.settings?.variantIdx) || 0))));
    setPlayerCount(Math.max(1, Math.min(10, Math.trunc(Number(parsed.settings?.playerCount) || 4))));
    setCustomInvPoints(parsed.settings?.customInvPoints == null ? null : Math.max(0, Math.trunc(Number(parsed.settings.customInvPoints) || 0)));
    setCustomGenPoints(parsed.settings?.customGenPoints == null ? null : Math.max(0, Math.trunc(Number(parsed.settings.customGenPoints) || 0)));
    setIsCompleted(parsed.isCompleted === true);
    setFrozenStats({ invUsed: Number(parsed.frozenStats?.invUsed) || 0, genUsed: Number(parsed.frozenStats?.genUsed) || 0 });
    setCharacterRevision(value => value + 1);
    if (notify) alert('读取成功！旧存档若已消耗能力，请核对原始能力等级。');
  };
  const usePreset = (preset: PresetCharacter) => {
    applySave(JSON.stringify(createPresetSave(preset)), false);
    setPendingDraft(null);
    setShowPresets(false);
    setShowSaved(false);
    setShowOccupations(false);
    setShowDrives(false);
    setShowPillars(false);
    setActiveTab('info');
  };

  const loadCharacter = (charName: string) => {
    try { const raw = localStorage.getItem(`toc_char_${charName}`); if (raw) { applySave(raw); setPendingDraft(null); } else alert('未找到该存档，请检查是否使用原来的浏览器。'); }
    catch { alert('读取失败：存档格式无效或浏览器存储不可用。'); }
  };


  const exportPNG = async () => {
    if (!sheetRef.current) return;
    try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(sheetRef.current, { scale: 2, useCORS: true, onclone: clone => {
      const pixel = clone.createElement('canvas'); pixel.width = pixel.height = 1;
      const ctx = pixel.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      const compatibleColor = (value: string) => value.replace(/(?:oklch|oklab|color|lab|lch)\([^)]*\)/g, color => {
        ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return `rgba(${r},${g},${b},${a / 255})`;
      });
      clone.querySelectorAll<HTMLElement>('*').forEach(element => {
        const computed = clone.defaultView!.getComputedStyle(element);
        for (const property of ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color', 'text-decoration-color', 'box-shadow', 'text-shadow', 'background-image']) {
          element.style.setProperty(property, compatibleColor(computed.getPropertyValue(property)), 'important');
        }
      });
    } });
    setExportImage(canvas.toDataURL('image/png'));
    } catch { alert('图片导出失败，请重试或使用 MD / JSON 备份。'); }
  };

  const exportMD = () => {
    const md = `# 克苏鲁迷踪 角色卡

## 基本信息
- **玩家:** ${data.player}
- **调查员姓名:** ${data.name}
- **动力:** ${data.drive}
- **职业:** ${data.occupation}
- **职业特长:** ${data.specialty}
- **心智支柱:** ${data.pillar}
- **随身财富:** ${data.wealth}

## 核心状态
- **心智:** ${data.sanity} | **坚毅:** ${data.stability} | **健康:** ${data.health}

## 技能
${Object.entries(data.skills)
        .filter(([, v]) => Number(v) > 0)
        .map(([k, v]) => `- **${k}:** ${v}`)
        .join('\n')}

## 坚毅之源
${data.sourceOfStability}

## 联系人
${data.notes}

## 外貌与背景
- 性别：${data.gender}；年龄：${data.age}
- 外貌：${data.appearance}
- 特征：${data.distinguishing}
- 性格：${data.personality}
${data.backstory}

## 装备
${data.equipmentItems.map(item => `- ${item.name} × ${item.qty}；价格：${item.price}；${item.note1} ${item.note2}`).join('\n')}

## 战役备忘录
${new DOMParser().parseFromString(data.campaignMemo, 'text/html').body.textContent || ''}

## 当前能力池
${Object.entries(data.pools || {}).map(([skill, value]) => `- ${skill}: ${value}`).join('\n')}

## 建卡配置
- 规则：${variant.name}；人数：${playerCount}
- 调查点数：${invPointsTotal}；一般点数：${genPointsTotal}
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `TOC角色卡_${data.name || '未命名'}.md`);
  };

  return (
    <div className="min-h-screen bg-[#1e1c18] font-sans text-stone-100 selection:bg-[#cca74b] selection:text-white">
      {/* 悬浮顶栏 / Sticky Header (提高了操作便捷性) */}
      <header className={`app-header ${showMobileTools ? 'mobile-tools-open' : ''} relative xl:sticky top-0 z-50 flex flex-col xl:flex-row flex-wrap gap-3 justify-between items-center bg-[#1e1c18]/90 backdrop-blur-md shadow-lg px-6 py-4 border-b border-stone-800 mb-8 w-full`}>
        <div className="shrink-0 flex justify-center xl:justify-start">
          <h1
            className="whitespace-nowrap text-xl md:text-2xl leading-none font-black text-[#cca74b] tracking-[0.2em] ml-[0.2em] cursor-pointer hover:brightness-125 transition-all"
            style={{ fontFamily: '"STKaiti", "KaiTi", serif', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}
            onClick={() => setShowAbout(true)}
            title="点击查看作者信息与免责声明"
          >
            克苏鲁迷踪
          </h1>
        </div>

        {/* 现代优雅的活页切换卡 / Sleek Tabs */}
        <div className="desktop-tabs shrink-0 flex flex-wrap bg-[#2c2923] p-[4px] rounded-lg mt-4 md:mt-0 shadow-inner md:mr-4 border border-stone-700/50">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 xl:px-6 py-2 text-[14px] font-bold rounded-md flex items-center gap-2 transition-all duration-300 ${activeTab === 'info' ? 'bg-[#cca74b] text-[#1e1c18] shadow-md' : 'text-stone-400 hover:text-stone-100'}`}
          >
            角色基础信息
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 xl:px-6 py-2 text-[14px] font-bold rounded-md flex items-center gap-2 transition-all duration-300 ${activeTab === 'skills' ? 'bg-[#cca74b] text-[#1e1c18] shadow-md' : 'text-stone-400 hover:text-stone-100'}`}
          >
            能力点数
          </button>
          <button
            onClick={() => setActiveTab('memo')}
            className={`px-4 xl:px-6 py-2 text-[14px] font-bold rounded-md flex items-center gap-2 transition-all duration-300 ${activeTab === 'memo' ? 'bg-[#cca74b] text-[#1e1c18] shadow-md' : 'text-stone-400 hover:text-stone-100'}`}
          >
            战役备忘录
          </button>
          <button
            onClick={() => setActiveTab('guide_rules')}
            className={`px-4 xl:px-6 py-2 text-[14px] font-bold rounded-md flex items-center gap-2 transition-all duration-300 ${activeTab === 'guide_rules' ? 'bg-[#cca74b] text-[#1e1c18] shadow-md' : 'text-stone-400 hover:text-stone-100'}`}
          >
            指南与规则
          </button>
        </div>

        {/* Point Allocation Bar */}
        <div className="allocation-controls flex flex-wrap items-center gap-3 mt-4 md:mt-0 md:mr-4">
          {/* Variant Rule Select */}
          <select
            value={variantIdx}
            onChange={e => setVariantIdx(Number(e.target.value))}
            className={`bg-[#2c2923] border border-stone-700 text-stone-300 text-xs font-bold rounded px-2 py-1.5 outline-none focus:border-[#cca74b] transition-all cursor-pointer ${isCompleted ? 'opacity-50 pointer-events-none' : ''}`}
            title={variant.desc}
            disabled={isCompleted}
          >
            {VARIANT_RULES.map((v, i) => (
              <option key={v.name} value={i}>{v.name}</option>
            ))}
          </select>

          {/* Player Count */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-stone-500 font-bold">人数</span>
            <input
              disabled={isCompleted}
              type="number"
              min={1}
              max={10}
              value={playerCount}
              onChange={e => setPlayerCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-9 bg-[#2c2923] border border-stone-700 text-stone-200 text-center text-xs font-bold rounded px-1 py-1 outline-none focus:border-[#cca74b] transition-all"
            />
          </div>

          {/* Investigation Points */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-stone-500 font-bold">调查</span>
            <span className={`font-black text-sm ${pointStats.invUsed > invPointsTotal ? 'text-red-400' : 'text-emerald-400'}`}>
              {pointStats.invUsed}
            </span>
            <span className="text-stone-600">/</span>
            <input
              disabled={isCompleted}
              type="number"
              min={0}
              value={customInvPoints ?? invPointsTotal}
              onChange={e => {
                const v = parseInt(e.target.value);
                setCustomInvPoints(isNaN(v) ? null : Math.max(0, v));
              }}
              className="w-10 bg-[#2c2923] border border-stone-700 text-stone-200 text-center text-xs font-bold rounded px-1 py-1 outline-none focus:border-[#cca74b] transition-all"
              title="调查能力创建点数（可自定义）"
            />
          </div>

          {/* General Points */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-stone-500 font-bold">一般</span>
            <span className={`font-black text-sm ${pointStats.genUsed > genPointsTotal ? 'text-red-400' : 'text-emerald-400'}`}>
              {pointStats.genUsed}
            </span>
            <span className="text-stone-600">/</span>
            <input
              disabled={isCompleted}
              type="number"
              min={0}
              value={customGenPoints ?? genPointsTotal}
              onChange={e => {
                const v = parseInt(e.target.value);
                setCustomGenPoints(isNaN(v) ? null : Math.max(0, v));
              }}
              className="w-10 bg-[#2c2923] border border-stone-700 text-stone-200 text-center text-xs font-bold rounded px-1 py-1 outline-none focus:border-[#cca74b] transition-all"
              title="一般能力创建点数（可自定义）"
            />
          </div>

          {/* Warnings */}
          {pointStats.warnings.length > 0 && (
            <div className="relative group">
              <span className="text-red-400 text-sm font-bold cursor-help">⚠ {pointStats.warnings.length}</span>
              <div className="absolute top-full right-0 mt-1 bg-[#2c2923] border border-red-500/50 rounded p-2 text-xs text-red-300 whitespace-nowrap z-50 hidden group-hover:block shadow-lg">
                {pointStats.warnings.map((w, i) => <div key={i}>{w}</div>)}
              </div>
            </div>
          )}
        </div>

        {/* 导出按钮操作区 / Action Buttons */}
        <div className="action-group flex flex-wrap justify-center gap-2 mt-4 md:mt-0 shrink-0">
          <button onClick={() => setShowPresets(true)} className="mobile-primary flex items-center gap-2 rounded-md bg-[#cca74b] px-4 py-2 text-sm font-bold text-[#1e1c18] shadow-sm hover:bg-[#d4b563]" aria-haspopup="dialog"><Users size={16} />使用预设角色</button>
          <button className="mobile-more" aria-expanded={showMobileTools} onClick={() => setShowMobileTools(value => !value)}>{showMobileTools ? '收起操作' : '更多操作'}</button>
          <div className="group relative">
            <button onClick={() => { refreshSaved(); setShowSaved(value => !value); }} aria-expanded={showSaved} className="flex items-center gap-1 px-3 py-2 bg-[#2c2923] hover:bg-[#cca74b] hover:text-[#1e1c18] border border-stone-700 hover:border-[#cca74b] rounded-md text-stone-300 text-xs font-bold transition-all duration-300 shadow-sm">
              <Download size={14} /> 读取本地
            </button>
            <div className={`absolute right-0 top-full mt-1 bg-[#1e1c18] border border-[#cca74b] rounded-md shadow-lg py-2 min-w-[150px] z-50 ${showSaved ? 'block' : 'hidden'}`}>
              <div className="px-3 pb-1 mb-1 border-b border-stone-700 text-xs text-stone-400 font-bold">本地存卡记录</div>
              {storageError ? <p className="px-3 py-2 text-xs text-red-300 max-w-[260px]">{storageError}</p> : savedCharacters.length === 0 ? (
                <div className="px-3 py-1 text-xs text-stone-500 italic">暂无记录</div>
              ) : (
                savedCharacters.map(char => (
                  <div
                    key={char}
                    className="px-3 py-1.5 text-sm text-stone-200 hover:bg-[#cca74b] hover:text-stone-900 cursor-pointer transition-colors break-words max-w-[200px]"
                    onClick={() => { loadCharacter(char); setShowSaved(false); }}
                  >
                    {char}
                    <button className="block mt-1 text-xs underline text-stone-400" onClick={event => {
                      event.stopPropagation();
                      try {
                        const backup = localStorage.getItem(`${BACKUP_PREFIX}${char}`);
                        if (!backup) { alert('该角色暂时没有上一版备份。'); return; }
                        applySave(backup, false); setPendingDraft(null); setShowSaved(false);
                        setDraftStatus('已载入上一版备份，正式存档未改变。可另取姓名保存或导出 JSON。');
                      } catch { alert('备份读取失败：格式无效或浏览器存储不可用。'); }
                    }}>读取上一版备份</button>
                  </div>
                ))
              )}
            </div>
          </div>
          <button onClick={saveCharacter} className="mobile-primary flex items-center gap-1 px-3 py-2 bg-[#2c2923] hover:bg-emerald-600 hover:text-white border border-stone-700 hover:border-emerald-600 rounded-md text-stone-300 text-xs font-bold transition-all duration-300 shadow-sm relative group" title="保存在浏览器本地，完成车卡后解锁掷骰功能">
            <Save size={14} /> 本地保存
            {!isCompleted && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>

          <label className="px-3 py-2 border border-stone-700 rounded-md text-xs cursor-pointer">导入 JSON<input type="file" accept=".json,application/json" className="hidden" onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; try { applySave(await file.text()); setPendingDraft(null); } catch { alert('导入失败：存档格式无效。'); } }} /></label>
          <button disabled={!isCompleted} onClick={() => { if (confirm('返回建卡修改能力等级？当前能力池将重置，请先保存或导出备份。')) { setIsCompleted(false); setData(prev => ({ ...prev, pools: {} })); } }} className="px-3 py-2 border border-stone-700 rounded-md text-xs disabled:opacity-50">编辑等级</button>
          <button onClick={exportJSON} className="px-3 py-2 border border-stone-700 rounded-md text-xs" title="完整存档备份">JSON</button>
          <button onClick={() => { if (confirm('恢复所有能力池至能力等级？')) setData(prev => ({ ...prev, pools: {} })); }} disabled={!isCompleted} className="px-3 py-2 border border-stone-700 rounded-md text-xs disabled:opacity-50">恢复能力池</button>
          <div className="w-[1px] h-8 bg-stone-700 mx-1"></div>

          <button onClick={exportPNG} className="flex items-center gap-1 px-3 py-2 bg-[#2c2923] hover:bg-blue-600 hover:text-white border border-stone-700 hover:border-blue-600 rounded-md text-stone-300 text-xs font-bold transition-all duration-300 shadow-sm" title="导出长图">
            <ImageIcon size={14} /> 图
          </button>
          <button onClick={exportMD} className="flex items-center gap-1 px-3 py-2 bg-[#2c2923] hover:bg-blue-600 hover:text-white border border-stone-700 hover:border-blue-600 rounded-md text-stone-300 text-xs font-bold transition-all duration-300 shadow-sm" title="导出纯文本 Markdown">
            <FileText size={14} /> MD
          </button>
        </div>
        <p className="mobile-budget">{isCompleted ? '跑团中' : '建卡中'} · 调查 {pointStats.invUsed}/{invPointsTotal} · 一般 {pointStats.genUsed}/{genPointsTotal}</p>
        {pointStats.warnings.length > 0 && <details className="mobile-warnings"><summary>规则提示（{pointStats.warnings.length}）</summary>{pointStats.warnings.map(warning => <p key={warning}>{warning}</p>)}</details>}
      </header>
      <nav className="mobile-nav" aria-label="角色卡页面">
        {([['info', '角色资料'], ['skills', '能力点数'], ['memo', '装备笔记'], ['guide_rules', '指南规则']] as const).map(([tab, label]) => <button key={tab} aria-current={activeTab === tab ? 'page' : undefined} onClick={() => { setActiveTab(tab); setShowMobileTools(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}>{label}</button>)}
      </nav>

      {pendingDraft && <section className="mx-auto max-w-[1100px] m-4 p-4 border border-[#cca74b] rounded bg-[#2c2923]" aria-label="恢复自动草稿">
        <p>发现上次编辑的自动草稿。恢复后可继续编辑，正式存档不会被覆盖。</p>
        <div className="flex flex-wrap gap-3 mt-3">
          <button className="min-h-[44px] px-4 rounded bg-[#cca74b] text-stone-900" onClick={() => {
            try { applySave(pendingDraft, false); setPendingDraft(null); setDraftStatus('已恢复上次草稿'); }
            catch { setStorageError('自动草稿格式无法读取，原始记录已保留。可以从「读取本地」加载正式存档。'); }
          }}>恢复上次草稿</button>
          <button className="min-h-[44px] px-4 border rounded" onClick={() => {
            saveAs(new Blob([pendingDraft], { type: 'application/json' }), 'TOC自动草稿备份.json');
          }}>下载草稿备份</button>
          <button className="min-h-[44px] px-4 border rounded" onClick={() => { setPendingDraft(null); }}>开始新角色</button>
        </div>
      </section>}
      {(storageError || draftStatus) && <p role={storageError ? 'alert' : 'status'} className={`mx-auto max-w-[1100px] px-4 py-2 text-sm ${storageError ? 'text-red-300' : 'text-stone-400'}`}>{storageError || draftStatus}</p>}
      <div className="max-w-[1240px] mx-auto pb-12">
        {/* Sheet Container */}
        <div className="flex justify-center overflow-x-auto px-4 pb-8 relative">
          <div
                        inert={Boolean(pendingDraft)}
                        className="live-sheet w-[1100px] shrink-0 p-8 pb-12 relative font-['Noto_Serif_SC','STSong','SimSun',serif] flex flex-col gap-6 shadow-2xl"
            style={{
              backgroundColor: '#faf8f2',
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
            }}
          >
            {/* Header Removed */}

            {activeTab === 'info' && (
              <InfoPage
                data={data}
                isCompleted={isCompleted}
                setData={setData}
                showOccupations={showOccupations}
                setShowOccupations={setShowOccupations}
                showDrives={showDrives}
                setShowDrives={setShowDrives}
                showPillars={showPillars}
                setShowPillars={setShowPillars}
              />
            )}

            {activeTab === 'skills' && (
              <SkillsPage
                key={characterRevision}
                data={data}
                setData={setData}
                toggleClassSkill={toggleClassSkill}
                canRoll={isCompleted}
              />
            )}

            {activeTab === 'memo' && (
              <MemoPage key={characterRevision} data={data} setData={setData} />
            )}

            {activeTab === 'guide_rules' && (
              <RulesPage />
            )}

          </div>
        </div>
      </div>

      <div aria-hidden="true" style={{ position: 'absolute', left: '-20000px', top: 0, width: 1100, pointerEvents: 'none' }}>
        <div ref={sheetRef} style={{ background: '#faf8f2', padding: 32, color: '#1e1c18' }}>
          <h1 className="text-2xl font-bold mb-6">克苏鲁迷踪角色卡 · {data.name}</h1>
          <InfoPage data={data} setData={setData} isCompleted={isCompleted} showOccupations={false} setShowOccupations={() => {}} showDrives={false} setShowDrives={() => {}} showPillars={false} setShowPillars={() => {}} />
          <SkillsPage data={data} setData={setData} toggleClassSkill={() => {}} canRoll={isCompleted} />
          <MemoPage key={characterRevision} data={data} setData={setData} />
        </div>
      </div>

      {exportImage && <div className="fixed inset-0 bg-black/80 z-[100] overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto bg-stone-900 rounded p-4">
          <div className="flex justify-between gap-4 mb-4 sticky top-0 bg-stone-900 py-2">
            <a href={exportImage} download={`TOC角色卡_${data.name || '未命名'}.png`} className="px-4 py-2 bg-[#cca74b] text-stone-900 rounded font-bold">下载完整角色卡 PNG</a>
            <button onClick={() => setExportImage(null)} className="px-4 py-2 border rounded">关闭预览</button>
          </div>
          <img src={exportImage} alt="完整角色卡导出预览" className="w-full" />
        </div>
      </div>}

      {showPresets && <PresetPicker onClose={() => setShowPresets(false)} onUse={usePreset} currentName={data.name} hasCurrentCharacter={Object.values(data).some(value => typeof value === 'string' && value.trim() !== '') || Object.keys(data.skills).length > 0 || data.equipmentItems.length > 0 || data.sanity !== 4 || data.stability !== 1 || data.health !== 1} />}

      {/* About / Disclaimer Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowAbout(false)}>
          <div className="bg-[#1e1c18] border border-[#cca74b] rounded-lg max-w-lg w-full p-6 text-stone-300 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-[#cca74b] mb-4 border-b border-stone-800 pb-2">免责声明</h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                本工具由 <strong className="text-stone-100">不咕鸟（基德）</strong> 开发。内容基于 <strong className="text-stone-100">克苏鲁迷踪中文规则书</strong> （乐博睿官方代理） ，辅以 AI 技术制作。
              </p>
              <p>
                本工具仅供 <strong className="text-stone-100">个人及亲友团</strong> 快速建卡与跑团交流使用，严禁用于任何商业用途。 本工具与TOC无官方关联，所有官方规则版权归原作者所有。
              </p>

              <div className="mt-6 pt-4 border-t border-stone-800">
                <h3 className="text-lg font-bold text-[#cca74b] mb-2">寻找组织</h3>
                <p>欢迎加入成都本地线下面团秘密基地TRPG俱乐部，寻找你的冒险伙伴！</p>
                <div className="mt-2 space-y-1">
                  <p>🌐 <a href="https://nogubird.top/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">https://nogubird.top/</a></p>
                  <p>💬 QQ群: <span className="text-stone-100 font-mono select-all">691707475</span></p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAbout(false)}
                className="px-4 py-2 bg-[#cca74b] text-[#1e1c18] font-bold rounded hover:bg-[#d4b563] transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
