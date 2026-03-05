const RulesPage = () => {
    return (
        <div className="flex flex-col gap-6 w-full min-h-[800px]">
            <div className="border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 p-6 md:p-12 flex flex-col flex-1 relative shadow-sm">
                {/* Corner Decors */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]"></div>

                <h2 className="text-3xl font-bold text-[#5c4a21] border-b-2 border-[#daaa39] pb-4 mb-8 tracking-[0.2em] text-center font-['STKaiti']">规则查询速览</h2>

                <div className="space-y-12 text-slate-800 font-serif text-[15px] leading-[1.8]">

                    {/* Section 1 */}
                    <section>
                        <h3 className="text-xl font-bold text-[#8a2a2a] mb-4 border-l-4 border-[#8a2a2a] pl-3">一、肉体伤害与死亡</h3>
                        <div className="space-y-4">
                            <p><strong>【健康点数降至负数】</strong> 与大部分能力不同，你的健康点数可以降至负数。当你的健康点数为负数时，你必须进行<strong>意识检定</strong>。投掷一枚骰子，并以你当前健康点数的绝对值作为该检定的难度值。</p>
                            <p className="indent-[2em]">为了竭力保持意识清醒，你可以主动扣除一些健康点数（数量由你自己决定），将其加入检定的结果（你无法主动将你的健康点数降至-11以下）。每主动减少1点，可以在掷骰的结果上加1。意识检定的难度取决于你主动扣除点数之前的健康点数。</p>
                            <div className="bg-[#f8f5ee] p-4 border border-[#e3dac4] rounded shadow-inner text-[14px] italic text-[#5c4a21]">
                                <strong>实例：</strong>米迦神父逃避追赶时，被重击导致健康点数降至-2。此时他迫切想要保持清醒。-2的绝对值是2，所以检定难度值为2。他选择耗用2点健康点数拼命逃跑，这给了他2点加值。他掷出了6，最终结果为8（6+2），成功逃出，但他的健康点数降到了-4。
                            </div>

                            <p><strong>【受伤（0 到 -5）】</strong> 你处于“受伤”状态，但是身体除了一些皮肉伤和瘀血外，并无永久性损伤。不过，伤口的疼痛使你<strong>无法耗用调查能力的点数</strong>，并使<strong>所有检定和对抗的难度值+1</strong>（这也包括对方的命中阈值）。</p>

                            <p className="indent-[2em]"><strong>急救：</strong> 拥有急救能力的角色可以耗用点数改善你的状况。同伴每耗用1点急救点数，可以帮助你恢复2点健康点数；如果自我救治，每耗用1点急救点数只能恢复1点健康点数。实施者必须全神贯注处理受伤部位。<br />
                                <span className="text-[#8a2a2a]">* 注意：急救能力只能治疗在当前场景中所受的伤害，并且最多只能恢复到当前场景开始时的状态；同时上限不超最大健康值的三分之一。</span></p>

                            <p><strong>【重伤（-6 到 -11）】</strong> 你处于“重伤”状态，<strong>必须进行意识检定</strong>。无论能否保持清醒，你都无法继续战斗。在你得到急救治疗之前，<strong>每隔半小时，你都将失去1点健康点数</strong>。</p>

                            <p className="indent-[2em]"><strong>急救与住院：</strong> 耗用2点急救能力点数可以稳定不断恶化的伤势，但无法恢复健康点数。必须在医院或类似环境接受进一步治疗。强制静养天数等于你受伤时最低健康点数的绝对值（如最低-8则静养8天）。在出院当天，健康点数恢复到最大值一半，到了次日，将完全恢复。</p>

                            <p><strong>【死亡（-12 及以下）】</strong> 如果你的健康点数降至-12或更低，那么你就死了。这时该轮到你的新调查员上场了。</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div className="bg-[#f1ebe0] p-4 border border-[#d6cbb5] rounded-sm">
                                    <h4 className="font-bold text-[#5c4a21] mb-2">非玩家角色的健康减损</h4>
                                    <p className="text-sm">在原旨风格中，NPC与调查员遵循相同规则。但在通俗风格中，普通人类（不论打手或路人），一旦健康点数降至0以下，即可判定立刻死去，这能加剧战斗节奏（可视情节对部分NPC也套用此简便规则）。</p>
                                </div>
                                <div className="bg-[#f1ebe0] p-4 border border-[#d6cbb5] rounded-sm">
                                    <h4 className="font-bold text-[#5c4a21] mb-2">非致命伤害</h4>
                                    <p className="text-sm">使用搏击（或短棍等无利刃武器）时可宣布造成非致命伤害。此类攻击不会将健康降至-11以下，若打倒对手只会迫使他进行意识检定。枪械与刀具无法进行非致命攻击（使用致命武器默认意图杀死对手）。</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h3 className="text-xl font-bold text-[#2a4d8a] mb-4 border-l-4 border-[#2a4d8a] pl-3">二、坚毅、心智与疯狂</h3>
                        <div className="space-y-4">
                            <p><strong>【坚毅与心智的区别】</strong> </p>
                            <ul className="list-disc pl-8 space-y-2 pb-2">
                                <li><strong>坚毅（Stability）：</strong> 代表你对精神和情感创伤（自然、人为、超自然）的抵抗能力。你可以把它看作精神健康的一般血条，它可以迅速大幅下降，但通常也在剧本间歇期完全恢复。是个<strong>衡量你当前距离发疯有多近的短期指标</strong>。</li>
                                <li><strong>心智（Sanity）：</strong> 是让你相信、关心并依靠人类世界（宗教、家庭、科学等日常基石）的能力。除非目睹旧日支配者、失去心智支柱或经历“彻底揭示”，否则一次冒险只会损失极少心智。心智恢复十分缓慢（在原旨风格中更是不可恢复）。是个<strong>衡量你对这荒凉可怕的宇宙有着多深认识的长期指标</strong>。</li>
                            </ul>

                            <p><strong>【坚毅的减损】</strong> 当事件（不仅是超自然，可以是暴力、隔离等应激反应）让角色失去自制时，需进行<strong>难度为4的坚毅检定</strong>。如果检定失败，除了失去规定的点数以外，还要扣除先前主动耗用的坚毅点数。盲目耗用比失败失去更多点数的坚毅是不明智的。</p>
                            <p className="indent-[2em]">如果面临神话因素的打击，性质则更恶劣：坚毅检定难度值至少+1，减损数值也更多。在极度需要时（如施放咒语），你可以将自己的坚毅耗用至负值，但<strong>不得将其降至-11以下</strong>。在一次遭遇中，累计失去的坚毅点数存在上限，该上限等于整场事件中单一引起的最大坚毅减损数值。</p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h3 className="text-xl font-bold text-[#8a702a] mb-4 border-l-4 border-[#8a702a] pl-3">三、动力与强行推动</h3>
                        <div className="space-y-4">
                            <p>如果小说人物均由理性的玩家扮演，“恐怖氛围”将不复存在。而你的<strong>动力（Drive）</strong>迫使你抛弃理性，给予你一种无法抑制的自我毁灭冲动。当你不知该如何扮演时，守秘人会建议你如何行动以满足这股冲动。</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-[#fff9e6] p-4 border border-[#daaa39] rounded-sm">
                                    <h4 className="font-bold text-[#8a702a] mb-2">事件推动与拒绝代价</h4>
                                    <ul className="list-disc pl-5 text-[14px] space-y-2">
                                        <li><strong>强行推动：</strong> 守秘人将你的动力安排到主线中推动你进入麻烦。屈服于强行推动可以<strong>恢复2点</strong>坚毅能力池点数；一旦强硬拒绝，你将<strong>失去4点 或 1/3</strong>的当前坚毅点数（取较高者）。</li>
                                        <li><strong>温和推动：</strong> 一些无关主线的小事诱发的日常作死倾向。服从温和推动可<strong>恢复1点</strong>坚毅点数；拒绝温和推动则需<strong>耗费2点</strong>坚毅点数。</li>
                                    </ul>
                                    <p className="text-[13px] mt-2 text-[#5c4a21]">（注意：恢复的坚毅能力池点数永远不得超过你的坚毅等级上限）</p>
                                </div>
                                <div className="bg-[#fff9e6] p-4 border border-[#daaa39] rounded-sm flex flex-col justify-center">
                                    <h4 className="font-bold text-[#8a702a] mb-2">主动扮演与额外奖励</h4>
                                    <p className="text-[14px]">玩家同样可以主动向守秘人建言，提出自身将以何种作死或沉浸的方式服从动力。如果该提议能够<strong>立刻推进故事向前发展</strong>，或者<strong>将自身与队友推入极其危险的境地</strong>，那么该玩家也会获得相应的坚毅点数奖励。一切向剧情与作死妥协！</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h3 className="text-xl font-bold text-[#8a4e2a] mb-4 border-l-4 border-[#8a4e2a] pl-3">四、惊恐不安（疯狂状态恶化）</h3>
                        <div className="space-y-4">
                            <p>当你的坚毅点数降至负数时，根据负值的深度，角色将陷入不同程度的疯狂表现：</p>

                            <ul className="list-none space-y-4 pb-2">
                                <li className="bg-[#f5eeeb] p-4 border border-[#e8d5cc] rounded-sm">
                                    <strong className="text-[#8a4e2a]">【动摇状态】坚毅为 0 到 -5：</strong>
                                    <p className="mt-2 text-[14px]">你仍然可以行动，但受到了严重的干扰和分心。你<strong>不能耗用调查能力点数</strong>。此外，<strong>所有一般能力的检定难度+1</strong>。</p>
                                </li>
                                <li className="bg-[#f2e6e1] p-4 border border-[#dfc3b6] rounded-sm">
                                    <strong className="text-[#8a2a2a]">【崩溃状态】坚毅为 -6 到 -11：</strong>
                                    <p className="mt-2 text-[14px]">除了受到动摇状态的所有负面影响外，你唯一能做的行动就是<strong>惊恐地逃走，或者狂乱地攻击被你视为危险的目标</strong>（或者产生胡言乱语等怪异行为）。守秘人可能直接判定你罹患一种无法痊愈的永久性精神疾病。此外，你<strong>永久地丧失 1 个坚毅等级</strong>（重新获得只能靠花费角色创建点数）。</p>
                                </li>
                                <li className="bg-[#f1dede] p-4 border border-[#e3bdbc] rounded-sm">
                                    <strong className="text-[#aa0000]">【彻底疯狂】坚毅为 -12 或更低：</strong>
                                    <p className="mt-2 text-[14px]">你无可挽救地陷入了疯狂的大门。在角色报废前，你可以进行最后一次英勇的自我毁灭般的疯狂行动，或者余生将在阳光病房进行电击治疗中度过。调查员宣告退休（或死亡）。</p>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h3 className="text-xl font-bold text-[#452a8a] mb-4 border-l-4 border-[#452a8a] pl-3">五、心智的丧失与挽回</h3>
                        <div className="space-y-4">
                            <p>亲身经历神话事件、发掘出深层恐怖或使用克苏鲁神话能力，会直接对你的心智造成破坏。大部分情况下，<strong>你无法通过检定来避免心智的丧失</strong>。</p>

                            <div className="grid grid-cols-1 space-y-4">
                                <div>
                                    <h4 className="font-bold text-[#452a8a] mb-1">神话性精神休克（直面神话造成的急剧丧失）</h4>
                                    <ul className="list-disc pl-5 text-[14px] space-y-1">
                                        <li>当遭遇神话事件陷入<strong>动摇状态</strong>（坚毅降至 0 到 -5）时，你失去 <strong>1点心智等级</strong>。</li>
                                        <li>当遭遇神话事件陷入<strong>崩溃状态</strong>（坚毅降至 -6 到 -11）时，你失去 <strong>2点心智等级</strong>（一次调查中最多只会遭受一次此类严重的丧失）。</li>
                                    </ul>
                                </div>
                                <div className="border-t border-dashed border-[#cbc4d9] pt-4">
                                    <h4 className="font-bold text-[#452a8a] mb-1">心智支柱与动力的崩塌</h4>
                                    <ul className="list-disc pl-5 text-[14px] space-y-2">
                                        <li><strong>瓦解支柱以保全自我：</strong> 当调查员失去 3 点心智时，他可以选择让自己的一个“心智支柱”从内部主动瓦解，借此吸收该经历可能造成的剧烈心理激荡。这往往会导致后续涉及特定知识领域时的失态扮演。</li>
                                        <li><strong>失去最后一个支柱：</strong> 一旦所有支柱皆丧失（或心智降至3以下导致彻底丧失），将角色维系在人类社会的只剩下本能。此后，所有的<strong>坚毅检定需承受难度值+1的惩罚</strong>。</li>
                                        <li><strong>动力不再：</strong> 当世界观破裂，角色的动力显得毫无意义时，即便顺从动力也再无法获得坚毅奖励（但抗拒反而仍会损失）。这被视为绝望的泥沼。</li>
                                    </ul>
                                </div>
                            </div>

                            <p className="border-t border-dashed border-[#cbc4d9] pt-4 font-bold text-[#5c4a21]">避免心智彻底丧失的保护机制：</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="bg-[#edeef4] p-4 border border-[#c1c6dd] rounded-sm">
                                    <h4 className="font-bold text-[#452a8a] mb-2">1. 拒斥事实（自我欺骗）</h4>
                                    <p className="text-[13px] text-slate-700">如果在冒险结束后，没有留下任何物证能证实这段恐怖经历，守秘人可以允许你“什么都没发生过”，使你<strong>恢复 1 个心智等级</strong>（但不超上限）。守秘人可能强迫你患有某种保护性的失忆。如果日后你重新使用了神话知识引起起回忆，这一心智将立即被扣除。<br /><span className="text-[#8a2a2a]">（注：心智降到0或更低后，将无法再进行“拒斥”）</span></p>
                                </div>
                                <div className="bg-[#edeef4] p-4 border border-[#c1c6dd] rounded-sm">
                                    <h4 className="font-bold text-[#452a8a] mb-2">2. 陷入昏厥（机体自我保护）</h4>
                                    <p className="text-[13px] text-slate-700">在神话真相揭示的最高峰，你可以主动宣布控制角色深度昏厥。该调查员退出当前场景的剩余剧情进展，并在昏厥期间受尽同伴和怪物的摆布，但<strong>只会损失 1 点心智点数</strong>。<br /><span className="text-[#8a2a2a]">（注：亲手施放咒语或使用克苏鲁神话能力造成的心智消耗无法通过此方法规避）</span></p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default RulesPage;
