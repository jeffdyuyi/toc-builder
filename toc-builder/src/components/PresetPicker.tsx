import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Users, X } from 'lucide-react';
import { PRESET_CHARACTERS } from '../data/presets';
import type { PresetCharacter } from '../data/presets';
import { level } from '../data/character';

interface Props { onClose: () => void; onUse: (preset: PresetCharacter) => void; currentName: string; hasCurrentCharacter: boolean }
const skillLabel = (name: string) => name.replace(/\(\d+\)$|\*$/g, '');

export default function PresetPicker({ onClose, onUse, currentName, hasCurrentCharacter }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedId, setSelectedId] = useState(PRESET_CHARACTERS[0].id);
  const selected = PRESET_CHARACTERS.find(preset => preset.id === selectedId)!;
  const { data } = selected.save;
  const strongest = Object.entries(data.skills).filter(([name, value]) => Number(value) > 0 && !['心智(9)', '坚毅(9)', '健康(9)', '信誉等级'].includes(name)).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 4);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog ref={dialogRef} aria-labelledby="preset-title" onCancel={onClose} className="m-auto w-[min(1120px,calc(100%-24px))] max-h-[90dvh] overflow-y-auto rounded-xl border border-[#cca74b]/50 bg-[#1e1c18] p-0 text-stone-100 shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm">
      <header className="flex items-start justify-between gap-4 border-b border-stone-700 px-5 py-5 sm:px-7">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs tracking-widest text-[#cca74b]"><Users size={15} /> 五位预设调查员</p>
          <h2 id="preset-title" className="text-2xl font-bold">使用预设角色</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-400">查看角色背景与能力，选择后即可开始跑团。</p>
        </div>
        <button autoFocus onClick={onClose} aria-label="关闭预设角色选择" className="rounded p-2 text-stone-400 hover:bg-stone-800 hover:text-white focus-visible:outline-2 focus-visible:outline-[#cca74b]"><X size={20} /></button>
      </header>
      <div className="grid lg:grid-cols-[1fr_1.1fr]">
        <section aria-label="预设角色列表" className="grid gap-3 p-5 sm:p-7 lg:border-r lg:border-stone-700">
          {PRESET_CHARACTERS.map(preset => (
            <button key={preset.id} aria-pressed={preset.id === selectedId} onClick={() => setSelectedId(preset.id)} className={`rounded-lg border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[#cca74b] ${preset.id === selectedId ? 'border-[#cca74b] bg-[#cca74b]/10' : 'border-stone-700 bg-[#2c2923] hover:border-stone-500'}`}>
              <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-stone-100">{preset.save.data.name}</h3>{preset.id === selectedId && <Check size={17} className="shrink-0 text-[#cca74b]" />}</div>
              <p className="mt-1 text-xs text-[#cca74b]">{preset.save.data.occupation} · 动力：{preset.save.data.drive}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-400">{preset.summary}</p>
            </button>
          ))}
        </section>
        <section key={selected.id} aria-label="角色详情" className="bg-[#faf8f2] p-5 text-stone-800 sm:p-7">
          <p className="text-xs font-bold tracking-widest text-[#8b6d2a]">调查员档案</p>
          <h3 className="mt-2 text-2xl font-bold font-serif">{data.name}</h3>
          <p className="mt-2 text-sm text-stone-600">{data.occupation} / {data.drive}</p>
          <dl className="my-5 grid grid-cols-3 gap-2">
            {(['心智', '坚毅', '健康'] as const).map((name, i) => <div key={name} className="rounded border border-[#daaa39]/50 bg-white/60 p-3 text-center"><dt className="text-xs text-stone-500">{name}</dt><dd className="mt-1 text-2xl font-bold text-[#5c4a21]">{[data.sanity, data.stability, data.health][i]}</dd></div>)}
          </dl>
          <h4 className="text-sm font-bold text-[#5c4a21]">擅长能力</h4>
          <div className="mt-2 flex flex-wrap gap-2">{strongest.map(([name, value]) => <span key={name} className="rounded bg-[#e8dfc5] px-2 py-1 text-xs">{skillLabel(name)} {value}</span>)}</div>
          <h4 className="mt-5 text-sm font-bold text-[#5c4a21]">性格与背景</h4>
          <p className="mt-2 text-sm leading-7">{data.personality}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{data.backstory}</p>
          <details className="mt-4 border-t border-[#daaa39]/40 pt-3"><summary className="cursor-pointer text-sm font-bold text-[#5c4a21]">心智支柱、坚毅之源与联系人</summary>{[['心智支柱', data.pillar], ['坚毅之源', data.sourceOfStability], ['联系人', data.notes]].map(([title, text]) => <div key={title} className="mt-3"><h4 className="text-xs font-bold text-stone-500">{title}</h4><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{text}</p></div>)}</details>
          {level(data, '心智(9)') > 10 && <p className="mt-4 rounded bg-amber-100 p-3 text-xs leading-5 text-amber-900">此预设保留原卡心智 {data.sanity}，高于工具默认上限 10。载入后会保留数值并显示规则提示。</p>}
        </section>
      </div>
      <footer className="sticky bottom-0 border-t border-stone-700 bg-[#1e1c18] px-5 py-4 sm:px-7">
        <p className="mb-3 text-xs leading-5 text-stone-400">{hasCurrentCharacter ? `载入将替换当前角色${currentName ? `「${currentName}」` : ''}的页面内容。未保存的修改不会保留；需要保留时，请先关闭此窗口并保存。` : '预设已完成建卡，能力池为满值。载入后可编辑资料、进行检定，并另行保存自己的角色进度。'} 浏览器中已有的存档不会在载入时被覆盖。</p>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-md border border-stone-600 px-4 py-2 text-sm hover:bg-stone-800">取消</button>
          <button onClick={() => onUse(selected)} className="flex items-center gap-2 rounded-md bg-[#cca74b] px-5 py-2.5 text-sm font-bold text-[#1e1c18] hover:bg-[#d4b563] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cca74b]">使用{data.name}<ArrowRight size={16} /></button>
        </div>
      </footer>
    </dialog>
  );
}
