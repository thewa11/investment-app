import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Trash2, Edit3, X, Save, TrendingUp, Lock, Zap, 
  PieChart as PieIcon, Eye, EyeOff, LayoutDashboard, Briefcase, Bell
} from 'lucide-react';

// --- GİZLİLİK KATMANI: VERİ ŞİFRELEME ---
const encryptData = (data) => btoa(JSON.stringify(data)); // Basit obfuscation (gizleme)
const decryptData = (data) => data ? JSON.parse(atob(data)) : null;

export default function App() {
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('session_active') !== 'true');
  const [password, setPassword] = useState('');
  const [hideValues, setHideValues] = useState(false); // Mali durumu gizleme modu
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- PORTFÖY STATE ---
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('user_portfolio_enc');
    return decryptData(saved) || [
      { id: 1, symbol: 'FROTO', quantity: 10, buyPrice: 1000, currentPrice: 1050, pe: 8.5 },
      { id: 2, symbol: 'TUPRS', quantity: 50, buyPrice: 160, currentPrice: 175, pe: 7.2 }
    ];
  });

  // Yeni Hisse Form State
  const [newItem, setNewItem] = useState({ symbol: '', quantity: '', buyPrice: '', currentPrice: '', pe: '' });

  // Veri her değiştiğinde şifreli kaydet
  useEffect(() => {
    localStorage.setItem('user_portfolio_enc', encryptData(portfolio));
  }, [portfolio]);

  // --- HESAPLAMALAR ---
  const stats = useMemo(() => {
    const totalInv = portfolio.reduce((a, b) => a + (b.quantity * b.buyPrice), 0);
    const totalCur = portfolio.reduce((a, b) => a + (b.quantity * b.currentPrice), 0);
    const profit = totalCur - totalInv;
    const perc = totalInv > 0 ? (profit / totalInv) * 100 : 0;
    return { totalInv, totalCur, profit, perc };
  }, [portfolio]);

  // --- AKSİYONLAR ---
  const handleAddStock = () => {
    if (!newItem.symbol || !newItem.quantity) return;
    setPortfolio([...portfolio, { ...newItem, id: Date.now(), 
      quantity: Number(newItem.quantity), 
      buyPrice: Number(newItem.buyPrice), 
      currentPrice: Number(newItem.currentPrice || newItem.buyPrice),
      pe: Number(newItem.pe || 0)
    }]);
    setNewItem({ symbol: '', quantity: '', buyPrice: '', currentPrice: '', pe: '' });
    setIsAddModalOpen(false);
  };

  const removeStock = (id) => setPortfolio(portfolio.filter(s => s.id !== id));

  const login = () => {
    if (password === '1234') {
      localStorage.setItem('session_active', 'true');
      setIsLocked(false);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-sm bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] text-center shadow-2xl">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 animate-pulse">
            <Lock className="text-blue-500" size={32} />
          </div>
          <h1 className="text-xl font-black mb-8 tracking-widest uppercase italic">GİZLİ TERMİNAL</h1>
          <input 
            type="password" autoFocus
            className="w-full p-5 bg-black/50 rounded-2xl mb-4 text-center text-3xl border border-white/10 outline-none focus:ring-2 ring-blue-600"
            placeholder="****"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
          />
          <button onClick={login} className="w-full bg-blue-600 p-5 rounded-2xl font-black hover:bg-blue-500 transition-all">SİSTEMİ AÇ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 pb-32 font-sans overflow-x-hidden">
      {/* HEADER */}
      <header className="p-6 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-[50] border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <h1 className="text-lg font-black text-white italic leading-none">TUTUMLU.AI</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setHideValues(!hideValues)} className="p-3 bg-white/5 rounded-2xl border border-white/5">
            {hideValues ? <Eye size={18}/> : <EyeOff size={18}/>}
          </button>
          <button onClick={() => { localStorage.removeItem('session_active'); setIsLocked(true); }} className="p-3 bg-red-900/10 text-red-500 rounded-2xl border border-red-900/10"><Lock size={18}/></button>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        {activeTab === 'dashboard' && (
          <>
            {/* CANLI KARTLAR */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-slate-900 to-blue-900/20 p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Toplam Portföy Değeri</p>
                <p className="text-4xl font-black text-white tracking-tighter">
                  {hideValues ? '₺ *******' : `₺${stats.totalCur.toLocaleString(undefined, {maximumFractionDigits:0})}`}
                </p>
                <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black ${stats.perc >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {stats.perc >= 0 ? '↑' : '↓'} %{Math.abs(stats.perc).toFixed(2)}
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={120}/></div>
              </div>

              <div className="bg-[#0a0c12] p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
                <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Net Kâr / Zarar</p>
                    <p className={`text-2xl font-black ${stats.profit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {hideValues ? '₺ ****' : `₺${stats.profit.toLocaleString()}`}
                    </p>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{width: '70%'}}></div>
                </div>
              </div>
            </section>

            {/* HIZLI HABERLER */}
            <section className="space-y-4">
               <div className="flex justify-between items-center px-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Bell size={14} className="text-blue-500" /> Akıllı Sinyaller
                  </h3>
               </div>
               <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-3xl flex gap-4 items-center">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Zap size={18} className="text-blue-400" />
                  </div>
                  <p className="text-xs font-bold text-blue-100/80 leading-relaxed">
                    Baytutumlu Analizi: Portföyündeki <span className="text-white">FROTO</span> için güçlü destek seviyeleri korunuyor. Maliyet düşürmek için uygun bölge.
                  </p>
               </div>
            </section>
          </>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Varlık Yönetimi</h2>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-2xl flex items-center gap-2 text-xs font-black transition-all shadow-lg shadow-blue-900/20"
              >
                <Plus size={18} /> YENİ EKLE
              </button>
            </div>

            <div className="grid gap-4">
              {portfolio.map(s => (
                <div key={s.id} className="bg-[#0a0c12] p-5 rounded-[2rem] border border-white/5 flex justify-between items-center group transition-all hover:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center font-black text-blue-500 italic border border-white/5">{s.symbol.substring(0,2)}</div>
                    <div>
                      <p className="font-black text-white tracking-tight text-lg">{s.symbol}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{s.quantity} Adet • Maliyet: {hideValues ? '***' : s.buyPrice}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-black text-white tracking-tight">₺{hideValues ? '***' : s.currentPrice}</p>
                      <p className={`text-[10px] font-black ${s.currentPrice >= s.buyPrice ? 'text-emerald-500' : 'text-rose-500'}`}>
                        %{(((s.currentPrice - s.buyPrice) / s.buyPrice) * 100).toFixed(1)}
                      </p>
                    </div>
                    <button onClick={() => removeStock(s.id)} className="p-2 text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: YENİ HİSSE EKLE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#0f172a] w-full max-w-md p-8 rounded-[3rem] border border-white/10 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white italic">PORTFÖYE EKLE</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500"><X /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Hisse (Örn: THYAO)" className="bg-black/40 border border-white/5 p-4 rounded-2xl col-span-2 text-white font-bold outline-none focus:border-blue-500" onChange={e => setNewItem({...newItem, symbol: e.target.value.toUpperCase()})} />
              <input type="number" placeholder="Adet" className="bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-bold outline-none" onChange={e => setNewItem({...newItem, quantity: e.target.value})} />
              <input type="number" placeholder="Maliyet" className="bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-bold outline-none" onChange={e => setNewItem({...newItem, buyPrice: e.target.value})} />
              <input type="number" placeholder="F/K (Opsiyonel)" className="bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-bold outline-none" onChange={e => setNewItem({...newItem, pe: e.target.value})} />
            </div>
            <button onClick={handleAddStock} className="w-full bg-blue-600 p-5 rounded-2xl font-black text-white shadow-xl">KAYDET</button>
          </div>
        </div>
      )}

      {/* TAB BAR */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex gap-1 shadow-2xl z-[100]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-8 py-4 rounded-[2rem] transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
          <LayoutDashboard size={20}/>
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Özet</span>
        </button>
        <button onClick={() => setActiveTab('portfolio')} className={`flex items-center gap-2 px-8 py-4 rounded-[2rem] transition-all ${activeTab === 'portfolio' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
          <Briefcase size={20}/>
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Portföy</span>
        </button>
      </nav>
    </div>
  );
}
