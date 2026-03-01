import { useState, useRef } from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

function App() {
  const sheetRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState({
    player: '',
    name: '',
    drive: '',
    occupation: '',
    specialty: '',
    pillar: '',
    points: '',
    sanity: 4,
    stability: 1,
    health: 1,
    sourceOfStability: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
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
- **剩余创建点数:** ${data.points}

## 核心状态
- **心智 (Sanity):** ${data.sanity}
- **坚毅 (Stability):** ${data.stability}
- **健康 (Health):** ${data.health}

## 坚毅之源
${data.sourceOfStability}

## 联系人及游戏记录
${data.notes}
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `TOC角色卡_${data.name || '未命名'}.md`);
  };

  const renderStatTable = (title: string, min: number, max: number, current: number, field: string) => {
    const cells = [];
    for (let i = min; i <= max; i++) {
      const isCurrent = current === i;
      cells.push(
        <div
          key={i}
          onClick={() => setData(prev => ({ ...prev, [field]: i }))}
          className={`border-r border-b border-[#c89b3c] flex items-center justify-center p-1 cursor-pointer text-sm font-semibold 
            ${isCurrent ? 'bg-[#c89b3c] text-white' : 'hover:bg-[#f6f1d3]'}`}
        >
          {i}
        </div>
      );
    }

    // Fill to multiple of 4 columns
    const remainder = cells.length % 4;
    if (remainder !== 0) {
      for (let i = 0; i < 4 - remainder; i++) {
        cells.push(<div key={`empty-${i}`} className="border-r border-b border-[#c89b3c] bg-[#e8debd]"></div>);
      }
    }

    return (
      <div className="mb-6 font-serif">
        <div className="text-center font-bold text-[#5c4a21] mb-1">{title}</div>
        <div className="border-t border-l border-[#c89b3c] grid grid-cols-4 bg-[#fffdf0]">
          {cells}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-800 p-8 font-serif">
      <div className="max-w-6xl mx-auto">

        {/* Toolbar */}
        <header className="bg-neutral-900 shadow-2xl rounded-t-lg border-b border-neutral-700 text-neutral-200 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#e6cd84]">TOC 角色卡生成器</h1>
            <p className="text-neutral-400 text-xs mt-1">复古羊皮卷样式</p>
          </div>
          <div className="flex gap-3">
            <button onClick={exportPNG} className="flex items-center gap-2 px-4 py-2 bg-[#7c5b24] hover:bg-[#8c6729] rounded text-white text-sm font-medium transition-colors border border-[#a27a38]">
              <ImageIcon size={16} />
              导出 PNG
            </button>
            <button onClick={exportMD} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm font-medium transition-colors border border-slate-500">
              <FileText size={16} />
              导出 MD
            </button>
          </div>
        </header>

        {/* Paper Container */}
        <div className="bg-[#e8debd] p-8 md:p-12 rounded-b-lg shadow-2xl flex justify-center" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}>

          {/* Printable Area */}
          <div
            ref={sheetRef}
            className="w-[800px] bg-[#fffdf0] p-8 relative"
            style={{
              boxShadow: '0 0 20px rgba(0,0,0,0.1)',
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/old-wall.png")',
              backgroundBlendMode: 'multiply'
            }}
          >
            {/* Header Area */}
            <div className="flex justify-between items-start mb-8">
              <div className="w-1/2">
                <h1 className="text-5xl font-black text-[#4a3f28] tracking-widest drop-shadow-md" style={{ fontFamily: '"STKaiti", "KaiTi", serif' }}>克苏鲁迷踪</h1>
              </div>
              <div className="flex items-start gap-4 w-1/2 justify-end">
                <div className="text-xl font-bold text-[#4a3f28] whitespace-nowrap pt-2">玩家:</div>
                <div className="w-48 h-56 border-4 border-[#c89b3c] outline outline-2 outline-offset-2 outline-[#c89b3c] bg-white/50 p-2 relative flex flex-col justify-end">
                  <input type="text" name="player" value={data.player} onChange={handleInputChange} className="w-full bg-transparent border-b border-dashed border-[#c89b3c] outline-none text-center font-bold text-slate-800" placeholder="玩家名称" />
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              {/* Left Column (Stats) */}
              <div className="w-[200px] shrink-0">
                <div className="border-4 border-[#c89b3c] p-3 outline outline-2 outline-offset-2 outline-[#c89b3c] bg-white/60">
                  {renderStatTable('心 智', 0, 15, data.sanity, 'sanity')}
                  {renderStatTable('坚 毅', -12, 15, data.stability, 'stability')}
                  {renderStatTable('健 康', -12, 15, data.health, 'health')}
                </div>

                <div className="text-xs text-[#5c4a21] leading-tight mt-4 space-y-2 pr-2" style={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>
                  <p>1. 在通俗风格的游戏中，心智是可恢复的。用一条斜杠来标记<strong>心智能力的减少</strong>，用一个叉号来标记心智等级的减少。</p>
                  <p>2. 职业能力可半价购得，分配创建点数之前，先用星号将它们标记出来。</p>
                  <p>3. 命中阈值为3。如果运动等级大于等于8时，命中阈值为4。</p>
                </div>
              </div>

              {/* Right Column (Details + Skills) */}
              <div className="flex-1 space-y-6">

                {/* Basic info box */}
                <div className="border-4 border-[#c89b3c] p-6 outline outline-2 outline-offset-2 outline-[#c89b3c] bg-white/60 space-y-4">
                  {[
                    { label: '调查员姓名', name: 'name' },
                    { label: '动 力', name: 'drive' },
                    { label: '职 业', name: 'occupation' },
                    { label: '职业特长', name: 'specialty' },
                    { label: '心智支柱', name: 'pillar' },
                    { label: '剩余创建点数', name: 'points' }
                  ].map(field => (
                    <div key={field.name} className="flex items-end">
                      <span className="text-[#4a3f28] font-bold w-32 shrink-0">{field.label}:</span>
                      <input
                        type="text"
                        name={field.name}
                        value={(data as any)[field.name]}
                        onChange={handleInputChange}
                        className="flex-1 min-w-0 bg-transparent border-b border-[#c89b3c] outline-none text-[#2d2516] px-2 font-medium"
                      />
                    </div>
                  ))}
                </div>

                {/* Skills Box Placeholder (simplified for layout) */}
                <div className="border-4 border-[#c89b3c] outline outline-2 outline-offset-2 outline-[#c89b3c] bg-white/60">
                  <div className="grid grid-cols-3 divide-x divide-[#c89b3c] border-b border-[#c89b3c]">
                    <div className="p-2 font-bold text-center text-[#4a3f28]">学术能力</div>
                    <div className="p-2 font-bold text-center text-[#4a3f28]">社交能力</div>
                    <div className="p-2 font-bold text-center text-[#4a3f28]">一般能力</div>
                  </div>
                  <div className="h-64 relative flex items-center justify-center text-[#a18850] text-sm">
                    {/* Abstract representation, you can fill in the rows later */}
                    &lt; 技能列表区域预留处 &gt;
                  </div>
                </div>

                {/* Bottom Notes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-4 border-[#c89b3c] outline outline-2 outline-offset-2 outline-[#c89b3c] bg-white/60 flex flex-col h-40">
                    <div className="p-2 font-bold text-[#4a3f28] border-b border-dashed border-[#c89b3c]">坚毅之源：</div>
                    <textarea
                      name="sourceOfStability"
                      value={data.sourceOfStability}
                      onChange={handleInputChange}
                      className="flex-1 w-full bg-transparent outline-none p-2 resize-none text-[#2d2516] text-sm"
                    />
                  </div>
                  <div className="border-4 border-[#c89b3c] outline outline-2 outline-offset-2 outline-[#c89b3c] bg-white/60 flex flex-col h-40">
                    <div className="p-2 font-bold text-[#4a3f28] border-b border-dashed border-[#c89b3c]">联系人及游戏记录：</div>
                    <textarea
                      name="notes"
                      value={data.notes}
                      onChange={handleInputChange}
                      className="flex-1 w-full bg-transparent outline-none p-2 resize-none text-[#2d2516] text-sm"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Corner decorations (simplified simulation via CSS) */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#c89b3c]"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#c89b3c]"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#c89b3c]"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#c89b3c]"></div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
