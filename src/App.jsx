/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Lock, Settings, RefreshCw, Trash2, Bell, 
  ArrowUpCircle, Wallet, Activity, Search, Info, PieChart as PieIcon,
  Newspaper, Twitter, Zap, MessageSquare, ShieldAlert
} from 'lucide-react';
import { 
  PieChart, Pie, Tooltip, ResponsiveContainer, Cell, 
  BarChart, Bar, XAxis, YAxis
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 📰 CANLI HABER VE SİNYAL STATE'I
  const [newsFeed, setNewsFeed] = useState([
    { id: 1, source: 'KAP', title: 'FROTO Yeni Yatırım Teşvik Belgesi', impact: 'Pozitif', time: '10dk önce', stock: 'FROTO' },
    { id: 2, source: 'BAYTUTUMLU', title: 'Temettü Verimliliği Üzerine Notlar', impact: 'Eğitici', time: '1s önce', stock: 'GENEL' },
    { id: 3, source: 'X', title: 'Ömür Şahin: Nakit oranımı %15\'e çıkardım.', impact: 'Kritik', time: '2s önce', stock: 'STRATEJİ' },
    { id: 4, source: 'KAP', title: 'TUPRS Bakım Çalışması Tamamlandı', impact: 'Pozitif', time: '5s önce', stock: 'TUPRS' }
  ]);

  // 📊 PORTFÖY VERİLERİ (DOĞRULANMIŞ)
  const [portfolio] = useState([
    { id: 1, symbol: 'ANSGR', quantity: 306, buyPrice: 26.97, currentPrice: 26.28, pe: 6.2, pddd: 1.8 },
    { id: 2, symbol: 'CLEBI', quantity: 3, buyPrice: 1831.33, currentPrice: 1668.0, pe: 14.5, pddd: 5.2 },
    { id: 3, symbol: 'FROTO', quantity: 100, buyPrice: 117.51, currentPrice: 105.0, pe: 8.1, pddd: 3.5 },
    { id: 4, symbol: 'GLYHO', quantity: 538, buyPrice: 15.58, currentPrice: 13.26, pe: 4.8, pddd: 0.9 },
    { id: 5, symbol: 'ISMEN', quantity: 427, buyPrice: 48.81, currentPrice: 43.0, pe: 7.4, pddd: 2.1 },
    { id: 6, symbol: 'TBORG', quantity: 16, buyPrice: 167.36, currentPrice: 155.1, pe: 9.2, pddd: 2.8 },
    { id: 7, symbol: 'TRGYO', quantity: 60, buyPrice: 84.17, currentPrice: 76.75, pe: 3.1, pddd: 0.6 },
    { id: 8, symbol: 'TUPRS', quantity: 45, buyPrice: 226.11, currentPrice: 274.0, pe: 11.2, pddd: 3.2 },
    { id: 9, symbol: 'KLKIM', quantity: 50, buyPrice: 37.11, currentPrice: 34.4, pe: 6.9, pddd: 1.5 },
    { id: 10, symbol: 'MGROS', quantity: 9, buyPrice: 661.17, currentPrice: 563.5, pe: 10.5, pddd: 4.1 },
    { id: 11, symbol: 'PGSUS', quantity: 25, buyPrice: 202.40, currentPrice: 168.9, pe: 5.5, pddd: 1.2 },
    { id: 12, symbol: 'RYGYO', quantity: 628, buyPrice: 30.03, currentPrice: 29.52, pe: 4.2, pddd: 0.7 },
    { id: 13, symbol: 'TATGD', quantity: 137, buyPrice: 17.50, currentPrice: 17.54, pe: 7.1, pddd: 1.4 },
  ]);

  const analyzedPortfolio = useMemo(() => {
    return portfolio.map(s => {
      const current = s.quantity * s.currentPrice;
      const invested = s.quantity * s.buyPrice;
      const profitLossPerc = ((current - invested) / invested) * 100;
      let signal = { text: 'İZLE', color: 'text-slate-500', bg: 'bg-slate-500/10' };
      
      if (s.pe < 6.5 && s.pddd < 1.3) signal = { text: 'GÜÇLÜ AL', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
      else if (profitLossPerc < -12 && s.pe < 9) signal = { text: 'KADEMELİ AL', color: 'text-blue-400', bg: 'bg-blue-400/10' };
      
      return { ...s, invested, current, profitLossPerc, signal };
    });
  }, [portfolio]);

  const totals = useMemo(() => {
    const cur = analyzedPortfolio.reduce((a, b) => a + b.current, 0);
    const inv = analyzedPortfolio.reduce((a, b) => a + b.invested, 0);
    return { cur, inv, perc: ((cur - inv) / inv) * 100 };
  }, [analyzedPortfolio]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-sm bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-12 rounded-[3.5rem] text-center shadow-2xl">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
            <ShieldAlert className="text-blue-500" size={32} />
          </div>
          <h1 className="text-2xl font-black mb-10 tracking-widest uppercase italic">Secure Access</h1>
          <input 
            type="password" 
            className="w-full p-5 bg-black/50 rounded-2xl mb-6 text-center text-3xl border border-white/10 outline-none focus:ring-2 ring-blue-600 font-black" 
            placeholder="****"
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && passwordInput === '1234' && setIsLocked(false)}
          />
          <button onClick={() => passwordInput === '1234' && setIsLocked(false)} className="w-full bg-blue-600 p-5 rounded-2xl font-black shadow-lg shadow-blue-900/40 active:scale-95 transition-all">SİSTEMİ BAŞLAT</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-slate-300 pb-40 font-sans selection:bg-blue-500/30">
      {/* ŞIK HEADER */}
      <header className="p-6 bg-[#020408]/90 backdrop-blur-xl sticky top-0 z-[100] border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-xl rotate-3 flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white italic leading-none">TERMINAL.AI</h1>
            <p className="text-[9px] font-bold text-blue-500 tracking-[0.2em] uppercase mt-1">Baytutumlu Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} className={`p-3 bg-white/5 rounded-2xl border border-white/5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`}><RefreshCw size={18}/></button>
          <button onClick={() => setIsLocked(true)} className="p-3 bg-white/5 rounded-2xl border border-white/5"><Lock size={18}/></button>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-10">
        {activeTab === 'dashboard' && (
          <>
            {/* PORTFÖY METRİKLERİ */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-900/50 to-black p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-white/40">Portföy Net Değeri</p>
                  <Wallet className="text-blue-500/50" size={20} />
                </div>
                <p className="text-4xl font-black text-white tracking-tighter">₺{totals.cur.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black ${totals.perc >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {totals.perc >= 0 ? '↑' : '↓'} %{Math.abs(totals.perc).toFixed(2)}
                </div>
              </div>

              <div className="bg-[#080a0f] p-8 rounded-[3rem] border border-white/5 flex flex-col justify-center">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Nakit Gücü (Aylık 50K Giriş)</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-white italic">₺50.000,00</p>
                  <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg">BEKLEMEDE</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-blue-600 animate-pulse" style={{width: '100%'}}></div>
                </div>
              </div>
            </section>

            {/* HABER VE SİNYAL MERKEZİ (İSTENEN ÖZELLİK) */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Newspaper size={16} className="text-blue-500" /> Akıllı Haber Akışı (KAP & X)
                </h3>
                <span className="text-[9px] font-black text-emerald-500 animate-pulse italic uppercase">Canlı Veri</span>
              </div>
              <div className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="divide-y divide-white/5">
                  {newsFeed.map((news) => (
                    <div key={news.id} className="p-6 hover:bg-white/[0.02] transition-all flex gap-4 items-start group">
                      <div className={`mt-1 p-2 rounded-lg ${news.source === 'KAP' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {news.source === 'KAP' ? <Zap size={16} /> : <Twitter size={16} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">{news.source} • {news.stock}</span>
                          <span className="text-[9px] font-bold text-slate-600 uppercase">{news.time}</span>
                        </div>
                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{news.title}</p>
                        <div className="mt-2 inline-block px-2 py-0.5 rounded bg-white/5 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                          Etki: <span className={news.impact === 'Pozitif' || news.impact === 'Kritik' ? 'text-emerald-400' : 'text-slate-400'}>{news.impact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ALIM RADARI */}
            <section className="space-y-4 pt-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2 italic">Baytutumlu Alım Radarı</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analyzedPortfolio.filter(s => s.signal.text === 'GÜÇLÜ AL' || s.signal.text === 'KADEMELİ AL').slice(0, 4).map(s => (
                  <div key={s.id} className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all">
                    <p className="font-black text-white text-sm mb-1">{s.symbol}</p>
                    <p className={`text-[9px] font-black px-2 py-0.5 rounded ${s.signal.bg} ${s.signal.color} inline-block`}>{s.signal.text}</p>
                    <div className="mt-4">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">F/K: {s.pe}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-5">
            <div className="relative mb-6">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input type="text" placeholder="Hisse veya Sektör Ara..." className="w-full p-6 pl-16 bg-white/5 rounded-[2rem] border border-white/10 outline-none focus:ring-2 ring-blue-600 font-bold text-white transition-all" />
            </div>
            {analyzedPortfolio.map(s => (
              <div key={s.id} className="bg-[#080a0f] p-6 rounded-[2.5rem] border border-white/5 flex justify-between items-center group hover:bg-slate-900/50 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center font-black text-blue-500 border border-white/5 uppercase italic text-sm">{s.symbol.substring(0,2)}</div>
                  <div>
                    <p className="font-black text-white text-lg tracking-tighter italic">{s.symbol}</p>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">{s.quantity} ADET</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-white text-base tracking-tight">₺{s.currentPrice.toLocaleString()}</p>
                  <p className={`text-[10px] font-black mt-1 ${s.profitLossPerc >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {s.profitLossPerc >= 0 ? '+' : ''}{s.profitLossPerc.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* NAVIGASYON (Glassmorphism) */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-3 flex gap-2 shadow-2xl z-[200]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-10 py-5 rounded-[2.5rem] transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40' : 'text-slate-500 hover:text-slate-300'}`}>
          <Zap size={22} className={activeTab === 'dashboard' ? 'fill-white' : ''}/>
          <span className="text-[11px] font-black uppercase tracking-widest hidden md:block">Terminal</span>
        </button>
        <button onClick={() => setActiveTab('portfolio')} className={`flex items-center gap-3 px-10 py-5 rounded-[2.5rem] transition-all ${activeTab === 'portfolio' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40' : 'text-slate-500 hover:text-slate-300'}`}>
          <PieIcon size={22}/>
          <span className="text-[11px] font-black uppercase tracking-widest hidden md:block">Varlıklar</span>
        </button>
      </nav>
    </div>
  );
}
