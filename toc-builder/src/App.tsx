import { useRef, useState, useMemo, useEffect } from 'react';
import { FileText, Image as ImageIcon, Save, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import {
  ACADEMIC_SKILLS, SOCIAL_SKILLS, TECH_SKILLS, GENERAL_SKILLS,
  OCCUPATION_DESC, CREATION_GUIDE,
  VARIANT_RULES, INVESTIGATION_SKILLS, parseCreditRange,
  FREE_SANITY, FREE_STABILITY, FREE_HEALTH
} from './data/constants';
import InfoPage from './components/InfoPage';
import SkillsPage from './components/SkillsPage';
import MemoPage from './components/MemoPage';

function App() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'memo' | 'guide'>('info');
  const [showOccupations, setShowOccupations] = useState(false);
  const [showDrives, setShowDrives] = useState(false);
  const [showPillars, setShowPillars] = useState(false);

  // Point allocation state
  const [variantIdx, setVariantIdx] = useState(0);
  const [playerCount, setPlayerCount] = useState(4);
  const [customInvPoints, setCustomInvPoints] = useState<number | null>(null);
  const [customGenPoints, setCustomGenPoints] = useState<number | null>(null);

  // App-level Creation state
  const [isCompleted, setIsCompleted] = useState(false);
  const [frozenStats, setFrozenStats] = useState({ invUsed: 0, genUsed: 0 });

  const [data, setData] = useState<any>({
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
    setData((prev: any) => {
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
      const rawLevel = parseInt(data.skills[skill] || '0') || 0;
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

    // Also count stat grid values for sanity/stability/health if not in skills
    if (!data.skills['心智(9)']) {
      genUsed += Math.max(0, (data.sanity || 0) - FREE_SANITY);
      generalLevels.push({ name: '心智', level: data.sanity || 0 });
    }
    if (!data.skills['坚毅(9)']) {
      genUsed += Math.max(0, (data.stability || 0) - FREE_STABILITY);
      generalLevels.push({ name: '坚毅', level: data.stability || 0 });
    }
    if (!data.skills['健康(9)']) {
      genUsed += Math.max(0, (data.health || 0) - FREE_HEALTH);
      generalLevels.push({ name: '健康', level: data.health || 0 });
    }

    // Validation
    if (invUsed > invPointsTotal) warnings.push(`调查能力点数超支 ${invUsed - invPointsTotal} 点`);
    if (genUsed > genPointsTotal) warnings.push(`一般能力点数超支 ${genUsed - genPointsTotal} 点`);

    // Second-highest general ability must be >= half of highest
    generalLevels.sort((a, b) => b.level - a.level);
    if (generalLevels.length >= 2 && generalLevels[0].level > 0) {
      const half = Math.floor(generalLevels[0].level / 2);
      if (generalLevels[1].level < half) {
        warnings.push(`一般能力第二高(${generalLevels[1].name}:${generalLevels[1].level})不得低于最高(${generalLevels[0].name}:${generalLevels[0].level})的一半(${half})`);
      }
    }

    // Sanity cap
    const cthulhuLevel = parseInt(data.skills['克苏鲁神话(4)'] || '0') || 0;
    const sanityCap = Math.min(10, 10 - cthulhuLevel);
    const currentSanity = parseInt(data.skills['心智(9)'] || '0') || data.sanity || 0;
    if (currentSanity > sanityCap) warnings.push(`心智(${currentSanity})超过上限(${sanityCap})`);

    // Health/Stability cap
    const currentHealth = parseInt(data.skills['健康(9)'] || '0') || data.health || 0;
    const currentStability = parseInt(data.skills['坚毅(9)'] || '0') || data.stability || 0;
    if (currentHealth > 12) warnings.push(`健康(${currentHealth})超过上限(12)`);
    if (currentStability > 12) warnings.push(`坚毅(${currentStability})超过上限(12)`);

    // If completed, freeze the displayed used points, but continue calculating cap warnings
    if (isCompleted) {
      return { invUsed: frozenStats.invUsed, genUsed: frozenStats.genUsed, warnings };
    }

    return { invUsed, genUsed, warnings };
  }, [data, invPointsTotal, genPointsTotal, isCompleted, frozenStats]);

  // === Save/Load functionality ===
  const [savedCharacters, setSavedCharacters] = useState<string[]>([]);

  useEffect(() => {
    // Load list of saved chars on mount
    const keys = Object.keys(localStorage).filter(k => k.startsWith('toc_char_'));
    setSavedCharacters(keys.map(k => k.replace('toc_char_', '')));
  }, []);

  const saveCharacter = () => {
    if (!data.name) {
      alert("请至少填写调查员姓名再保存！");
      return;
    }

    // If not completed, prompt warning
    if (!isCompleted) {
      // Live recalculate to check exact completeness
      const cStats = pointStats; // already memoized
      if (cStats.invUsed !== invPointsTotal || cStats.genUsed !== genPointsTotal || cStats.warnings.length > 0) {
        const confirmComplete = confirm("当前能力点数尚未完全分配完毕（或已透支），或存在警告。\\n是否仍然确定车卡完成（进入游戏阶段，且检定能力将会解锁）？\\n\\n点击“取消”将以未完成草稿状态保存。");
        if (confirmComplete) {
          setIsCompleted(true);
          setFrozenStats({ invUsed: cStats.invUsed, genUsed: cStats.genUsed });
          // Data will save with the new states on next render, but we can bundle it manually now:
          const savePayload = { data, isCompleted: true, frozenStats: { invUsed: cStats.invUsed, genUsed: cStats.genUsed } };
          localStorage.setItem(`toc_char_${data.name}`, JSON.stringify(savePayload));
          setSavedCharacters(prev => Array.from(new Set([...prev, data.name])));
          alert("已确认为游戏阶段并保存本地！");
          return;
        }
      } else {
        // Exactly matched points
        setIsCompleted(true);
        setFrozenStats({ invUsed: cStats.invUsed, genUsed: cStats.genUsed });
        const savePayload = { data, isCompleted: true, frozenStats: { invUsed: cStats.invUsed, genUsed: cStats.genUsed } };
        localStorage.setItem(`toc_char_${data.name}`, JSON.stringify(savePayload));
        setSavedCharacters(prev => Array.from(new Set([...prev, data.name])));
        alert("建卡完成！能力检定已解锁，配点栏已锁定，存档已保存在本地。");
        return;
      }
    }

    // Save as draft or regular update
    const payload = { data, isCompleted, frozenStats };
    localStorage.setItem(`toc_char_${data.name}`, JSON.stringify(payload));
    setSavedCharacters(prev => Array.from(new Set([...prev, data.name])));
    alert(isCompleted ? "角色进度保存成功（本地）。" : "角色草稿保存成功（本地）。在点数完美分配完毕前，将无法使用投掷检定工具。");
  };

  const loadCharacter = (charName: string) => {
    const raw = localStorage.getItem(`toc_char_${charName}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.data) {
          setData(parsed.data);
          setIsCompleted(parsed.isCompleted || false);
          setFrozenStats(parsed.frozenStats || { invUsed: 0, genUsed: 0 });
          alert("读取成功！");
        }
      } catch (e) {
        console.error(e);
        alert("读取失败：存档损坏。");
      }
    }
  };


  const exportPNG = async () => {
    if (!sheetRef.current) return;
    const canvas = await html2canvas(sheetRef.current, { scale: 2, useCORS: true });
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, `TOC角色卡_${data.name || '未命名'}.png`);
    });
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
        .filter(([_, v]) => v !== '')
        .map(([k, v]) => `- **${k}:** ${v}`)
        .join('\n')}

## 坚毅之源
${data.sourceOfStability}

## 联系人
${data.notes}
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `TOC角色卡_${data.name || '未命名'}.md`);
  };

  return (
    <div className="min-h-screen bg-[#1e1c18] font-sans text-stone-100 selection:bg-[#cca74b] selection:text-white">
      {/* 悬浮顶栏 / Sticky Header (提高了操作便捷性) */}
      <header className="sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center bg-[#1e1c18]/90 backdrop-blur-md shadow-lg px-6 py-4 border-b border-stone-800 mb-8 w-full">
        <div className="flex-1 flex justify-center md:justify-start">
          <h1 className="text-3xl md:text-4xl leading-none font-black text-[#cca74b] tracking-[0.2em] ml-[0.2em]" style={{ fontFamily: '"STKaiti", "KaiTi", serif', textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
            克苏鲁迷踪
          </h1>
        </div>

        {/* 现代优雅的活页切换卡 / Sleek Tabs */}
        <div className="flex flex-wrap bg-[#2c2923] p-[4px] rounded-lg mt-4 md:mt-0 shadow-inner md:mr-4 border border-stone-700/50">
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
            onClick={() => setActiveTab('guide')}
            className={`px-4 xl:px-6 py-2 text-[14px] font-bold rounded-md flex items-center gap-2 transition-all duration-300 ${activeTab === 'guide' ? 'bg-[#cca74b] text-[#1e1c18] shadow-md' : 'text-stone-400 hover:text-stone-100'}`}
          >
            创建指南
          </button>
        </div>

        {/* Point Allocation Bar */}
        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0 md:mr-4">
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
              type="number"
              min={0}
              value={customInvPoints ?? invPointsTotal}
              onChange={e => {
                const v = parseInt(e.target.value);
                setCustomInvPoints(isNaN(v) ? null : v);
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
              type="number"
              min={0}
              value={customGenPoints ?? genPointsTotal}
              onChange={e => {
                const v = parseInt(e.target.value);
                setCustomGenPoints(isNaN(v) ? null : v);
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
        <div className="flex gap-2 mt-4 md:mt-0 shrink-0">
          <div className="group relative">
            <button className="flex items-center gap-1 px-3 py-2 bg-[#2c2923] hover:bg-[#cca74b] hover:text-[#1e1c18] border border-stone-700 hover:border-[#cca74b] rounded-md text-stone-300 text-xs font-bold transition-all duration-300 shadow-sm">
              <Download size={14} /> 读取本地
            </button>
            <div className="absolute right-0 top-full mt-1 bg-[#1e1c18] border border-[#cca74b] rounded-md shadow-lg py-2 min-w-[150px] z-50 hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="px-3 pb-1 mb-1 border-b border-stone-700 text-xs text-stone-400 font-bold">本地存卡记录</div>
              {savedCharacters.length === 0 ? (
                <div className="px-3 py-1 text-xs text-stone-500 italic">暂无记录</div>
              ) : (
                savedCharacters.map(char => (
                  <div
                    key={char}
                    className="px-3 py-1.5 text-sm text-stone-200 hover:bg-[#cca74b] hover:text-stone-900 cursor-pointer transition-colors break-words max-w-[200px]"
                    onClick={() => loadCharacter(char)}
                  >
                    {char}
                  </div>
                ))
              )}
            </div>
          </div>
          <button onClick={saveCharacter} className="flex items-center gap-1 px-3 py-2 bg-[#2c2923] hover:bg-emerald-600 hover:text-white border border-stone-700 hover:border-emerald-600 rounded-md text-stone-300 text-xs font-bold transition-all duration-300 shadow-sm relative group" title="保存在浏览器本地，完成车卡后解锁掷骰功能">
            <Save size={14} /> 本地保存
            {!isCompleted && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>

          <div className="w-[1px] h-8 bg-stone-700 mx-1"></div>

          <button onClick={exportPNG} className="flex items-center gap-1 px-3 py-2 bg-[#2c2923] hover:bg-blue-600 hover:text-white border border-stone-700 hover:border-blue-600 rounded-md text-stone-300 text-xs font-bold transition-all duration-300 shadow-sm" title="导出长图">
            <ImageIcon size={14} /> 图
          </button>
          <button onClick={exportMD} className="flex items-center gap-1 px-3 py-2 bg-[#2c2923] hover:bg-blue-600 hover:text-white border border-stone-700 hover:border-blue-600 rounded-md text-stone-300 text-xs font-bold transition-all duration-300 shadow-sm" title="导出纯文本 Markdown">
            <FileText size={14} /> MD
          </button>
        </div>
      </header>

      <div className="max-w-[1240px] mx-auto pb-12">
        {/* Sheet Container */}
        <div className="flex justify-center overflow-x-auto px-4 pb-8 relative">
          <div
            ref={sheetRef}
            className="w-[1100px] shrink-0 p-8 pb-12 relative font-['Noto_Serif_SC','STSong','SimSun',serif] flex flex-col gap-6 shadow-2xl"
            style={{
              backgroundColor: '#faf8f2',
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
            }}
          >
            {/* Header Removed */}

            {activeTab === 'info' && (
              <InfoPage
                data={data}
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
                data={data}
                setData={setData}
                toggleClassSkill={toggleClassSkill}
                canRoll={isCompleted}
              />
            )}

            {activeTab === 'memo' && (
              <MemoPage data={data} setData={setData} />
            )}

            {activeTab === 'guide' && (
              <div className="flex flex-col gap-6 w-full min-h-[800px]">
                <div className="border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 p-12 flex flex-col flex-1 relative shadow-sm">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                  <h2 className="text-2xl font-bold text-[#5c4a21] border-b-2 border-[#daaa39] pb-4 mb-8 tracking-[0.2em] text-center font-['STKaiti']">创建调查员简要说明</h2>
                  <div className="text-[16px] text-slate-800 space-y-6 text-justify font-serif leading-[1.8] px-4 md:px-12">
                    {CREATION_GUIDE.map((p, i) => <p key={i} className="indent-[2em]">{p}</p>)}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
