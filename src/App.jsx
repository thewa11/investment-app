/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, TrendingUp, Lock, Settings, RefreshCw, Trash2, Download } from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export default function App() {
  // ============================================
  // 🔐 GÜVENLİK VE STATE
  // ============================================
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState(() => localStorage.getItem('appPassword') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(!localStorage.getItem('appPassword'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const cameraInputRef = useRef(null);

  // ============================================
  // 💰 TÜM HİSSELERİN (EKSİKSİZ)
  // ============================================
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('myPrivatePortfolio');
    return saved ? JSON.parse(saved) : [
      { id: 1, symbol: 'ANSGR', name: 'Angelini', quantity: 306, buyPrice: 26.97, currentPrice: 26.28, investedAmount: 8249.82, currentAmount: 8049.68 },
      { id: 2, symbol: 'TUPRS', name: 'Tuprs', quantity: 45, buyPrice: 226.11, currentPrice: 274.00, investedAmount: 10174.95, currentAmount: 12330.00 },
      { id: 3, symbol: 'İSMEN', name: 'İstek', quantity: 427, buyPrice: 48.81, currentPrice: 43.00, investedAmount: 20841.87, currentAmount: 18361.00 },
      { id: 4, symbol: 'RYGYO', name: 'Rygyo', quantity: 628, buyPrice: 30.03, currentPrice: 29.52, investedAmount: 18858.84, currentAmount: 18538.56 },
      { id: 5, symbol: 'TRGYO', name: 'Türk GYO', quantity: 60, buyPrice: 84.17, currentPrice: 76.75, investedAmount: 5050.20, currentAmount: 4605.00 },
      { id: 6, symbol: 'TBORG', name: 'Türk Borsa', quantity: 16, buyPrice: 167.36, currentPrice: 155.10, investedAmount: 2677.76, currentAmount: 2481.60 },
      { id: 7, symbol: 'PGSUS', name: 'Pegasus', quantity: 25, buyPrice: 202.40, currentPrice: 168.90, investedAmount: 5060.00, currentAmount: 4222.50 },
      { id: 8, symbol: 'MGROS', name: 'Migros', quantity: 9, buyPrice: 661.17, currentPrice: 563.50, investedAmount: 5950.50, currentAmount: 5071.50 },
      { id: 9, symbol: 'KLKIM', name: 'Klkim', quantity: 50, buyPrice: 37.11, currentPrice: 34.40, investedAmount: 1855.50, currentAmount: 1720.00 },
      { id: 10, symbol: 'FROTO', name: 'Froto', quantity: 100, buyPrice: 117.51, currentPrice: 105.00, investedAmount: 11751.00, currentAmount: 10500.00 },
      { id: 11, symbol: 'GLYHO', name: 'Glyho', quantity: 538, buyPrice: 15.58, currentPrice: 13.26, investedAmount: 8382.04, currentAmount: 7138.88 },
      { id: 12, symbol: 'CLEBI', name: 'Çelebı', quantity: 3, buyPrice: 1831.33, currentPrice: 1668.00, investedAmount: 5494.00, currentAmount: 5004.00 },
      { id: 13, symbol: 'TATGD', name: 'Tatgd', quantity: 137, buyPrice: 17.50, currentPrice: 17.54, investedAmount: 2397.50, currentAmount: 2402.98 }
    ];
  });

  const [analysisHistory, setAnalysisHistory] = useState(() => {
    const saved = localStorage.getItem('myPrivateAnalysis');
    return saved ? JSON.parse(saved) : [];
  });

  // ============================================
  // 🔄 CANLI VERİ MOTORU (GELİŞMİŞ)
  // ============================================
  const fetchLiveData = useCallback(async () => {
    setIsRefreshing(true);
    const symbols = portfolio.map(p => p.symbol);
    try {
      const res = await fetch('https://www.getmidas.com/canli-borsa');
      if (res.ok) {
        const html = await res.text();
        const prices = {};
        const regex = /data-symbol="(\w+)"[^>]*>([0-9,.]+)</g;
        let match;
        while ((match = regex.exec(html)) !== null) {
          if (symbols.includes(match[1])) {
            prices[match[1]] = parseFloat(match[2].replace(',', '.'));
          }
        }
        
        if (Object.keys(prices).length > 0) {
          setPortfolio(prev => prev.map(stock => {
            if (prices[stock.symbol]) {
              const newP = prices[stock.symbol];
              return { ...stock, currentPrice: newP, currentAmount: stock.quantity * newP };
            }
            return stock;
          }));
        }
      }
    } catch (e) { console.error("Bağlantı Hatası"); }
    setIsRefreshing(false);
  }, [portfolio]);

  useEffect(() => {
    fetchLiveData();
    const timer = setInterval(fetchLiveData, 300000);
    return () => clearInterval(timer);
  }, []);

  // ============================================
  // 🛠️ YARDIMCI FONKSİYONLAR
  // ============================================
  const setupPassword = () => {
    if (passwordInput.length < 4) return alert('Min 4 karakter');
    localStorage.setItem('appPassword', passwordInput);
    setPassword(passwordInput);
    setShowPasswordSetup(false);
  };

  const verifyPassword = () => {
    if (passwordInput === password) setIsLocked(false);
    else alert('Şifre Yanlış');
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target.result;
        setUploadedImage(result);
        setAnalysisHistory(prev => [{ date: new Date().toLocaleString(), val: totals.current }, ...prev].slice(0, 5));
      };
      reader.readAsDataURL(file);
    }
  };

  const totals = {
    invested: portfolio.reduce((a, b) => a + b.investedAmount, 0),
    current: portfolio.reduce((a, b) => a + b.currentAmount, 0)
  };
  totals.gainLoss = totals.current - totals.invested;
  totals.percent = ((totals.gainLoss / totals.invested) * 100).toFixed(2);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // ============================================
  // 🔒 KİLİT EKRANLARI
  // ============================================
  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-sm bg-slate-800 p-8 rounded-2xl border border-blue-500/30 text-center shadow-2xl">
          <Lock className="mx-auto text-blue-400 mb-4" size={50} />
          <h2 className="text-xl font-bold mb-6">{showPasswordSetup ? 'Şifre Ayarla' : 'Kilitli'}</h2>
          <input 
            type="password" 
            className="w-full p-3 bg-slate-700 rounded-lg mb-4 text-center text-xl tracking-widest border border-slate-600 focus:border-blue-500 outline-none" 
            placeholder="****"
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (showPasswordSetup ? setupPassword() : verifyPassword())}
          />
          <button 
            onClick={showPasswordSetup ? setupPassword : verifyPassword} 
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-bold transition-all"
          >
            {showPasswordSetup ? 'Kaydet' : 'Aç'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // 📱 ANA UYGULAMA
  // ============================================
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 font-sans">
      <header className="sticky top-0 z-50 p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h1 className="font-bold text-lg tracking-tight">ÖZEL PORTFÖY</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchLiveData} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setIsLocked(true)} className="p-2 bg-red-900/30 text-red-400 rounded-full">
            <Lock size={20} />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-semibold">Toplam Varlık</p>
                <p className="text-2xl font-black text-blue-400">₺{(totals.current / 1000).toFixed(1)}K</p>
              </div>
              <div className={`bg-slate-800/50 p-4 rounded-2xl border border-slate-700 ${totals.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-semibold">Getiri</p>
                <p className="text-2xl font-black">{totals.percent}%</p>
              </div>
            </div>

            <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-700 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={portfolio} 
                    dataKey="currentAmount" 
                    nameKey="symbol" 
                    cx="50%" cy="50%" 
                    innerRadius={60} outerRadius={80} 
                    paddingAngle={5}
                  >
                    {portfolio.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {activeTab === 'portfolio' && (
          <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Hisselerim</h3>
            {portfolio.map((s) => {
              const diff = s.currentAmount - s.investedAmount;
              return (
                <div key={s.id} className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 flex justify-between items-center group active:scale-95 transition-all">
                  <div>
                    <p className="font-black text-lg group-hover:text-blue-400 transition">{s.symbol}</p>
                    <p className="text-xs text-slate-500">{s.quantity} Adet • ₺{s.buyPrice} Başlangıç</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₺{s.currentPrice.toFixed(2)}</p>
                    <p className={`text-xs font-bold ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {diff >= 0 ? '+' : ''}₺{diff.toFixed(0)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h3 className="font-bold mb-4">Veri Yönetimi</h3>
                <button 
                  onClick={() => { if(window.confirm('Veriler silinsin mi?')) { localStorage.clear(); window.location.reload(); } }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-900/20 text-red-500 rounded-xl border border-red-900/50 font-bold"
                >
                  <Trash2 size={18} /> Tüm Verileri Sıfırla
                </button>
             </div>
             <div className="bg-blue-900/10 p-6 rounded-2xl border border-blue-900/30">
                <p className="text-xs text-blue-300 leading-relaxed">
                  🔒 Tüm verileriniz tarayıcınızın yerel depolama alanında tutulur. İnternete veya bulut sunucularına aktarılmaz.
                </p>
             </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl flex justify-around p-3 shadow-2xl z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : 'text-slate-500'}`}><TrendingUp size={24}/></button>
        <button onClick={() => setActiveTab('portfolio')} className={`p-3 rounded-2xl transition-all ${activeTab === 'portfolio' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : 'text-slate-500'}`}><Settings size={24}/></button>
        <button onClick={() => cameraInputRef.current.click()} className="p-3 text-slate-500 hover:text-white transition-all"><Camera size={24}/></button>
        <button onClick={() => setActiveTab('settings')} className={`p-3 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : 'text-slate-500'}`}><Trash2 size={24}/></button>
        <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageCapture} />
      </nav>
    </div>
  );
}
