import { useRef, useEffect } from 'react';
import DualPage, { GoldCard } from './DualPage';
import { Bold, Italic } from 'lucide-react';

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

    // Initialize equipment items if not exists
    const equipmentItems: EquipmentItem[] = data.equipmentItems || [];

    const updateItem = (index: number, field: keyof EquipmentItem, value: string) => {
        setData((prev: any) => {
            const newItems = [...(prev.equipmentItems || [])];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, equipmentItems: newItems };
        });
    };

    const addItem = () => {
        setData((prev: any) => ({
            ...prev,
            equipmentItems: [...(prev.equipmentItems || []), { id: Math.random().toString(36).substr(2, 9), name: '', qty: '', price: '', note1: '', note2: '' }]
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
        <DualPage
            left={
                <GoldCard className="p-6 flex flex-col h-full bg-white/80">
                    <div className="border-b border-[#daaa39] pb-2 mb-4 flex justify-between items-end">
                        <h2 className="text-lg font-bold text-[#5c4a21] tracking-widest text-center font-['STKaiti']">随身道具与财物</h2>
                        <button
                            className="text-[#b54a22] text-xs font-bold border border-[#daaa39] px-2 py-0.5 rounded hover:bg-[#cca74b] hover:text-[#1e1c18] transition-colors"
                            onClick={addItem}
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
                                        <tr key={item.id} className="h-8 border border-[#daaa39] group">
                                            <td className="border border-[#daaa39] text-center p-0">
                                                <button
                                                    className="text-stone-400 hover:text-red-500 font-bold px-2 py-1 opacity-50 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeItem(i)}
                                                    title="删除行"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                            <td className="border border-[#daaa39] p-0"><input className={tableInputCls} value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} /></td>
                                            <td className="border border-[#daaa39] p-0"><input className={tableInputCls} value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} /></td>
                                            <td className="border border-[#daaa39] p-0"><input className={tableInputCls} value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} /></td>
                                            <td className="border border-[#daaa39] p-0"><input className={tableInputCls} value={item.note1} onChange={e => updateItem(i, 'note1', e.target.value)} /></td>
                                            <td className="border border-[#daaa39] p-0"><input className={tableInputCls} value={item.note2} onChange={e => updateItem(i, 'note2', e.target.value)} /></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 border-t border-[#daaa39]/50 pt-2 text-center">
                        <button className="text-stone-400 text-xs font-bold px-4 py-1.5 border border-stone-300 rounded hover:bg-stone-200 hover:text-stone-600 transition-all cursor-not-allowed" title="连接规则书系统后可用，敬请期待">
                            ↓ 从装备列表调用 (功能开发中)
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
    );
}
