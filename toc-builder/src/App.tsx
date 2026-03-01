import { useRef, useState } from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const ACADEMIC_SKILLS = ["会计", "人类学", "考古学", "建筑学", "艺术史", "生物学", "克苏鲁神话", "密码学", "地质学", "历史", "语言", "法律", "文献查阅", "医学", "神秘学", "物理学", "神学"];
const SOCIAL_SKILLS = ["察言观色", "议价", "官僚", "警方交谈", "信誉等级", "奉承", "审讯", "威胁", "口述采访", "安抚", "底层社会"];
const TECH_SKILLS = ["艺术", "天文学", "化学", "手艺", "证物采集", "法医", "开锁", "野外求生", "药剂学", "摄影"];
const GENERAL_SKILLS = ["运动", "藏匿", "伪装", "驾驶", "电器维修", "爆破", "偷窃", "枪械", "急救", "逃脱", "健康", "催眠", "机械维修", "导航", "物品整备", "精神分析", "骑术", "心智", "坚毅", "搏击", "警觉", "追踪", "潜行", "近战武器"];

const OCCUPATIONS = [
  "精神病学家", "古玩家", "考古学家", "艺术家", "作家",
  "神职人员", "罪犯", "风雅子弟", "医生", "流浪汉",
  "记者", "军人", "护士", "灵异现象研究者", "飞行员",
  "警探", "私家侦探", "教授", "科学家", "自定义..."
];

const OCCUPATION_DESC: Record<string, string> = {
  "精神病学家": `作为精神疾病的专家，你可能是一位受过“维也纳学派”训练的精神分析学家，或是一位研究大脑功能的神经病理学家，又或是一位对行为科学怀有强烈兴趣的医生。
虽然弗洛伊德的理论几乎就要主宰这一领域，但还远远没有得到世人的普遍理解与接受。
职业能力：生物学、语言（德语和拉丁语）、文献查阅、医学、药剂学、精神分析、察言观色和其他任意2个社交能力。
信誉等级：3-4
特殊规则：你可以使用医学或一个社交能力来获取不对外公开的精神治疗记录，或进入不对外开放的精神病院病房。如果你是拥有行医执照的医生（医学2级或以上），你可以用同样的方法获取医疗记录，以及进入医院病房。
你可以做一个难度为3（而不是4）的精神分析检定来进行“精神治疗类选法”（见第79页）。你只需耗费1点精神分析能力池点数（而不是2点）使精神异常的对象稳定下来。你也能恢复自己的坚毅，但是每耗费１点精神分析点数只能恢复1点坚毅。
你可以将察言观色视为法医心理学使用，利用犯罪现场的细节，参考过去的类似案件，整理出作案者的概貌——包括对方可能的个人经历、年龄、习惯，以及偏好。你可能需要提醒守秘人，你要使用该能力。你可以用角色创建点数购买催眠能力，并且使用该能力（见第41页）。`
};

function App() {
  const sheetRef = useRef<HTMLDivElement>(null);

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
    skills: {}
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => ({ ...prev, [name]: value }));
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

## 联系人及游戏记录
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
          className={`border-r border-b border-[#cca74b] flex items-center justify-center p-[2px] cursor-pointer text-sm transition-colors
            ${current === i ? 'bg-[#c89b3c] text-white font-bold' : 'hover:bg-[#f6f1d3]'}`}
        >
          {i}
        </div>
      );
    }
    const remainder = cells.length % 4;
    if (remainder !== 0) {
      for (let i = 0; i < 4 - remainder; i++) {
        cells.push(<div key={`empty-${i}`} className="border-r border-b border-[#cca74b] bg-transparent"></div>);
      }
    }

    return (
      <div className="mb-2">
        <div className="text-center font-bold text-[#5c4a21] text-sm mb-[2px]">
          {title}{footnote && <sup className="text-[10px]">{footnote}</sup>}
        </div>
        <div className="border-t border-l border-[#cca74b] grid grid-cols-4 bg-transparent text-slate-800">
          {cells}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-2 md:p-8 font-sans">
      <div className="max-w-[900px] mx-auto">
        <header className="mb-4 flex flex-col md:flex-row justify-between items-center bg-white p-4 shadow rounded border border-slate-200">
          <div className="flex-1 flex justify-center md:justify-start">
            <h1 className="text-4xl md:text-5xl leading-none font-black text-[#695d3e] tracking-[0.4em] ml-[0.4em]" style={{ fontFamily: '"STKaiti", "KaiTi", serif', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
              克苏鲁迷踪
            </h1>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0 shrink-0">
            <button onClick={exportPNG} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-sm font-medium transition-colors">
              <ImageIcon size={16} /> 导出 PNG
            </button>
            <button onClick={exportMD} className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 rounded text-white text-sm font-medium transition-colors">
              <FileText size={16} /> 导出 MD
            </button>
          </div>
        </header>

        {/* Sheet Container */}
        <div className="flex justify-center overflow-x-auto shadow-2xl bg-white">
          <div
            ref={sheetRef}
            className="w-[850px] shrink-0 p-8 pb-12 relative font-['Noto_Serif_SC','STSong','SimSun',serif]"
            style={{
              backgroundColor: '#faf8f2',
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
            }}
          >
            {/* Header Removed */}

            <div className="flex gap-4">
              {/* Left Column (Stats Grid) */}
              <div className="w-[180px] shrink-0">
                <div className="border-[3px] border-[#daaa39] p-2 outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 shadow-sm relative mb-4">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                  {renderStatGrid('心 智', 0, 15, data.sanity, 'sanity', '1')}
                  <div className="text-center text-xs text-[#5c4a21] font-bold mb-3">命中阈值<sup className="text-[9px]">3</sup></div>
                  {renderStatGrid('坚 毅', -12, 15, data.stability, 'stability')}
                  {renderStatGrid('健 康', -12, 15, data.health, 'health')}
                </div>

                <div className="text-[10px] text-[#695d3e] leading-[1.3] space-y-1 mt-6 font-sans text-justify px-1">
                  <p>1. 在通俗风格的游戏中，心智是可恢复的。用一条斜杠来标记<strong>心智能力的减少</strong>，用一个叉号来标记心智等级的减少。</p>
                  <p>2. 职业能力可半价购得，分配创建点数之前，先用星号将它们标记出来。</p>
                  <p>3. 命中阈值为3。如果运动等级大于等于8时，命中阈值为4。</p>
                  <p>(1) 这些一般能力在作为调查能力使用时，等级和能力池视为加倍。</p>
                  <p>4. 通常情况下，你不能在游戏开始时购买克苏鲁神话，且心智不得大于 (10-克苏鲁神话)。</p>
                  <p>5. 在通俗风格的游戏中，如果枪械等级为5，则可以同时用两把手枪射击。</p>
                  <p>6. 为每1点语言能力等级分配1种语言，并将它们记录在角色卡里。</p>
                  <p>7. 逃脱等级在超出运动等级两倍时，超出的部分可以用半价购得。</p>
                  <p>8. 只有精神病学家和灵异现象研究者可以购买催眠，且仅限于通俗风格的游戏。</p>
                  <p>9. 开始创建角色时，你有4点免费心智，1点免费健康与1点免费坚毅。</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-1 space-y-4">

                {/* Basic Info & Portrait */}
                <div className="flex gap-4">
                  <div className="flex-1 border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 p-4 shadow-sm relative">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                    <div className="space-y-[4px]">
                      {[
                        { label: '调查员姓名', name: 'name', type: 'text' },
                        { label: '动 力', name: 'drive', type: 'text' },
                        { label: '职 业', name: 'occupation', footnote: '2', type: 'text', list: 'occupations', placeholder: '选择或输入自定义职业' },
                        { label: '职业特长', name: 'specialty', type: 'text' },
                        { label: '心智支柱', name: 'pillar', type: 'text' },
                        { label: '剩余创建点数', name: 'points', type: 'text' }
                      ].map(field => (
                        <div key={field.name} className="flex text-[15px] items-center">
                          <span className="text-[#5c4a21] font-bold w-[120px] tracking-widest">{field.label}{field.footnote && <sup>{field.footnote}</sup>}：</span>
                          <input
                            type="text"
                            name={field.name}
                            value={data[field.name]}
                            onChange={handleInput}
                            list={field.list}
                            placeholder={field.placeholder}
                            className="flex-1 min-w-0 bg-transparent border-b border-[#daaa39] outline-none text-slate-800 px-1 font-medium pb-[2px]"
                          />
                        </div>
                      ))}
                    </div>

                    <datalist id="occupations">
                      {OCCUPATIONS.map(occ => (
                        <option key={occ} value={occ} />
                      ))}
                    </datalist>
                  </div>

                  {/* Portrait Box */}
                  <div className="w-[140px] shrink-0 flex flex-col items-center">
                    <div className="text-[15px] font-bold text-[#5c4a21] mb-1 mr-auto tracking-widest">玩 家：</div>
                    <div className="w-full h-full border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/40 shadow-inner flex flex-col group relative">
                      <label className="flex-1 cursor-pointer overflow-hidden relative flex flex-col items-center justify-center min-h-[140px] w-full">
                        {data.avatar ? (
                          <img src={data.avatar} alt="Avatar" className="w-[134px] h-full object-cover absolute inset-0" />
                        ) : (
                          <div className="text-[#daaa39] group-hover:text-[#c89b3c] flex flex-col items-center transition-colors">
                            <ImageIcon size={28} className="mb-2" />
                            <span className="text-xs font-bold font-sans">点击上传头像</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <input type="text" name="player" value={data.player} onChange={handleInput} className="w-full bg-white/60 border-t-[3px] border-[#daaa39] text-center outline-none text-slate-800 font-bold p-1.5 text-sm shrink-0 font-sans z-10" placeholder="" />
                    </div>
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 shadow-sm relative text-[13px]">
                  <div className="grid grid-cols-3">

                    {/* 学术能力 */}
                    <div className="border-r border-[#daaa39]">
                      <div className="p-[4px] font-bold text-center text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6]">学术能力</div>
                      <div className="p-2 space-y-0.5">
                        {ACADEMIC_SKILLS.map(skill => (
                          <div key={skill} className="flex">
                            <span className="w-20 text-[#5c4a21] leading-tight">{skill}</span>
                            <input value={data.skills[skill] || ''} onChange={e => handleSkill(skill, e.target.value)} className="flex-1 min-w-0 bg-transparent border-b border-[#e5cd8d] outline-none text-center text-slate-800" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 社交能力 & 技术能力 */}
                    <div className="border-r border-[#daaa39] flex flex-col">
                      <div className="p-[4px] font-bold text-center text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6]">社交能力</div>
                      <div className="p-2 space-y-0.5 border-b border-[#daaa39] pb-4">
                        {SOCIAL_SKILLS.map(skill => (
                          <div key={skill} className="flex">
                            <span className="w-20 text-[#5c4a21] leading-tight">{skill}</span>
                            <input value={data.skills[skill] || ''} onChange={e => handleSkill(skill, e.target.value)} className="flex-1 min-w-0 bg-transparent border-b border-[#e5cd8d] outline-none text-center text-slate-800" />
                          </div>
                        ))}
                      </div>
                      <div className="p-[4px] font-bold text-center text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6]">技术能力</div>
                      <div className="p-2 space-y-0.5">
                        {TECH_SKILLS.map(skill => (
                          <div key={skill} className="flex">
                            <span className="w-20 text-[#5c4a21] leading-tight">{skill}</span>
                            <input value={data.skills[skill] || ''} onChange={e => handleSkill(skill, e.target.value)} className="flex-1 min-w-0 bg-transparent border-b border-[#e5cd8d] outline-none text-center text-slate-800" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 一般能力 */}
                    <div>
                      <div className="p-[4px] font-bold text-center text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6]">一般能力</div>
                      <div className="p-2 space-y-0.5">
                        {GENERAL_SKILLS.map(skill => (
                          <div key={skill} className="flex">
                            <span className="w-24 text-[#5c4a21] leading-tight">{skill}</span>
                            <input value={data.skills[skill] || ''} onChange={e => handleSkill(skill, e.target.value)} className="flex-1 min-w-0 bg-transparent border-b border-[#e5cd8d] outline-none text-center text-slate-800" />
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Notes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 flex flex-col h-32 relative">
                    <div className="p-[6px] font-bold text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6]">坚毅之源：</div>
                    <textarea
                      name="sourceOfStability"
                      value={data.sourceOfStability}
                      onChange={handleInput}
                      className="flex-1 w-full bg-transparent outline-none p-2 resize-none text-slate-800 text-[13px] leading-snug"
                    />
                  </div>
                  <div className="border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 flex flex-col h-32 relative">
                    <div className="p-[6px] font-bold text-[#5c4a21] border-b border-[#daaa39] bg-[#f8f4e6]">联系人及游戏记录：</div>
                    <textarea
                      name="notes"
                      value={data.notes}
                      onChange={handleInput}
                      className="flex-1 w-full bg-transparent outline-none p-2 resize-none text-slate-800 text-[13px] leading-snug"
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Occupation Description Area */}
        {data.occupation && OCCUPATION_DESC[data.occupation] && (
          <div className="max-w-[850px] mx-auto bg-white p-6 shadow-md rounded-md border border-slate-200 mt-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-[#daaa39] h-full"></div>
            <h2 className="text-xl font-bold text-[#5c4a21] mb-3 flex items-center gap-2">
              <FileText size={20} className="text-[#c89b3c]" />
              {data.occupation} - 职业备注
            </h2>
            <div className="text-slate-700 space-y-2 whitespace-pre-wrap text-[14px] leading-relaxed font-sans bg-slate-50 p-4 rounded border border-slate-100">
              {OCCUPATION_DESC[data.occupation]}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
