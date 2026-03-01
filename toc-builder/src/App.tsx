import { Download, Upload } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200">
        <header className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">TOC (克苏鲁的踪迹) 角色卡生成器</h1>
            <p className="text-slate-300 mt-1">根据 1.4.1 版本规则设计</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors text-sm font-medium">
              <Upload size={16} />
              导入数据
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded transition-colors text-sm font-medium">
              <Download size={16} />
              导出 JSON
            </button>
          </div>
        </header>

        <main className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="col-span-2 space-y-8">
            <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h2 className="text-xl font-bold border-b border-slate-300 pb-2 mb-4">基本信息 (Basic Info)</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">调查员姓名</label>
                  <input type="text" className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="输入姓名..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">玩家</label>
                  <input type="text" className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="玩家名称..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">职业</label>
                  <input type="text" className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="选择或输入职业..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">建卡点数 (调查 / 一般)</label>
                  <div className="flex gap-2 items-center">
                    <input type="number" className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0" />
                    <span>/</span>
                    <input type="number" className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0" />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h2 className="text-xl font-bold border-b border-slate-300 pb-2 mb-4">核心驱动 (Drives & Sanity)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">动力 (Drive)</label>
                  <select className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option>冒险</option>
                    <option>好古</option>
                    <option>自大</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">心智支柱 (Pillars of Sanity)</label>
                  <textarea className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none h-24" placeholder="描述你的心智支柱..." />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h2 className="text-xl font-bold border-b border-slate-300 pb-2 mb-4">状态属性</h2>
              <div className="space-y-4">
                {['理智 (Sanity)', '稳定 (Stability)', '健康 (Health)'].map(stat => (
                  <div key={stat}>
                    <label className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                      <span>{stat}</span>
                      <span className="text-slate-500">上限 / 当前</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="number" className="w-1/2 border border-slate-300 rounded p-2 text-center font-bold" defaultValue="0" />
                      <span className="text-slate-400">/</span>
                      <input type="number" className="w-1/2 border border-slate-300 rounded p-2 text-center" defaultValue="0" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
