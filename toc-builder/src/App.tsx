import { useRef, useState, useMemo } from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import {
  ACADEMIC_SKILLS, SOCIAL_SKILLS, TECH_SKILLS, GENERAL_SKILLS,
  OCCUPATIONS, OCCUPATION_DESC, DRIVES, PILLARS, CREATION_GUIDE, RULES_NOTES,
  VARIANT_RULES, INVESTIGATION_SKILLS, parseCreditRange,
  FREE_SANITY, FREE_STABILITY, FREE_HEALTH
} from './data/constants';

function App() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'memo' | 'guide'>('main');
  const [showOccupations, setShowOccupations] = useState(false);
  const [showDrives, setShowDrives] = useState(false);
  const [showPillars, setShowPillars] = useState(false);

  // Point allocation state
  const [variantIdx, setVariantIdx] = useState(0);
  const [playerCount, setPlayerCount] = useState(4);
  const [customInvPoints, setCustomInvPoints] = useState<number | null>(null);
  const [customGenPoints, setCustomGenPoints] = useState<number | null>(null);

  const getRuleNote = (key: string) => {
    const note = RULES_NOTES.find(n => n.startsWith(`${key}.`) || n.startsWith(`${key} `));
    return note ? note.replace(/^(\d+\.|[*] )/, '').trim() : '';
  };

  const [data, setData] = useState<any>({
    player: '',
    name: '',
    avatar: '',
    drive: '',
    occupation: '',
    specialty: '',
    pillar: '',
    points: '',
    sanity: 4,
    stability: 1,
    health: 1,
    sourceOfStability: '',
    notes: '',
    campaignMemo: '',
    equipment: '',
    skills: {}
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => {
      const next = { ...prev, [name]: value };
      if (name === 'occupation') {
        if (OCCUPATION_DESC[value]) {
          next.customClassSkills = [...OCCUPATION_DESC[value].skills];
        }
      }
      return next;
    });
  };

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prev: any) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkill = (skill: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      skills: { ...prev.skills, [skill]: value }
    }));
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

    return { invUsed, genUsed, warnings };
  }, [data, invPointsTotal, genPointsTotal]);


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
- **剩余创建点数:** ${data.points}

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

  const renderStatGrid = (title: string, min: number, max: number, current: number, field: string, footnote?: string) => {
    const cells = [];
    for (let i = min; i <= max; i++) {
      cells.push(
        <div
          key={i}
          onClick={() => setData((prev: any) => ({ ...prev, [field]: i }))}
          className={`border-r border-b border-[#cca74b] flex-1 flex items-center justify-center p-[1px] min-w-[15px] cursor-pointer text-[12px] h-[24px] transition-colors
            ${current === i ? 'bg-[#c89b3c] text-white font-bold' : 'hover:bg-[#f6f1d3]'}`}
        >
          {i}
        </div>
      );
    }

    return (
      <div className="flex items-stretch border-t border-l border-[#cca74b] bg-transparent text-slate-800">
        <div className="flex items-center justify-center border-r border-b border-[#cca74b] bg-[#f8f4e6] font-bold text-[#5c4a21] text-[13px] shrink-0 w-[60px] tracking-widest">
          {title}{footnote && <sup className="text-[10px] cursor-help text-[#c89b3c] ml-[2px]" title={getRuleNote(footnote)}>{footnote}</sup>}
        </div>
        <div className="flex flex-wrap flex-1">
          {cells}
        </div>
      </div>
    );
  };

  const renderSkillName = (name: string) => {
    let isClassSkill = false;
    if (data.customClassSkills !== undefined && data.customClassSkills !== null) {
      isClassSkill = data.customClassSkills.includes(name);
    } else if (data.occupation && OCCUPATION_DESC[data.occupation]) {
      isClassSkill = OCCUPATION_DESC[data.occupation].skills.includes(name);
    }

    let content;
    const matchNum = name.match(/^(.*?)\((\d+)\)$/);
    if (matchNum) {
      content = <>{matchNum[1]}<sup className="text-[9px] cursor-help text-[#c89b3c]" title={getRuleNote(matchNum[2])}>{matchNum[2]}</sup></>;
    } else {
      const matchStar = name.match(/^(.*?)\*$/);
      if (matchStar) {
        content = <>{matchStar[1]}<sup className="text-[10px] cursor-help text-[#c89b3c]" title={getRuleNote('*')}>*</sup></>;
      } else {
        content = name;
      }
    }

    if (isClassSkill) {
      return (
        <span
          className="font-bold text-[#b54a22] flex items-center gap-[2px] cursor-pointer hover:opacity-75"
          onClick={() => toggleClassSkill(name)}
        >
          <span className="text-[10px] pointer-events-none">✦</span>{content}
        </span>
      );
    }
    return (
      <span
        className="cursor-pointer text-[#5c4a21] hover:text-[#b54a22] transition-colors"
        onClick={() => toggleClassSkill(name)}
      >
        {content}
      </span>
    );
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
            onClick={() => setActiveTab('main')}
            className={`px-4 xl:px-6 py-2 text-[14px] font-bold rounded-md flex items-center gap-2 transition-all duration-300 ${activeTab === 'main' ? 'bg-[#cca74b] text-[#1e1c18] shadow-md' : 'text-stone-400 hover:text-stone-100'}`}
          >
            档案卷宗
          </button>
          <button
            onClick={() => setActiveTab('memo')}
            className={`px-4 xl:px-6 py-2 text-[14px] font-bold rounded-md flex items-center gap-2 transition-all duration-300 ${activeTab === 'memo' ? 'bg-[#cca74b] text-[#1e1c18] shadow-md' : 'text-stone-400 hover:text-stone-100'}`}
          >
            备忘录与装备
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
            className="bg-[#2c2923] border border-stone-700 text-stone-300 text-xs font-bold rounded px-2 py-1.5 outline-none focus:border-[#cca74b] transition-all cursor-pointer"
            title={variant.desc}
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
        <div className="flex gap-3 mt-4 md:mt-0 shrink-0">
          <button onClick={exportPNG} className="flex items-center gap-2 px-4 py-2 bg-[#2c2923] hover:bg-[#cca74b] hover:text-[#1e1c18] border border-stone-700 hover:border-[#cca74b] rounded-md text-stone-300 text-sm font-bold transition-all duration-300 shadow-sm">
            <ImageIcon size={16} /> 导出图像
          </button>
          <button onClick={exportMD} className="flex items-center gap-2 px-4 py-2 bg-[#2c2923] hover:bg-[#cca74b] hover:text-[#1e1c18] border border-stone-700 hover:border-[#cca74b] rounded-md text-stone-300 text-sm font-bold transition-all duration-300 shadow-sm">
            <FileText size={16} /> 导出 MD
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

            {activeTab === 'main' && (
              <>
                {/* Bottom Section: Left and Right Columns */}
                <div className="flex gap-6">
                  {/* Left Column (Stats + Info + Occupation) */}
                  <div className="w-[520px] shrink-0 flex flex-col gap-6">

                    {/* Portrait & Basic Info block */}
                    <div className="flex gap-4">
                      {/* Portrait (Left) */}
                      <div className="flex justify-center">
                        <div className="w-[140px] shrink-0 flex flex-col items-center">
                          <div className="text-[15px] font-bold text-[#5c4a21] mb-1 mr-auto tracking-widest pl-1">玩 家：</div>
                          <div className="w-full h-full min-h-[160px] border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/40 shadow-inner flex flex-col group relative">
                            <label className="flex-1 cursor-pointer overflow-hidden relative flex flex-col items-center justify-center w-full">
                              {data.avatar ? (
                                <img src={data.avatar} alt="Avatar" className="w-[134px] h-[150px] object-cover absolute inset-0" />
                              ) : (
                                <div className="text-[#daaa39] group-hover:text-[#c89b3c] flex flex-col items-center transition-colors">
                                  <ImageIcon size={28} className="mb-2" />
                                  <span className="text-xs font-bold font-sans">点击上传</span>
                                </div>
                              )}
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            <input type="text" name="player" value={data.player} onChange={handleInput} className="w-full bg-white/60 border-t-[3px] border-[#daaa39] text-center outline-none text-slate-800 font-bold p-1 text-sm shrink-0 font-sans z-10 focus:bg-[#f6f1d3] transition-all" placeholder="名字" />
                          </div>
                        </div>
                      </div>

                      {/* Basic Info (Right) */}
                      <div className="flex-1 flex flex-col bg-white/50 border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] p-4 shadow-sm relative">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                        <div className="flex flex-col justify-between h-full space-y-[4px]">
                          {[
                            { label: '调查员姓名', name: 'name', type: 'text' },
                            { label: '动 力', name: 'drive', type: 'text', placeholder: '点击选择或输入' },
                            { label: '职 业', name: 'occupation', footnote: '2', type: 'text', placeholder: '点击选择或输入' },
                            { label: '心智支柱', name: 'pillar', type: 'text', placeholder: '点击选择或输入' },
                            { label: '剩余点数', name: 'points', type: 'text' }
                          ].map(field => (
                            <div key={field.name} className="flex text-[15px] items-center relative">
                              <span className="text-[#5c4a21] font-bold w-[90px] tracking-widest leading-none shrink-0">{field.label}{field.footnote && <sup className="cursor-help text-[#c89b3c]" title={getRuleNote(field.footnote)}>{field.footnote}</sup>}：</span>
                              {field.name === 'occupation' ? (
                                <div className="flex-1 min-w-0 relative">
                                  <input
                                    type="text"
                                    name={field.name}
                                    value={data[field.name]}
                                    onChange={handleInput}
                                    onClick={() => setShowOccupations(!showOccupations)}
                                    onBlur={() => setTimeout(() => setShowOccupations(false), 200)}
                                    placeholder={field.placeholder}
                                    className="w-full bg-transparent border-b border-[#daaa39] outline-none text-slate-800 px-1 font-medium pb-[2px] text-sm focus:bg-[#f6f1d3]/80 focus:border-[#8b6d2a] transition-all cursor-pointer"
                                  />
                                  {showOccupations && (
                                    <ul className="absolute z-50 left-0 right-0 top-[100%] mt-1 max-h-[220px] overflow-y-auto bg-[#faf8f2] border-[2px] border-[#daaa39] shadow-lg rounded-sm text-sm">
                                      {OCCUPATIONS.map(occ => (
                                        <li
                                          key={occ}
                                          onMouseDown={(e) => {
                                            e.preventDefault(); // Prevents input onBlur from firing before click registers
                                            const newOcc = occ === "自定义..." ? "" : occ;
                                            setData((prev: any) => ({ ...prev, [field.name]: newOcc, customClassSkills: OCCUPATION_DESC[newOcc] ? [...OCCUPATION_DESC[newOcc].skills] : [] }));
                                            setShowOccupations(false);
                                          }}
                                          className="px-3 py-1.5 text-slate-800 hover:bg-[#cca74b] hover:text-white cursor-pointer font-bold transition-colors"
                                        >
                                          {occ}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ) : field.name === 'drive' ? (
                                <div className="flex-1 min-w-0 relative">
                                  <input
                                    type="text"
                                    name={field.name}
                                    value={data[field.name]}
                                    onChange={handleInput}
                                    onClick={() => setShowDrives(!showDrives)}
                                    onBlur={() => setTimeout(() => setShowDrives(false), 200)}
                                    placeholder={field.placeholder}
                                    className="w-full bg-transparent border-b border-[#daaa39] outline-none text-slate-800 px-1 font-medium pb-[2px] text-sm focus:bg-[#f6f1d3]/80 focus:border-[#8b6d2a] transition-all cursor-pointer"
                                  />
                                  {showDrives && (
                                    <ul className="absolute z-50 left-0 right-0 top-[100%] mt-1 max-h-[220px] overflow-y-auto bg-[#faf8f2] border-[2px] border-[#daaa39] shadow-lg rounded-sm text-sm">
                                      {DRIVES.map(d => (
                                        <li
                                          key={d.name}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            setData((prev: any) => ({ ...prev, [field.name]: d.name }));
                                            setShowDrives(false);
                                          }}
                                          className="px-3 py-1.5 text-slate-800 hover:bg-[#cca74b] hover:text-white cursor-pointer font-bold transition-colors"
                                        >
                                          {d.name}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ) : field.name === 'pillar' ? (
                                <div className="flex-1 min-w-0 relative">
                                  <input
                                    type="text"
                                    name={field.name}
                                    value={data[field.name]}
                                    onChange={handleInput}
                                    onClick={() => setShowPillars(!showPillars)}
                                    onBlur={() => setTimeout(() => setShowPillars(false), 200)}
                                    placeholder={field.placeholder}
                                    className="w-full bg-transparent border-b border-[#daaa39] outline-none text-slate-800 px-1 font-medium pb-[2px] text-sm focus:bg-[#f6f1d3]/80 focus:border-[#8b6d2a] transition-all cursor-pointer"
                                  />
                                  {showPillars && (
                                    <ul className="absolute z-50 left-0 right-0 top-[100%] mt-1 max-h-[220px] overflow-y-auto bg-[#faf8f2] border-[2px] border-[#daaa39] shadow-lg rounded-sm text-sm">
                                      {PILLARS.map(p => (
                                        <li
                                          key={p}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            setData((prev: any) => ({ ...prev, [field.name]: p }));
                                            setShowPillars(false);
                                          }}
                                          className="px-3 py-1.5 text-slate-800 hover:bg-[#cca74b] hover:text-white cursor-pointer transition-colors leading-snug"
                                        >
                                          {p}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  name={field.name}
                                  value={data[field.name]}
                                  onChange={handleInput}
                                  placeholder={field.placeholder}
                                  className="flex-1 min-w-0 bg-transparent border-b border-[#daaa39] outline-none text-slate-800 px-1 font-medium pb-[2px] text-sm focus:bg-[#f6f1d3]/80 focus:border-[#8b6d2a] transition-all"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats Horizontal Block */}
                    <div className="border-[3px] border-[#daaa39] p-2 pt-[10px] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 shadow-sm relative flex flex-col gap-2.5">
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                      {renderStatGrid('心智', 0, 15, data.sanity, 'sanity', '1')}
                      <div className="text-center text-[13px] text-[#5c4a21] font-bold my-[-8px] tracking-widest">命中阈值<sup className="text-[10px] cursor-help text-[#c89b3c]" title={getRuleNote('3')}>3</sup></div>
                      {renderStatGrid('坚毅', -12, 15, data.stability, 'stability')}
                      {renderStatGrid('健康', -12, 15, data.health, 'health')}
                    </div>

                    {/* Contacts & Notes Split */}
                    <div className="flex gap-4 h-[100px]">
                      <div className="flex-1 border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 flex flex-col relative">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                        <div className="p-[4px] px-2 font-bold text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6] text-[13px] tracking-widest text-center">坚毅之源</div>
                        <textarea
                          name="sourceOfStability"
                          value={data.sourceOfStability}
                          onChange={handleInput}
                          className="flex-1 w-full bg-transparent outline-none p-2 resize-none text-slate-800 text-[13px] leading-snug focus:bg-[#f6f1d3]/80 transition-all font-serif"
                          placeholder="填写坚毅之源..."
                        />
                      </div>
                      <div className="flex-1 border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 flex flex-col relative">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                        <div className="p-[4px] px-2 font-bold text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6] text-[13px] tracking-widest text-center">联系人</div>
                        <textarea
                          name="notes"
                          value={data.notes}
                          onChange={handleInput}
                          className="flex-1 w-full bg-transparent outline-none p-2 resize-none text-slate-800 text-[13px] leading-snug focus:bg-[#f6f1d3]/80 transition-all font-serif"
                          placeholder="填写重要联系人..."
                        />
                      </div>
                    </div>

                    {/* Drive Description Block */}
                    {(() => {
                      const driveData = DRIVES.find(d => d.name === data.drive);
                      if (!driveData) return null;
                      return (
                        <div className="border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/80 p-4 shadow-sm relative">
                          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>
                          <h2 className="text-[15px] font-bold text-[#5c4a21] border-b border-[#daaa39] pb-1 mb-2 tracking-widest">
                            动力：{driveData.name}
                          </h2>
                          <div className="text-slate-800 space-y-1 text-[12px] leading-relaxed font-serif text-justify">
                            <p>{driveData.desc}</p>
                            <p><strong className="text-[#5c4a21]">建议职业：</strong>{driveData.recommended}</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Occupation Description Block inside Left Column */}
                    {data.occupation && OCCUPATION_DESC[data.occupation] && (
                      <div className="border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/80 p-4 shadow-sm relative flex-1">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                        <h2 className="text-[15px] font-bold text-[#5c4a21] border-b border-[#daaa39] pb-1 mb-2 tracking-widest">
                          {data.occupation} - 职业备注
                        </h2>
                        <div className="text-slate-800 space-y-2 whitespace-pre-wrap text-[12px] leading-relaxed font-serif text-justify border-t border-[#daaa39]/50 pt-2 mt-2">
                          <p>{OCCUPATION_DESC[data.occupation].desc}</p>
                          <p><strong className="text-[#5c4a21]">职业能力：</strong>{OCCUPATION_DESC[data.occupation].parsedSkillsText}</p>
                          <p><strong className="text-[#5c4a21]">信誉等级：</strong>{OCCUPATION_DESC[data.occupation].credit}</p>
                          <p><strong className="text-[#5c4a21]">特殊规则：</strong>{OCCUPATION_DESC[data.occupation].special}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column (Skills) */}
                  <div className="flex-1 space-y-4">
                    <div className="border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 shadow-sm relative text-[13px] h-full">
                      <div className="flex h-full">

                        {/* 学术能力 & 一般能力 (Part 1) */}
                        <div className="flex-1 border-r border-[#daaa39] flex flex-col">
                          <div className="p-[4px] font-bold text-center text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6] tracking-widest text-sm">学术能力</div>
                          <div className="p-1.5 space-y-0">
                            {ACADEMIC_SKILLS.map(skill => (
                              <div key={skill} className="flex group hover:bg-[#f6f1d3]/50 items-center pr-2">
                                <span className="w-[84px] text-[#5c4a21] leading-none shrink-0">{renderSkillName(skill)}</span>
                                <input value={data.skills[skill] || ''} onChange={e => handleSkill(skill, e.target.value)} className="w-12 ml-auto bg-transparent border-b border-[#e5cd8d] outline-none text-center text-slate-800 text-xs py-[2px] focus:bg-[#f6f1d3] focus:border-[#8b6d2a] transition-all" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 社交能力 & 技术能力 */}
                        <div className="flex-1 border-r border-[#daaa39] flex flex-col">
                          <div className="p-[4px] font-bold text-center text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6] tracking-widest text-sm">社交能力</div>
                          <div className="p-1.5 space-y-0 border-b border-[#daaa39] pb-2">
                            {SOCIAL_SKILLS.map(skill => (
                              <div key={skill} className="flex group hover:bg-[#f6f1d3]/50 items-center pr-2">
                                <span className="w-[84px] text-[#5c4a21] leading-none shrink-0">{renderSkillName(skill)}</span>
                                <input value={data.skills[skill] || ''} onChange={e => handleSkill(skill, e.target.value)} className="w-12 ml-auto bg-transparent border-b border-[#e5cd8d] outline-none text-center text-slate-800 text-xs py-[2px] focus:bg-[#f6f1d3] focus:border-[#8b6d2a] transition-all" />
                              </div>
                            ))}
                          </div>
                          <div className="p-[4px] font-bold text-center text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6] tracking-widest text-sm">技术能力</div>
                          <div className="p-1.5 space-y-0">
                            {TECH_SKILLS.map(skill => (
                              <div key={skill} className="flex group hover:bg-[#f6f1d3]/50 items-center pr-2">
                                <span className="w-[84px] text-[#5c4a21] leading-none shrink-0">{renderSkillName(skill)}</span>
                                <input value={data.skills[skill] || ''} onChange={e => handleSkill(skill, e.target.value)} className="w-12 ml-auto bg-transparent border-b border-[#e5cd8d] outline-none text-center text-slate-800 text-xs py-[2px] focus:bg-[#f6f1d3] focus:border-[#8b6d2a] transition-all" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 一般能力 */}
                        <div className="flex-1 flex flex-col">
                          <div className="p-[4px] font-bold text-center text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6] tracking-widest text-sm">一般能力</div>
                          <div className="p-1.5 space-y-0">
                            {GENERAL_SKILLS.map(skill => (
                              <div key={skill} className="flex group hover:bg-[#f6f1d3]/50 items-center pr-2">
                                <span className="w-[84px] text-[#5c4a21] leading-none shrink-0">{renderSkillName(skill)}</span>
                                <input value={data.skills[skill] || ''} onChange={e => handleSkill(skill, e.target.value)} className="w-12 ml-auto bg-transparent border-b border-[#e5cd8d] outline-none text-center text-slate-800 text-xs py-[2px] focus:bg-[#f6f1d3] focus:border-[#8b6d2a] transition-all" />
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'memo' && (
              <div className="flex flex-row gap-6 w-full min-h-[800px]">
                {/* 战役备忘录 */}
                <div className="border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 p-6 flex flex-col flex-1 relative shadow-sm">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                  <h2 className="text-lg font-bold text-[#5c4a21] border-b border-[#daaa39] pb-1 mb-4 tracking-widest text-center">战役备忘录（游戏记录、NPC、线索等）</h2>
                  <textarea
                    name="campaignMemo"
                    value={data.campaignMemo}
                    onChange={handleInput}
                    className="flex-1 w-full bg-transparent outline-none p-2 resize-none text-slate-800 text-[14px] leading-relaxed font-serif focus:bg-[#f6f1d3]/80 transition-all"
                    placeholder="在此记录冒险中的重要线索、遇到的NPC、以及其他细节..."
                  />
                </div>

                {/* 装备信息 */}
                <div className="border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 p-6 flex flex-col flex-1 relative shadow-sm">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                  <h2 className="text-lg font-bold text-[#5c4a21] border-b border-[#daaa39] pb-1 mb-4 tracking-widest text-center">装备与财物</h2>
                  <textarea
                    name="equipment"
                    value={data.equipment}
                    onChange={handleInput}
                    className="flex-1 w-full bg-transparent outline-none p-2 resize-none text-slate-800 text-[14px] leading-relaxed font-serif focus:bg-[#f6f1d3]/80 transition-all"
                    placeholder="武器、道具、资产、借条等..."
                  />
                </div>
              </div>
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
