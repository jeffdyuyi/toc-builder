import { Image as ImageIcon } from 'lucide-react';
import DualPage, { GoldCard } from './DualPage';
import { OCCUPATIONS, OCCUPATION_DESC, DRIVES, PILLARS, RULES_NOTES } from '../data/constants';

interface InfoPageProps {
    data: any;
    setData: (fn: (prev: any) => any) => void;
    showOccupations: boolean;
    setShowOccupations: (v: boolean) => void;
    showDrives: boolean;
    setShowDrives: (v: boolean) => void;
    showPillars: boolean;
    setShowPillars: (v: boolean) => void;
}

const getRuleNote = (key: string) => {
    const note = RULES_NOTES.find(n => n.startsWith(`${key}.`) || n.startsWith(`${key} `));
    return note ? note.replace(/^(\d+\.|[*] )/, '').trim() : '';
};

const inputCls = "w-full bg-transparent border-b border-[#daaa39] outline-none text-slate-800 px-1 font-medium pb-[2px] text-sm focus:bg-[#f6f1d3]/80 focus:border-[#8b6d2a] transition-all";
const labelCls = "text-[#5c4a21] font-bold w-[72px] tracking-widest leading-none shrink-0 text-[14px]";

export default function InfoPage({ data, setData, showOccupations, setShowOccupations, showDrives, setShowDrives, showPillars, setShowPillars }: InfoPageProps) {

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData((prev: any) => {
            const next = { ...prev, [name]: value };
            if (name === 'occupation' && OCCUPATION_DESC[value]) {
                next.customClassSkills = [...OCCUPATION_DESC[value].skills];
            }
            return next;
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setData((prev: any) => ({ ...prev, avatar: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const renderStatGrid = (title: string, min: number, max: number, current: number, field: string, footnote?: string) => {
        const cells = [];
        for (let i = min; i <= max; i++) {
            cells.push(
                <div key={i} onClick={() => setData((prev: any) => ({ ...prev, [field]: i }))}
                    className={`border-r border-b border-[#cca74b] flex-1 flex items-center justify-center p-[1px] min-w-[15px] cursor-pointer text-[12px] h-[24px] transition-colors ${current === i ? 'bg-[#c89b3c] text-white font-bold' : 'hover:bg-[#f6f1d3]'}`}
                >{i}</div>
            );
        }
        return (
            <div className="flex items-stretch border-t border-l border-[#cca74b] bg-transparent text-slate-800">
                <div className="flex items-center justify-center border-r border-b border-[#cca74b] bg-[#f8f4e6] font-bold text-[#5c4a21] text-[13px] shrink-0 w-[60px] tracking-widest">
                    {title}{footnote && <sup className="text-[10px] cursor-help text-[#c89b3c] ml-[2px]" title={getRuleNote(footnote)}>{footnote}</sup>}
                </div>
                <div className="flex flex-wrap flex-1">{cells}</div>
            </div>
        );
    };

    const renderDropdown = (fieldName: string, isOpen: boolean, setOpen: (v: boolean) => void, items: { key: string; label: string; onSelect: () => void }[]) => (
        <div className="flex-1 min-w-0 relative">
            <input type="text" name={fieldName} value={data[fieldName]} onChange={handleInput}
                onClick={() => setOpen(!isOpen)}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                placeholder="点击选择或输入"
                className={`${inputCls} cursor-pointer`}
            />
            {isOpen && (
                <ul className="absolute z-50 left-0 right-0 top-[100%] mt-1 max-h-[220px] overflow-y-auto bg-[#faf8f2] border-[2px] border-[#daaa39] shadow-lg rounded-sm text-sm">
                    {items.map(item => (
                        <li key={item.key}
                            onMouseDown={e => { e.preventDefault(); item.onSelect(); setOpen(false); }}
                            className="px-3 py-1.5 text-slate-800 hover:bg-[#cca74b] hover:text-white cursor-pointer font-bold transition-colors"
                        >{item.label}</li>
                    ))}
                </ul>
            )}
        </div>
    );

    const driveData = DRIVES.find(d => d.name === data.drive);
    const occData = data.occupation && OCCUPATION_DESC[data.occupation] ? OCCUPATION_DESC[data.occupation] : null;

    return (
        <DualPage
            left={
                <>
                    {/* Portrait & Basic Info */}
                    <GoldCard className="p-4">
                        <div className="flex gap-3">
                            <div className="w-[120px] shrink-0 flex flex-col items-center">
                                <div className="w-full min-h-[140px] border-[2px] border-[#daaa39] bg-white/40 shadow-inner flex flex-col group relative">
                                    <label className="flex-1 cursor-pointer overflow-hidden relative flex flex-col items-center justify-center w-full">
                                        {data.avatar ? (
                                            <img src={data.avatar} alt="Avatar" className="w-full h-[130px] object-cover absolute inset-0" />
                                        ) : (
                                            <div className="text-[#daaa39] group-hover:text-[#c89b3c] flex flex-col items-center transition-colors">
                                                <ImageIcon size={24} className="mb-1" />
                                                <span className="text-xs font-bold font-sans">点击上传</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                    <input type="text" name="player" value={data.player} onChange={handleInput}
                                        className="w-full bg-white/60 border-t-[2px] border-[#daaa39] text-center outline-none text-slate-800 font-bold p-1 text-sm shrink-0 font-sans z-10 focus:bg-[#f6f1d3] transition-all"
                                        placeholder="玩家名"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-between space-y-[4px]">
                                <div className="flex text-[14px] items-center">
                                    <span className={labelCls}>调查员：</span>
                                    <input type="text" name="name" value={data.name} onChange={handleInput} className={inputCls} />
                                </div>
                                <div className="flex text-[14px] items-center">
                                    <span className={labelCls}>动 力：</span>
                                    {renderDropdown('drive', showDrives, setShowDrives,
                                        DRIVES.map(d => ({ key: d.name, label: d.name, onSelect: () => setData((p: any) => ({ ...p, drive: d.name })) }))
                                    )}
                                </div>
                                <div className="flex text-[14px] items-center">
                                    <span className={labelCls}>职 业<sup className="cursor-help text-[#c89b3c]" title={getRuleNote('2')}>2</sup>：</span>
                                    {renderDropdown('occupation', showOccupations, setShowOccupations,
                                        OCCUPATIONS.map(occ => ({
                                            key: occ, label: occ,
                                            onSelect: () => {
                                                const v = occ === "自定义..." ? "" : occ;
                                                setData((p: any) => ({ ...p, occupation: v, customClassSkills: OCCUPATION_DESC[v] ? [...OCCUPATION_DESC[v].skills] : [] }));
                                            }
                                        }))
                                    )}
                                </div>
                                <div className="flex text-[14px] items-center">
                                    <span className={labelCls}>支 柱：</span>
                                    {renderDropdown('pillar', showPillars, setShowPillars,
                                        PILLARS.map(p => ({ key: p, label: p, onSelect: () => setData((prev: any) => ({ ...prev, pillar: p })) }))
                                    )}
                                </div>
                                <div className="flex text-[14px] items-center">
                                    <span className={labelCls}>点 数：</span>
                                    <input type="text" name="points" value={data.points} onChange={handleInput} className={inputCls} />
                                </div>
                            </div>
                        </div>
                    </GoldCard>

                    {/* Character Description */}
                    <GoldCard className="p-4 flex-1">
                        <h3 className="text-[14px] font-bold text-[#5c4a21] border-b border-[#daaa39] pb-1 mb-3 tracking-widest">角色描述</h3>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-4">
                                <div className="flex items-center text-[13px] flex-1">
                                    <span className="text-[#5c4a21] font-bold w-[42px] shrink-0">性别：</span>
                                    <input type="text" name="gender" value={data.gender || ''} onChange={handleInput} className={inputCls} />
                                </div>
                                <div className="flex items-center text-[13px] flex-1">
                                    <span className="text-[#5c4a21] font-bold w-[42px] shrink-0">年龄：</span>
                                    <input type="text" name="age" value={data.age || ''} onChange={handleInput} className={inputCls} />
                                </div>
                            </div>
                            {[
                                { label: '形象描述', name: 'appearance', placeholder: '外貌、穿着打扮...', rows: 2 },
                                { label: '标识特征', name: 'distinguishing', placeholder: '口头禅、伤疤、特殊习惯...', rows: 2 },
                                { label: '性格特色', name: 'personality', placeholder: '性格特点、处事方式...', rows: 2 },
                                { label: '故事背景', name: 'backstory', placeholder: '角色的过往经历...', rows: 4 },
                            ].map(f => (
                                <div key={f.name} className="text-[13px]">
                                    <span className="text-[#5c4a21] font-bold">{f.label}：</span>
                                    <textarea name={f.name} value={data[f.name] || ''} onChange={handleInput}
                                        className="w-full bg-transparent border border-[#daaa39]/50 rounded outline-none text-slate-800 p-1.5 resize-none text-[13px] leading-snug focus:bg-[#f6f1d3]/80 focus:border-[#8b6d2a] transition-all font-serif mt-1"
                                        rows={f.rows} placeholder={f.placeholder}
                                    />
                                </div>
                            ))}
                        </div>
                    </GoldCard>
                </>
            }
            right={
                <>
                    {/* Stats — placed at top */}
                    <GoldCard className="p-2 pt-[10px] flex flex-col gap-2.5">
                        {renderStatGrid('心智', 0, 15, data.sanity, 'sanity', '1')}
                        <div className="text-center text-[13px] text-[#5c4a21] font-bold my-[-8px] tracking-widest">
                            命中阈值<sup className="text-[10px] cursor-help text-[#c89b3c]" title={getRuleNote('3')}>3</sup>
                        </div>
                        {renderStatGrid('坚毅', -12, 15, data.stability, 'stability')}
                        {renderStatGrid('健康', -12, 15, data.health, 'health')}
                    </GoldCard>

                    {/* Source of Stability + Contacts — placed second */}
                    <div className="flex gap-3">
                        <GoldCard className="flex-1 flex flex-col min-h-[90px]">
                            <div className="p-[4px] px-2 font-bold text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6] text-[13px] tracking-widest text-center">坚毅之源</div>
                            <textarea name="sourceOfStability" value={data.sourceOfStability} onChange={handleInput}
                                className="flex-1 w-full bg-transparent outline-none p-2 resize-none text-slate-800 text-[13px] leading-snug focus:bg-[#f6f1d3]/80 transition-all font-serif"
                                placeholder="填写坚毅之源..."
                            />
                        </GoldCard>
                        <GoldCard className="flex-1 flex flex-col min-h-[90px]">
                            <div className="p-[4px] px-2 font-bold text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6] text-[13px] tracking-widest text-center">联系人</div>
                            <textarea name="notes" value={data.notes} onChange={handleInput}
                                className="flex-1 w-full bg-transparent outline-none p-2 resize-none text-slate-800 text-[13px] leading-snug focus:bg-[#f6f1d3]/80 transition-all font-serif"
                                placeholder="填写重要联系人..."
                            />
                        </GoldCard>
                    </div>

                    {/* Drive Description */}
                    {driveData && (
                        <GoldCard className="p-4 bg-white/80">
                            <h2 className="text-[15px] font-bold text-[#5c4a21] border-b border-[#daaa39] pb-1 mb-2 tracking-widest">
                                动力：{driveData.name}
                            </h2>
                            <div className="text-slate-800 space-y-1 text-[12px] leading-relaxed font-serif text-justify">
                                <p>{driveData.desc}</p>
                                <p><strong className="text-[#5c4a21]">建议职业：</strong>{driveData.recommended}</p>
                            </div>
                        </GoldCard>
                    )}

                    {/* Occupation Description */}
                    {occData && (
                        <GoldCard className="p-4 bg-white/80">
                            <h2 className="text-[15px] font-bold text-[#5c4a21] border-b border-[#daaa39] pb-1 mb-2 tracking-widest">
                                {data.occupation} - 职业备注
                            </h2>
                            <div className="text-slate-800 space-y-2 whitespace-pre-wrap text-[12px] leading-relaxed font-serif text-justify">
                                <p>{occData.desc}</p>
                                <p><strong className="text-[#5c4a21]">职业能力：</strong>{occData.parsedSkillsText}</p>
                                <p><strong className="text-[#5c4a21]">信誉等级：</strong>{occData.credit}</p>
                                <p><strong className="text-[#5c4a21]">特殊规则：</strong>{occData.special}</p>
                            </div>
                        </GoldCard>
                    )}
                </>
            }
        />
    );
}
