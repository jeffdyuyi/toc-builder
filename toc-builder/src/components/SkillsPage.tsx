import { useState } from 'react';
import DualPage, { GoldCard } from './DualPage';
import { ACADEMIC_SKILLS, SOCIAL_SKILLS, TECH_SKILLS, GENERAL_SKILLS, OCCUPATION_DESC, RULES_NOTES } from '../data/constants';
import { SKILL_DESCRIPTIONS } from '../data/skillDescriptions';

interface SkillsPageProps {
    data: any;
    setData: (fn: (prev: any) => any) => void;
    toggleClassSkill: (skill: string) => void;
}

export default function SkillsPage({ data, setData, toggleClassSkill }: SkillsPageProps) {
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [spentPoints, setSpentPoints] = useState<number>(0);
    const [diceResult, setDiceResult] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);

    const handleSkill = (skillName: string, value: string) => {
        setData((prev: any) => ({
            ...prev,
            skills: { ...prev.skills, [skillName]: value }
        }));
    };

    const getSkillLabel = (name: string) => {
        const matchNum = name.match(/^(.*?)\((\d+)\)$/);
        if (matchNum) return matchNum[1];
        const matchStar = name.match(/^(.*?)\*$/);
        if (matchStar) return matchStar[1];
        return name;
    };

    const currentSkillValue = selectedSkill ? (parseInt(data.skills[selectedSkill] || '0') || 0) : 0;

    const handleRoll = () => {
        if (!selectedSkill) return;
        setIsRolling(true);
        setDiceResult(null);

        // Spend points immediately
        if (spentPoints > 0) {
            handleSkill(selectedSkill, Math.max(0, currentSkillValue - spentPoints).toString());
        }

        // Simulate dice roll animation
        setTimeout(() => {
            const result = Math.floor(Math.random() * 6) + 1;
            setDiceResult(result);
            setIsRolling(false);
            setSpentPoints(0); // Reset spent points for next roll
        }, 600);
    };

    const renderSkillName = (name: string) => {
        let isClassSkill = false;
        if (data.customClassSkills !== undefined && data.customClassSkills !== null) {
            isClassSkill = data.customClassSkills.includes(name);
        } else if (data.occupation && OCCUPATION_DESC[data.occupation]) {
            isClassSkill = OCCUPATION_DESC[data.occupation].skills.includes(name);
        }

        let content = name;
        const matchNum = name.match(/^(.*?)\((\d+)\)$/);
        if (matchNum) {
            content = matchNum[1];
        } else {
            const matchStar = name.match(/^(.*?)\*$/);
            if (matchStar) {
                content = matchStar[1];
            }
        }

        return (
            <span
                className={`cursor-pointer transition-colors hover:text-[#b54a22] flex items-center gap-[2px] ${isClassSkill ? 'font-bold text-[#b54a22]' : 'text-[#5c4a21]'}`}
                onClick={() => toggleClassSkill(name)}
                title="点击标记为本职能力"
            >
                {isClassSkill && <span className="text-[10px] pointer-events-none">✦</span>}
                {content}
            </span>
        );
    };

    const renderSkillGroup = (title: string, skills: string[]) => (
        <div className="flex-1 flex flex-col">
            <div className="p-[4px] font-bold text-center text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6] tracking-widest text-sm">{title}</div>
            <div className="p-1 space-y-0">
                {skills.map(skill => (
                    <div key={skill}
                        className={`flex group items-center pr-2 py-[1px] pl-1 ${selectedSkill === skill ? 'bg-[#f6f1d3]' : 'hover:bg-[#f6f1d3]/50'}`}
                    >
                        <button
                            className={`w-5 h-5 flex items-center justify-center rounded shrink-0 mr-1 opacity-50 hover:opacity-100 hover:bg-[#daaa39] hover:text-white transition-all text-sm ${selectedSkill === skill ? 'opacity-100 text-[#b54a22]' : 'text-[#daaa39]'}`}
                            onClick={() => setSelectedSkill(skill)}
                            title="查看详情与检定"
                        >
                            🎲
                        </button>
                        <span className="w-[84px] leading-none shrink-0 flex items-center">
                            {renderSkillName(skill)}
                        </span>
                        <input
                            value={data.skills[skill] || ''}
                            onChange={e => handleSkill(skill, e.target.value)}
                            className="w-10 ml-auto bg-transparent border-b border-[#e5cd8d] outline-none text-center text-slate-800 text-xs py-[1px] focus:bg-[#f6f1d3] focus:border-[#8b6d2a] transition-all"
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <DualPage
            left={
                <GoldCard className="flex flex-col h-full">
                    {/* Split into two main columns for compactness */}
                    <div className="flex flex-1 text-[13px]">
                        <div className="flex-1 border-r border-[#daaa39] flex flex-col">
                            {renderSkillGroup('学术能力', ACADEMIC_SKILLS)}
                        </div>
                        <div className="flex-1 border-r border-[#daaa39] flex flex-col">
                            {renderSkillGroup('社交能力', SOCIAL_SKILLS)}
                            <div className="border-t border-[#daaa39] my-0"></div>
                            {renderSkillGroup('技术能力', TECH_SKILLS)}
                        </div>
                        <div className="flex-1 flex flex-col">
                            {renderSkillGroup('一般能力', GENERAL_SKILLS)}
                        </div>
                    </div>
                </GoldCard>
            }
            right={
                <GoldCard className="p-6 flex flex-col h-full bg-white/80">
                    {!selectedSkill ? (
                        <div className="flex flex-col h-full bg-white/50 p-6 shadow-inner border-[2px] border-[#daaa39] rounded">
                            <h2 className="text-xl font-bold text-[#5c4a21] border-b border-[#daaa39] pb-2 mb-4 tracking-widest text-center">规则备注</h2>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                {RULES_NOTES.map((note, idx) => (
                                    <div key={idx} className="text-slate-800 text-[13px] leading-relaxed font-serif flex gap-2">
                                        <span className="text-[#c89b3c] font-black shrink-0">{note.split(' ')[0]}</span>
                                        <span>{note.substring(note.indexOf(' ') + 1)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-center text-stone-500 font-bold text-xs">
                                点选左侧能力的 🎲 按钮进行检定和查看详情。
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="border-b-2 border-[#daaa39] pb-3 mb-4 flex justify-between items-end">
                                <h2 className="text-2xl font-black text-[#5c4a21] tracking-widest font-['STKaiti']">{getSkillLabel(selectedSkill)}</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-[#5c4a21] font-bold text-sm">当前点数:</span>
                                    <div className="flex items-center bg-[#f8f4e6] border border-[#daaa39] rounded px-1">
                                        <button
                                            className="px-2 text-lg text-[#b54a22] hover:bg-[#e5cd8d] rounded"
                                            onClick={() => handleSkill(selectedSkill, Math.max(0, currentSkillValue - 1).toString())}
                                        >-</button>
                                        <span className="w-8 text-center font-bold text-slate-800">{currentSkillValue}</span>
                                        <button
                                            className="px-2 text-lg text-[#b54a22] hover:bg-[#e5cd8d] rounded"
                                            onClick={() => handleSkill(selectedSkill, (currentSkillValue + 1).toString())}
                                        >+</button>
                                    </div>
                                </div>
                            </div>

                            {/* Skill Description */}
                            <div className="flex-1 overflow-y-auto mb-6 pr-2">
                                <div className="text-slate-800 text-[14px] leading-relaxed font-serif whitespace-pre-wrap">
                                    {SKILL_DESCRIPTIONS[getSkillLabel(selectedSkill)] || "暂无规则说明，请参考规则书相关章节。"}
                                </div>
                            </div>

                            {/* Dice Roller */}
                            <div className="bg-[#f8f4e6] border-[2px] border-[#daaa39] rounded p-4 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#5c4a21] font-bold text-sm">消耗点数:</span>
                                        <select
                                            value={spentPoints}
                                            onChange={(e) => setSpentPoints(Number(e.target.value))}
                                            className="bg-white border border-[#daaa39] outline-none rounded p-1 text-sm font-bold text-slate-800 w-16 text-center cursor-pointer"
                                        >
                                            {Array.from({ length: currentSkillValue + 1 }, (_, i) => (
                                                <option key={i} value={i}>{i}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleRoll}
                                        disabled={isRolling}
                                        className="bg-[#cca74b] hover:bg-[#b54a22] text-[#1e1c18] hover:text-white px-6 py-2 rounded font-black tracking-widest transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <span className="text-lg">🎲</span>
                                        {isRolling ? '投掷中...' : '进行检定'}
                                    </button>
                                </div>

                                <div className="border-t border-[#daaa39]/50 pt-3 flex items-center justify-between min-h-[60px]">
                                    {diceResult !== null ? (
                                        <>
                                            <div className="flex gap-4 text-slate-800 items-baseline">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-stone-500">D6</span>
                                                    <span className="text-2xl font-black text-[#5c4a21]">{diceResult}</span>
                                                </div>
                                                <span className="text-lg font-bold text-stone-400">+</span>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-stone-500">消耗</span>
                                                    <span className="text-2xl font-black text-[#5c4a21]">{diceResult - (currentSkillValue > 0 && spentPoints === 0 ? diceResult - diceResult : -spentPoints) - spentPoints === 0 ? spentPoints : Math.max(0, spentPoints)}</span>
                                                </div>
                                                <span className="text-lg font-bold text-stone-400">=</span>
                                            </div>
                                            <div className="flex flex-col items-center pr-4">
                                                <span className="text-xs font-bold text-stone-500">检定总值</span>
                                                <span className={`text-4xl font-black ${diceResult + spentPoints >= 4 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {diceResult + spentPoints}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-stone-400 text-sm font-bold italic w-full text-center">
                                            投掷D6并加上消耗点数计算结果。一般测试难度为4。
                                        </div>
                                    )}
                                </div>

                                {/* Animated overlay to simulate dice rolling */}
                                {isRolling && (
                                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                                        <span className="text-5xl animate-[spin_0.3s_linear_infinite]">🎲</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </GoldCard>
            }
        />
    );
}
