import { useEffect, useRef, useState } from 'react';
import manifest from '../../public/avatars/labyrpg-1930s/manifest.json';

interface Props { onClose: () => void; onUse: (avatar: string) => void }

export default function AvatarPicker({ onClose, onUse }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  const choose = async (id: string, url: string) => {
    setLoading(id); setError('');
    let objectUrl = '';
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('无法读取头像');
      objectUrl = URL.createObjectURL(await response.blob());
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(420, image.naturalWidth);
      canvas.height = Math.round(image.naturalHeight * canvas.width / image.naturalWidth);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法处理头像');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      onUse(canvas.toDataURL('image/jpeg', 0.85));
    } catch { setError('头像读取失败，请重试或上传自定义头像。'); }
    finally { if (objectUrl) URL.revokeObjectURL(objectUrl); setLoading(null); }
  };
  return <dialog ref={ref} aria-labelledby="avatar-title" onCancel={onClose} className="m-auto w-[min(900px,calc(100%-24px))] max-h-[90dvh] overflow-y-auto rounded-xl border border-[#cca74b] bg-[#1e1c18] p-0 text-stone-100 shadow-2xl backdrop:bg-black/75">
    <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-stone-700 bg-[#1e1c18] p-4 sm:p-6">
      <div><h2 id="avatar-title" className="text-xl font-bold text-[#cca74b]">选择角色头像</h2><p className="mt-2 text-sm text-stone-400">三十年代角色头像 · 30 张 · 点击图片使用</p></div>
      <button autoFocus aria-label="关闭头像库" onClick={onClose} className="min-h-[44px] min-w-[44px] rounded border border-stone-700">✕</button>
    </header>
    {error && <p role="alert" className="px-4 pt-4 text-red-300">{error}</p>}
    <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-5 sm:p-6">
      {manifest.portraits.map(portrait => <button key={portrait.id} disabled={loading !== null} aria-label={`使用${portrait.label}`} onClick={() => void choose(portrait.id, `${import.meta.env.BASE_URL}avatars/labyrpg-1930s/${portrait.file}`)} className="overflow-hidden rounded border border-stone-700 bg-stone-800 hover:border-[#cca74b] focus-visible:outline-2 focus-visible:outline-[#cca74b] disabled:opacity-60">
        <img src={`${import.meta.env.BASE_URL}avatars/labyrpg-1930s/${portrait.file}`} alt={portrait.label} loading="lazy" width="1276" height="1866" className="aspect-[1276/1866] w-full object-contain" />
        <span className="block py-2 text-xs text-stone-300">{loading === portrait.id ? '正在载入…' : portrait.label.replace('三十年代头像 ', '头像 ')}</span>
      </button>)}
    </div>
    <footer className="border-t border-stone-700 p-4 text-xs leading-6 text-stone-400"><p>图片来源：<a href={manifest.sourcePage} target="_blank" rel="noreferrer" className="text-[#cca74b] underline">乐博睿《克苏鲁迷踪》免费资源 · 三十年代角色头像</a>。图片随工具本地内置，版权归原权利人所有。</p><p>也可关闭此窗口，点击角色头像区域上传自定义图片。</p></footer>
  </dialog>;
}
