import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CREATION_GUIDE } from '../data/constants';

const CollapsibleSection = ({ title, children, colorKey = 'default', defaultOpen = false }: any) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const colors: any = {
        default: { text: 'text-[#8a2a2a]', border: 'border-[#8a2a2a]' },
        gray: { text: 'text-[#5c4a21]', border: 'border-[#5c4a21]' },
        blue: { text: 'text-[#2a4d8a]', border: 'border-[#2a4d8a]' },
        gold: { text: 'text-[#8a702a]', border: 'border-[#8a702a]' },
        brown: { text: 'text-[#8a4e2a]', border: 'border-[#8a4e2a]' },
        purple: { text: 'text-[#452a8a]', border: 'border-[#452a8a]' },
    };

    const cur = colors[colorKey] || colors.default;

    return (
        <section className="bg-white/50 border border-[#d6cbb5] rounded-sm mb-4 shadow-sm">
            <button
                className={`w-full flex items-center justify-between text-left text-[16px] md:text-[17px] font-bold ${cur.text} border-l-4 ${cur.border} pl-3 p-3 hover:bg-[#daaa39]/10 transition-colors`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{title}</span>
                <span className="text-stone-400">{isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</span>
            </button>
            {isOpen && (
                <div className="p-4 pt-1 text-slate-800 font-serif text-[14px] leading-[1.8] space-y-4 border-t mt-1 border-[#d6cbb5]/20">
                    {children}
                </div>
            )}
        </section>
    );
};

const GuideAndRulesPage = () => {
    return (
        <div className="flex flex-col gap-6 w-full min-h-[800px]">
            <div className="border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 p-6 md:p-8 flex flex-col flex-1 relative shadow-sm">
                {/* Corner Decors */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                <h2 className="text-3xl font-bold text-[#5c4a21] border-b-2 border-[#daaa39] pb-4 mb-8 tracking-[0.2em] text-center font-['STKaiti']">创建指南与规则速览</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                    {/* Left Column: Creation Guide */}
                    <div>
                        <h3 className="text-2xl font-bold text-[#5c4a21] mb-6 font-['STKaiti'] text-center">车卡简要向导</h3>
                        <CollapsibleSection title="调查员创建步骤" colorKey="gray" defaultOpen={true}>
                            {CREATION_GUIDE.map((p, i) => <p key={i} className="indent-[2em]">{p}</p>)}
                        </CollapsibleSection>
                    </div>

                    {/* Right Column: Rules */}
                    <div>
                        <h3 className="text-2xl font-bold text-[#5c4a21] mb-6 font-['STKaiti'] text-center">核心规则速览</h3>

                        {/* Section 1 */}
                        <CollapsibleSection title="一、肉体伤害与死亡" colorKey="default" defaultOpen={true}>
                            <p><strong>【健康点数降至负数】</strong> 与大部分能力不同，你的健康点数可以降至负数。当你的健康点数为负数时，你必须进行<strong>意识检定</strong>。投掷一枚骰子，并以你当前健康点数的绝对值作为该检定的难度值。</p>
                            <p className="indent-[2em]">为了竭力保持意识清醒，你可以主动扣除一些健康点数（数量由你自己决定），将其加入检定的结果（你无法主动将你的健康点数降至-11以下）。每主动减少1点，可以在掷骰的结果上加1。意识检定的难度取决于你主动扣除点数之前的健康点数。</p>
                            <div className="bg-[#f8f5ee] p-3 border border-[#e3dac4] rounded shadow-inner text-[13px] italic text-[#5c4a21]">
                                <strong>实例：</strong>米迦神父逃避追赶时，被重击导致健康点数降至-2。此时他迫切想要保持清醒。-2的绝对值是2，所以检定难度值为2。他选择耗用2点健康点数拼命逃跑，这给了他2点加值。他掷出了6，最终结果为8（6+2），成功逃出，但他的健康点数降到了-4。
                            </div>
                            <p><strong>【受伤（0 到 -5）】</strong> 身体除皮肉伤和瘀血外无永久性损伤。但是，伤口的疼痛使你<strong>无法耗用调查能力的点数</strong>，并使<strong>所有检定和对抗的难度值+1</strong>（这也包括对方的命中阈值）。</p>
                            <p className="indent-[2em]"><strong>急救：</strong> 耗用急救能力，同伴每耗用1点可帮你恢复2点健康；自我救治每1点恢复1点。当前场景受伤最多恢复到场景开始前状态，且最高不超过最大值的三分之一。</p>
                            <p><strong>【重伤（-6 到 -11）】</strong> 无论清醒与否都无法战斗。未急救前<strong>每隔半小时失去1点健康</strong>。</p>
                            <p className="indent-[2em]"><strong>急救与住院：</strong> 耗用2点急救可稳住伤势。必须住院，天数等于受伤时最低健康点数绝对值。出院当天恢复一半，次日完全恢复。</p>
                            <p><strong>【死亡（-12 及以下）】</strong> 你死了。</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                <div className="bg-[#f1ebe0] p-3 border border-[#d6cbb5] rounded-sm">
                                    <h4 className="font-bold text-[#5c4a21] mb-1">NPC健康减损</h4>
                                    <p className="text-[13px]">通俗风格下，普通人类健康点数降至0以下即可判定死亡，以加快战斗节奏。</p>
                                </div>
                                <div className="bg-[#f1ebe0] p-3 border border-[#d6cbb5] rounded-sm">
                                    <h4 className="font-bold text-[#5c4a21] mb-1">非致命伤害</h4>
                                    <p className="text-[13px]">使用无利刃武器可宣布非致命伤害。攻击成功最多降至-11，只会迫使对方进行意识检定。</p>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Section 2 */}
                        <CollapsibleSection title="二、坚毅、心智与疯狂" colorKey="blue">
                            <p><strong>【坚毅与心智的区别】</strong> </p>
                            <ul className="list-disc pl-6 space-y-2 pb-2">
                                <li><strong>坚毅（Stability）：</strong> 精神血条。可以迅速下降但在剧本间歇期能恢复。是<strong>衡量当前距离发疯有多近的短期指标</strong>。</li>
                                <li><strong>心智（Sanity）：</strong> 理智底线。失去极慢且极难恢复（原旨风格不恢复）。是<strong>衡量你对宇宙有着多深认识的长期指标</strong>。</li>
                            </ul>
                            <p><strong>【坚毅的减损】</strong> 面临失去自制的事件时进行<strong>难度为4的坚毅检定</strong>。失败除失去规定点数还要扣除先前主动耗用的。面对神话检定难度至少+1，减损数值也更多。可主动耗用至负值，但<strong>不得降至-11以下</strong>。</p>
                        </CollapsibleSection>

                        {/* Section 3 */}
                        <CollapsibleSection title="三、动力与强行推动" colorKey="gold">
                            <p><strong>动力（Drive）</strong>迫使角色抛弃理性、自我毁灭。不加节制的作死恰是恐怖游戏的精髓。</p>
                            <ul className="list-disc pl-5 text-[14px] space-y-2 mt-2">
                                <li><strong>强行推动：</strong> 主线作死。屈服<strong>恢复2点</strong>坚毅点数；拒绝<strong>失去4点 或 1/3</strong>的当前坚毅点数（取较高者）。</li>
                                <li><strong>温和推动：</strong> 支线作死。服从可<strong>恢复1点</strong>坚毅点数；拒绝需<strong>耗费2点</strong>坚毅点数。</li>
                            </ul>
                            <p className="text-[14px] mt-2 border-t border-dashed border-[#daaa39]/50 pt-2">主动建言符合动力的作死行动，在立刻推进故事或让自身陷入极度危险时，可获坚毅点数额外奖励。</p>
                        </CollapsibleSection>

                        {/* Section 4 */}
                        <CollapsibleSection title="四、惊恐不安的阶段" colorKey="brown">
                            <ul className="list-none space-y-3 pb-2">
                                <li className="bg-[#f5eeeb] p-3 border border-[#e8d5cc] rounded-sm">
                                    <strong className="text-[#8a4e2a]">【动摇】坚毅为 0 到 -5：</strong>
                                    <p className="mt-1 text-[13px]"><strong>不能耗用调查能力点数</strong>；<strong>所有一般能力的检定难度+1</strong>。</p>
                                </li>
                                <li className="bg-[#f2e6e1] p-3 border border-[#dfc3b6] rounded-sm">
                                    <strong className="text-[#8a2a2a]">【崩溃】坚毅为 -6 到 -11：</strong>
                                    <p className="mt-1 text-[13px]">附带所有动摇惩罚，只能<strong>逃走或狂乱发病</strong>。可能罹患永久精神疾病，并<strong>永久丧失1个坚毅等级</strong>。</p>
                                </li>
                                <li className="bg-[#f1dede] p-3 border border-[#e3bdbc] rounded-sm">
                                    <strong className="text-[#aa0000]">【彻底疯狂】坚毅为 -12 ⬇：</strong>
                                    <p className="mt-1 text-[13px]">最后进行一次英勇自毁后角色报废（住院电疗或死亡）。</p>
                                </li>
                            </ul>
                        </CollapsibleSection>

                        {/* Section 5 */}
                        <CollapsibleSection title="五、心智的丧失与挽回" colorKey="purple">
                            <h4 className="font-bold text-[#452a8a] mb-1">神话性精神休克</h4>
                            <ul className="list-disc pl-5 text-[13px] space-y-1 mb-3">
                                <li>神话事件导致<strong>动摇</strong>（0 到 -5）时，失去 <strong>1点心智等级</strong>。</li>
                                <li>神话事件导致<strong>崩溃</strong>（-6 到 -11）时，失去 <strong>2点心智等级</strong>。</li>
                            </ul>

                            <h4 className="font-bold text-[#452a8a] mb-1">心智支柱与动力的崩塌</h4>
                            <ul className="list-disc pl-5 text-[13px] space-y-1 mb-3">
                                <li>失去 3 点心智可主动瓦解一个心智支柱来代替惩罚；失去最后一个支柱后，所有坚毅检定难度+1。</li>
                                <li>发现动力无意义时，顺从无法获奖，抗拒仍受损。</li>
                            </ul>

                            <h4 className="font-bold text-[#5c4a21] mb-1 border-t border-[#c1c6dd] pt-2 mt-2">保护机制</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                                <div className="bg-[#edeef4] p-3 border border-[#c1c6dd] rounded-sm text-[12px]">
                                    <strong className="text-[#452a8a]">1. 拒斥事实：</strong><br />若无物证，通过自欺欺人可<strong>恢复1点心智等级</strong>。但再遇相关神话会立刻扣除。心智降到0后无效。
                                </div>
                                <div className="bg-[#edeef4] p-3 border border-[#c1c6dd] rounded-sm text-[12px]">
                                    <strong className="text-[#452a8a]">2. 陷入昏厥：</strong><br />面对高潮恐怖主动深度昏厥退出剧情。任由怪摆布，但<strong>仅损失1点心智</strong>。咒语反噬时无效。
                                </div>
                            </div>
                        </CollapsibleSection>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideAndRulesPage;
