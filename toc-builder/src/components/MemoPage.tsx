import { useRef, useEffect, useState } from 'react';
import DualPage, { GoldCard } from './DualPage';
import { Bold, Italic, Plus, X } from 'lucide-react';
import { EQUIPMENT_LIST } from '../data/equipment';

interface EquipmentItem {
    id: string; // Add random id for safe rendering
    name: string;
    qty: string;
    price: string;
    note1: string;
    note2: string;
}

interface MemoPageProps {
    data: any;
    setData: (fn: (prev: any) => any) => void;
}

const tableInputCls = "w-full bg-transparent outline-none text-slate-800 px-1 font-medium text-[13px] text-center focus:bg-[#f6f1d3]/80 transition-all font-serif h-full focus:shadow-inner";

export default function MemoPage({ data, setData }: MemoPageProps) {
    const memoRef = useRef<HTMLDivElement>(null);
    const [showEquipmentModal, setShowEquipmentModal] = useState(false);
    const [activeEqCategory, setActiveEqCategory] = useState(EQUIPMENT_LIST[0].category);

    // Initialize equipment items if not exists
    const equipmentItems: EquipmentItem[] = data.equipmentItems || [];

    const updateItem = (index: number, field: keyof EquipmentItem, value: string) => {
        setData((prev: any) => {
            const newItems = [...(prev.equipmentItems || [])];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, equipmentItems: newItems };
        });
    };

    const addItem = (preset?: { name: string, price: string, note1?: string, note2?: string }) => {
        setData((prev: any) => ({
            ...prev,
            equipmentItems: [...(prev.equipmentItems || []), {
                id: Math.random().toString(36).slice(2, 11),
                name: preset?.name || '',
                qty: preset ? '1' : '',
                price: preset?.price || '',
                note1: preset?.note1 || '',
                note2: preset?.note2 || ''
            }]
        }));
    };

    const removeItem = (index: number) => {
        setData((prev: any) => {
            const newItems = [...(prev.equipmentItems || [])];
            newItems.splice(index, 1);
            return { ...prev, equipmentItems: newItems };
        });
    };

    // Sync contenteditable with state cleanly without jumping cursor
    useEffect(() => {
        if (memoRef.current && data.campaignMemo !== memoRef.current.innerHTML) {
            // Only set if content completely changed (like load), to avoid cursor jumps when typing
            if (!memoRef.current.innerHTML && data.campaignMemo) {
                memoRef.current.innerHTML = data.campaignMemo;
            }
        }
    }, [data.campaignMemo]);

    const handleMemoInput = () => {
        if (memoRef.current) {
            setData((prev: any) => ({ ...prev, campaignMemo: memoRef.current?.innerHTML || '' }));
        }
    };

    const execFormat = (cmd: string) => {
        document.execCommand(cmd, false, undefined);
        memoRef.current?.focus();
        handleMemoInput();
    };

    return (
        <>
            <DualPage
                left={
                    <GoldCard className="p-6 flex flex-col h-full bg-white/80">
                        <div className="border-b border-[#daaa39] pb-2 mb-4 flex justify-between items-end">
                            <h2 className="text-lg font-bold text-[#5c4a21] tracking-widest text-center font-['STKaiti']">随身道具与财物</h2>
                            <button
                                className="text-[#b54a22] text-xs font-bold border border-[#daaa39] px-2 py-0.5 rounded hover:bg-[#cca74b] hover:text-[#1e1c18] transition-colors"
                                onClick={() => addItem()}
                            >
                                + 新增道具
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full border-collapse border border-[#daaa39] text-[13px]">
                                <thead>
                                    <tr className="bg-[#f8f4e6] text-[#5c4a21] font-bold tracking-wider">
                                        <th className="border border-[#daaa39] p-1 w-10">操作</th>
                                        <th className="border border-[#daaa39] p-1 w-32">名称</th>
                                        <th className="border border-[#daaa39] p-1 w-12">数量</th>
                                        <th className="border border-[#daaa39] p-1 w-16">价格</th>
                                        <th className="border border-[#daaa39] p-1 flex-1">备注1</th>
                                        <th className="border border-[#daaa39] p-1 flex-1">备注2</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipmentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center p-4 text-stone-400 font-bold italic font-serif border border-[#daaa39]">
                                                暂无道具，点击右上角新增
                                            </td>
                                        </tr>
                                    ) : (
                                        equipmentItems.map((item, i) => (
                                            <tr key={item.id} className="border border-[#daaa39] group">
                                                <td className="border border-[#daaa39] text-center p-0 align-middle">
                                                    <button
                                                        className="text-stone-400 hover:text-red-500 font-bold px-2 py-1 opacity-50 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeItem(i)}
                                                        title="删除行"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                                <td className="border border-[#daaa39] p-0 h-full"><textarea className={`${tableInputCls} resize-none overflow-y-hidden py-1.5`} style={{ fieldSizing: "content", minHeight: "32px", height: "100%" } as any} rows={1} value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} /></td>
                                                <td className="border border-[#daaa39] p-0 h-full"><textarea className={`${tableInputCls} resize-none overflow-y-hidden py-1.5`} style={{ fieldSizing: "content", minHeight: "32px", height: "100%" } as any} rows={1} value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} /></td>
                                                <td className="border border-[#daaa39] p-0 h-full"><textarea className={`${tableInputCls} resize-none overflow-y-hidden py-1.5`} style={{ fieldSizing: "content", minHeight: "32px", height: "100%" } as any} rows={1} value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} /></td>
                                                <td className="border border-[#daaa39] p-0 h-full"><textarea className={`${tableInputCls} resize-none overflow-y-hidden py-1.5`} style={{ fieldSizing: "content", minHeight: "32px", height: "100%" } as any} rows={1} value={item.note1} onChange={e => updateItem(i, 'note1', e.target.value)} /></td>
                                                <td className="border border-[#daaa39] p-0 h-full"><textarea className={`${tableInputCls} resize-none overflow-y-hidden py-1.5`} style={{ fieldSizing: "content", minHeight: "32px", height: "100%" } as any} rows={1} value={item.note2} onChange={e => updateItem(i, 'note2', e.target.value)} /></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 border-t border-[#daaa39]/50 pt-2 text-center">
                            <button
                                className="text-[#5c4a21] text-xs font-bold border border-[#c89b3c] px-4 py-1.5 rounded-sm hover:bg-[#c89b3c] hover:text-white transition-all shadow-sm active:translate-y-px"
                                onClick={() => setShowEquipmentModal(true)}
                            >
                                ↓ 从装备库选购添加
                            </button>
                        </div>
                    </GoldCard>
                }
                right={
                    <GoldCard className="p-6 flex flex-col h-full bg-white/80">
                        <div className="border-b border-[#daaa39] pb-2 mb-4 flex justify-between items-end">
                            <h2 className="text-lg font-bold text-[#5c4a21] tracking-widest text-center font-['STKaiti']">战役备忘录</h2>

                            {/* Rich Text Toolbar */}
                            <div className="flex gap-1">
                                <button
                                    className="w-7 h-7 flex flex-col items-center justify-center text-[#5c4a21] border border-[#daaa39] rounded hover:bg-[#cca74b] hover:text-white transition-colors border-b-[2px] active:border-b active:translate-y-[1px]"
                                    title="加粗" onClick={() => execFormat('bold')}
                                >
                                    <Bold size={14} strokeWidth={3} />
                                </button>
                                <button
                                    className="w-7 h-7 flex flex-col items-center justify-center text-[#5c4a21] border border-[#daaa39] rounded hover:bg-[#cca74b] hover:text-white transition-colors border-b-[2px] active:border-b active:translate-y-[1px]"
                                    title="斜体" onClick={() => execFormat('italic')}
                                >
                                    <Italic size={14} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        <div
                            ref={memoRef}
                            contentEditable
                            onInput={handleMemoInput}
                            onBlur={handleMemoInput}
                            className="flex-1 w-full bg-transparent outline-none p-1 text-slate-800 text-[14px] leading-relaxed font-serif focus:bg-[#f6f1d3]/80 transition-all overflow-y-auto"
                            style={{ minHeight: '100%' }}
                        />
                    </GoldCard>
                }
            />

            {/* Equipment Mall Modal */}
            {
                showEquipmentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowEquipmentModal(false)}>
                        <div className="bg-[#faf8f2] border-[2px] border-[#daaa39] max-w-4xl w-full h-[80vh] rounded-sm shadow-xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center border-b-[2px] border-[#daaa39] bg-[#f8f4e6] px-5 py-3 shrink-0">
                                <h3 className="font-bold text-[#5c4a21] text-lg tracking-widest flex items-center gap-2">
                                    <span className="text-xl">🛒</span> 装备与财物选购
                                </h3>
                                <button className="text-[#c89b3c] hover:text-[#8b6d2a] font-bold text-xl leading-none transition-colors" onClick={() => setShowEquipmentModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                {/* Categories Sidebar */}
                                <div className="w-48 border-r border-[#daaa39] bg-white/50 overflow-y-auto shrink-0 flex flex-col">
                                    {EQUIPMENT_LIST.map(cat => (
                                        <button
                                            key={cat.category}
                                            className={`px-4 py-3 text-left text-sm font-bold border-b border-[#daaa39]/30 transition-colors ${activeEqCategory === cat.category ? 'bg-[#cca74b] text-white' : 'text-[#5c4a21] hover:bg-[#f6f1d3]'}`}
                                            onClick={() => setActiveEqCategory(cat.category)}
                                        >
                                            {cat.category}
                                        </button>
                                    ))}
                                </div>

                                {/* Items List */}
                                <div className="flex-1 overflow-y-auto p-4 bg-white/30">
                                    {EQUIPMENT_LIST.find(c => c.category === activeEqCategory)?.items.map((item, idx) => (
                                        <div key={idx} className="mb-3 border border-[#daaa39]/50 rounded bg-white hover:border-[#c89b3c] hover:shadow-md transition-all group flex flex-col sm:flex-row items-stretch overflow-hidden">
                                            <div className="p-3 flex-1 flex flex-col justify-center">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="font-bold text-[#1e1c18] text-[15px]">{item.name}</span>
                                                    <span className="text-[#b54a22] font-mono font-bold text-sm bg-orange-50 px-1 rounded">{item.price}</span>
                                                </div>
                                                <div className="text-stone-500 text-xs font-serif leading-snug break-all space-y-0.5">
                                                    {item.capacity && <p><span className="text-stone-400 font-bold">弹匣：</span>{item.capacity}</p>}
                                                    {item.note && <p><span className="text-stone-400 font-bold">说明：</span>{item.note}</p>}
                                                </div>
                                            </div>
                                            <button
                                                className="sm:w-20 bg-[#f8f4e6] border-t sm:border-t-0 sm:border-l border-[#daaa39]/50 text-[#5c4a21] font-bold text-sm flex items-center justify-center p-2 group-hover:bg-[#c89b3c] group-hover:text-white transition-colors cursor-pointer active:bg-[#a67c2e]"
                                                onClick={() => {
                                                    addItem({
                                                        name: item.name,
                                                        price: item.price,
                                                        note1: item.capacity ? `弹匣：${item.capacity}` : '',
                                                        note2: item.note
                                                    });
                                                }}
                                                title="加入购物清单"
                                            >
                                                <Plus size={20} className="sm:mb-1" />
                                                <span className="hidden sm:inline">添加</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
