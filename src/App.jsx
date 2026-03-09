/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, TrendingUp, Lock, Settings, RefreshCw, Trash2, Bell, Info, ArrowUpCircle, Filter } from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function App() {
  // ============================================
  // 🔐 DURUM YÖNETİMİ
  // ============================================
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState(() => localStorage.getItem('appPassword') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cashBalance, setCashBalance] = useState(50000); // Yatırım için bekleyen nakit

  // ============================================
  // 💰 PORTFÖY VE FINTABLES VERİLERİ (GÜNCELLENDİ)
  // ============================================
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('myPrivatePortfolio');
    return saved ? JSON.parse(saved) : [
      { id: 1, symbol: 'ANSGR', quantity: 306, buyPrice: 26.97, currentPrice: 26.28, investedAmount: 8249.82, currentAmount: 8041.68, status: 'Ucuz', pe: 6.2 },
      { id: 2, symbol: 'CLEBI', quantity: 3, buyPrice: 1831.33, currentPrice: 1668.00, investedAmount: 5494.00, currentAmount: 5004.00, status: 'Pahalı', pe: 14.5 },
      { id: 3, symbol: 'FROTO', quantity: 100, buyPrice: 117.51, currentPrice: 105.00, investedAmount: 11751.00, currentAmount: 10500.00, status: 'Güçlü Al', pe: 8.1 },
      { id: 4, symbol: 'GLYHO', quantity: 538, buyPrice: 15.58, currentPrice: 13.26, investedAmount: 8382.04, currentAmount: 7133.88, status: 'Ucuz', pe: 4.8 },
      { id: 5, symbol: 'ISMEN', quantity: 427, buyPrice: 48.81, currentPrice: 43.00, investedAmount: 20841.87, currentAmount: 18361.00, status: 'Dengeli', pe: 7.4 },
      { id: 6, symbol: 'TBORG', quantity: 16, buyPrice: 167.36, currentPrice: 155.10, investedAmount: 2677.76, currentAmount: 2481.60, status: 'Dengeli', pe: 9.2 },
      { id: 7, symbol: 'TRGYO', quantity: 60, buyPrice: 84.17, currentPrice: 76.75, investedAmount: 5050.20, currentAmount: 4605.00, status: 'Ucuz', pe: 3.1 },
      { id: 8, symbol: 'TUPRS', quantity: 45, buyPrice: 226.11, currentPrice: 274.00, investedAmount: 10174.95, currentAmount: 12330.00, status: 'Pahalı', pe: 11.2 },
      { id: 9, symbol: 'KLKIM', quantity: 50, buyPrice: 37.11, currentPrice: 34.40, investedAmount: 1855.50, currentAmount: 1720.00, status: 'Güçlü Al', pe: 6.9 },
      { id: 10, symbol: 'MGROS', quantity: 9, buyPrice: 661.17, currentPrice: 563.50, investedAmount: 5950.50, currentAmount: 5071.50, status: 'Dengeli', pe: 10.5 },
      { id: 11, symbol: 'PGSUS', quantity: 25, buyPrice: 202.40, currentPrice: 168.90, investedAmount: 5060.00, currentAmount: 4222.50, status: 'Ucuz', pe: 5.5 },
      { id: 12, symbol: 'RYGYO', quantity: 628, buyPrice: 30.03, currentPrice: 29.52, investedAmount: 18858.84, currentAmount: 18538.56, status: 'Dengeli', pe: 4.2 },
      { id: 13, symbol: 'TATGD', quantity: 137, buyPrice: 17.50, currentPrice: 17.54, investedAmount: 2397.50, currentAmount: 2402.98, status: 'Ucuz', pe: 7.1 }
    ];
  });

  // ============================================
  // 📰 BAYTUTUMLU VE HABER ANALİZ SİSTEMİ
  // ============================================
  const signals = [
    { type: 'KAP', title: 'FROTO Yatırım Teşvik Belgesi', impact: 'Pozitif', desc: 'Gelecek büyüme potansiyeli arttı.' },
    { type: 'BAYTUTUMLU', title: 'Temettü Portföyü Güncelleme', impact: 'Nötr', desc: 'Nakit oranını %10 artırdı.' },
    { type: 'FINTABLES', title: 'TRGYO Çarpan Analizi', impact: 'Pozitif', desc: 'Sektörün en ucuz kağıdı.' }
  ];

  // ============================================
  // 🔄 CANLI VERİ VE ANALİZ MOTORU
  // ============================================
  const fetchLiveData = useCallback(async () => {
    setIsRefreshing(true);
    // Gerçek uygulamada burada Midas/Finbo API çağrısı yapılacak
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  const totals = {
    current: portfolio.reduce((a, b) => a + b.currentAmount, 0),
    invested: portfolio.reduce((a, b) => a + b.investedAmount, 0),
  };
  totals.diff = totals.current - totals.invested;
  totals.perc = ((totals.diff / totals.invested) * 100).toFixed(2);

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-2xl">
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <Lock className="text-blue-500" size={32} />
          </div>
          <h2 className="text-2xl font-black mb-6 tracking-tight">FİNANSAL ÖZGÜRLÜK</h2>
          <input 
            type="password" 
            className="w-full p-4 bg-slate-800 rounded-2xl mb-4 text-center text-2xl border border-slate-700 outline-none focus:ring-2 ring-blue-500" 
            placeholder="Şifre"
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && passwordInput === password && setIsLocked(false)}
          />
          <button 
            onClick={() => passwordInput === password && setIsLocked(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
          >GİRİŞ YAP</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-28">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 border-b border-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl"><TrendingUp size={20}/></div>
          <div>
            <h1 className="font-black text-sm uppercase">Yatırım Terminali</h1>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Canlı • Verimli</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-400">NAKİT:</span>
             <span className="text-xs font-black">₺{cashBalance.toLocaleString()}</span>
          </div>
          <button onClick={() => setIsLocked(true)} className="p-2 bg-slate-900 rounded-full border border-slate-800"><Lock size={16}/></button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {activeTab === 'dashboard' && (
          <>
            {/* PORTFÖY ÖZETİ */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-3xl border border-slate-800">
                  <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Toplam Portföy</p>
                  <p className="text-2xl font-black">₺{(totals.current / 1000).toFixed(1)}K</p>
               </div>
               <div className={`p-5 rounded-3xl border ${totals.diff >= 0 ? 'bg-green-600/10 border-green-600/30' : 'bg-red-600/10 border-red-600/30'}`}>
                  <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Toplam Getiri</p>
                  <p className={`text-2xl font-black ${totals.diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>%{totals.perc}</p>
               </div>
            </div>

            {/* ALIM SİNYALLERİ (FINBO/BAYTUTUMLU) */}
            <section className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <ArrowUpCircle size={14} className="text-blue-500" /> Alım Fırsatları (Maliyet Düşür)
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {portfolio.filter(s => s.status === 'Güçlü Al' || s.status === 'Ucuz').slice(0, 4).map(s => (
                  <div key={s.id} className="min-w-[140px] bg-slate-900 p-4 rounded-2xl border border-blue-500/20">
                    <p className="font-black text-blue-400">{s.symbol}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{s.status}</p>
                    <p className="text-xs mt-2 font-black text-green-500">F/K: {s.pe}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* HABER VE ANALİZ AKIŞI */}
            <section className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
               <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Sinyal & Haber Akışı</h3>
                  <Bell size={14} className="text-yellow-500" />
               </div>
               <div className="divide-y divide-slate-800">
                  {signals.map((sig, i) => (
                    <div key={i} className="p-4 hover:bg-slate-800/50 transition">
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] font-black px-2 py-0.5 bg-blue-600 rounded text-white uppercase">{sig.type}</span>
                        <span className={`text-[9px] font-bold ${sig.impact === 'Pozitif' ? 'text-green-500' : 'text-slate-400'}`}>{sig.impact}</span>
                      </div>
                      <p className="text-xs font-bold">{sig.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{sig.desc}</p>
                    </div>
                  ))}
               </div>
            </section>
          </>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-3">
             <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Hisse Detay Analizi</h3>
                <Filter size={16} className="text-slate-500" />
             </div>
             {portfolio.map(s => (
               <div key={s.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center transition-active active:scale-95">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-xs text-blue-400 border border-slate-700">{s.symbol[0]}</div>
                    <div>
                      <p className="font-black text-sm">{s.symbol}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{s.quantity} Adet • Maliyet: ₺{s.buyPrice}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm">₺{s.currentPrice}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${s.status === 'Güçlü Al' ? 'bg-green-600/20 text-green-500' : 'bg-slate-800 text-slate-400'}`}>
                      {s.status}
                    </span>
                  </div>
               </div>
             ))}
          </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-3xl p-2 flex justify-around shadow-2xl z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`p-4 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><TrendingUp size={24}/></button>
        <button onClick={() => setActiveTab('portfolio')} className={`p-4 rounded-2xl transition-all ${activeTab === 'portfolio' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><Settings size={24}/></button>
        <button className="p-4 text-slate-500"><Bell size={24}/></button>
        <button onClick={() => {if(window.confirm('Verileri sıfırla?')) localStorage.clear()}} className="p-4 text-slate-500"><Trash2 size={24}/></button>
      </nav>
    </div>
  );
}
