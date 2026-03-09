import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, RefreshCw, TrendingUp, TrendingDown, Bell, BarChart3, Zap, Download, Trash2, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function ProBISTApp() {
  // 🔐 ŞIFRE VE KİLİT
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('proApp_locked') !== 'false');
  const [password, setPassword] = useState(() => localStorage.getItem('proApp_password') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(!localStorage.getItem('proApp_password'));
  const [hideValues, setHideValues] = useState(false);

  // 📊 PORTFÖY
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('proApp_portfolio');
    return saved ? JSON.parse(saved) : [
      { id: 1, symbol: 'ANSGR', quantity: 306, buyPrice: 26.97, currentPrice: 26.28 },
      { id: 2, symbol: 'TUPRS', quantity: 45, buyPrice: 226.11, currentPrice: 274.00 },
      { id: 3, symbol: 'İSMEN', quantity: 427, buyPrice: 48.81, currentPrice: 43.00 },
      { id: 4, symbol: 'RYGYO', quantity: 628, buyPrice: 30.03, currentPrice: 29.52 },
      { id: 5, symbol: 'TRGYO', quantity: 60, buyPrice: 84.17, currentPrice: 76.75 },
      { id: 6, symbol: 'TBORG', quantity: 16, buyPrice: 167.36, currentPrice: 155.10 },
      { id: 7, symbol: 'PGSUS', quantity: 25, buyPrice: 202.40, currentPrice: 168.90 },
      { id: 8, symbol: 'MGROS', quantity: 9, buyPrice: 661.17, currentPrice: 563.50 },
      { id: 9, symbol: 'KLKIM', quantity: 50, buyPrice: 37.11, currentPrice: 34.40 },
      { id: 10, symbol: 'FROTO', quantity: 100, buyPrice: 117.51, currentPrice: 105.00 },
      { id: 11, symbol: 'GLYHO', quantity: 538, buyPrice: 15.58, currentPrice: 13.26 },
      { id: 12, symbol: 'CLEBI', quantity: 3, buyPrice: 1831.33, currentPrice: 1668.00 },
      { id: 13, symbol: 'TATGD', quantity: 137, buyPrice: 17.50, currentPrice: 17.54 }
    ];
  });

  // 📈 BIST100
  const [bist100, setBist100] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetchingBist, setIsFetchingBist] = useState(false);

  const [news] = useState([
    { id: 1, title: 'TUPRS %2.1 yükselişte', date: 'Bugün 14:30', type: 'positive' },
    { id: 2, title: 'İSMEN %3.2 düşüşte', date: 'Bugün 13:15', type: 'negative' },
    { id: 3, title: 'RYGYO kurumsal haber', date: 'Dün 16:45', type: 'neutral' }
  ]);

  const [signals] = useState([
    { id: 1, symbol: 'TUPRS', signal: 'AL', strength: '⭐⭐⭐', reason: 'Teknik destek kırıldı' },
    { id: 2, symbol: 'İSMEN', signal: 'SAT', strength: '⭐⭐', reason: 'Direnç seviyesi yaklaşıyor' },
    { id: 3, symbol: 'RYGYO', signal: 'AL', strength: '⭐⭐⭐⭐', reason: 'Trendline üstü' }
  ]);

  useEffect(() => {
    localStorage.setItem('proApp_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // 🔐 ŞİFRE KURULUMU
  const setupPassword = () => {
    if (passwordInput.length < 4) {
      alert('Şifre en az 4 karakter olmalı');
      return;
    }
    localStorage.setItem('proApp_password', passwordInput);
    setPassword(passwordInput);
    setShowPasswordSetup(false);
    setPasswordInput('');
  };

  // 🔓 ŞİFRE DOĞRULAMA
  const verifyPassword = (input) => {
    if (input === password) {
      localStorage.setItem('proApp_locked', 'false');
      setIsLocked(false);
      setPasswordInput('');
    } else {
      alert('❌ Şifre yanlış!');
    }
  };

  // 🔒 ÇIKIŞ
  const logout = () => {
    localStorage.setItem('proApp_locked', 'true');
    setIsLocked(true);
    setPasswordInput('');
  };

  // 📈 CANLΙ VERİ GÜNCELLE
  const updateLiveData = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('https://www.getmidas.com/canli-borsa', {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (response.ok) {
        const html = await response.text();
        const regex = /data-symbol="([A-Z]+)"[^>]*>([0-9,.]+)/g;
        let match;
        const prices = {};

        while ((match = regex.exec(html)) !== null) {
          const symbol = match[1];
          const price = parseFloat(match[2].replace(',', '.'));
          prices[symbol] = price;
        }

        setPortfolio(prev =>
          prev.map(stock => ({
            ...stock,
            currentPrice: prices[stock.symbol] || stock.currentPrice
          }))
        );

        setLastUpdate(new Date().toLocaleTimeString('tr-TR'));
      }
    } catch (error) {
      console.log('Güncelleme başarısız');
    }
    setIsUpdating(false);
  };

  // 📊 BIST100 ÇEKME
  const fetchBist100 = async () => {
    setIsFetchingBist(true);
    try {
      const response = await fetch('https://www.getmidas.com/canli-borsa', {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (response.ok) {
        const html = await response.text();
        const regex = /data-symbol="([A-Z]+)"[^>]*>([0-9,.]+)(?:[^>]*>([0-9,.-]+))?/g;
        let match;
        const stocks = [];

        while ((match = regex.exec(html)) !== null) {
          const symbol = match[1];
          const price = parseFloat(match[2].replace(',', '.'));
          stocks.push({
            symbol: symbol,
            price: price,
            change: 0
          });
        }

        setBist100(stocks.slice(0, 100));
      }
    } catch (error) {
      console.log('BIST100 çekme başarısız');
    }
    setIsFetchingBist(false);
  };

  useEffect(() => {
    fetchBist100();
  }, []);

  // 💾 YEDEK ALMA
  const exportData = () => {
    const backup = {
      portfolio,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proapp-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Yedek indirildi!');
  };

  // ❌ TÜÖM VERİ SİL
  const deleteAllData = () => {
    if (window.confirm('⚠️ TÜM VERİLER SİLİNECEK!')) {
      localStorage.removeItem('proApp_portfolio');
      localStorage.removeItem('proApp_password');
      localStorage.removeItem('proApp_locked');
      alert('✅ Silindi');
      window.location.reload();
    }
  };

  // 📊 HESAPLAMALAR
  const totalInvested = portfolio.reduce((sum, s) => sum + (s.quantity * s.buyPrice), 0);
  const totalCurrent = portfolio.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0);
  const gainLoss = totalCurrent - totalInvested;
  const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

  const portfolioData = portfolio.map(s => ({
    name: s.symbol,
    value: s.quantity * s.currentPrice
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#fb923c', '#f43f5e', '#6366f1'];

  // BIST100 ARAMA
  const filteredBist = bist100.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔐 KİLİT EKRANI
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {showPasswordSetup ? (
            <div className="bg-slate-800 p-8 rounded-2xl border-2 border-blue-600 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto border-2 border-blue-600">
                <Lock className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">🔐 Şifre Oluştur</h1>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Şifre..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && setupPassword()}
                autoFocus
              />
              <button
                onClick={setupPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                KAYDET
              </button>
            </div>
          ) : (
            <div className="bg-slate-800 p-8 rounded-2xl border-2 border-red-600 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto border-2 border-red-600">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">🔒 KİLİTLİ</h1>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Şifre..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && verifyPassword(passwordInput)}
                autoFocus
              />
              <button
                onClick={() => verifyPassword(passwordInput)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                KİLİDİ AÇ
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 🎨 ANA UYGULAMA
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/90 to-blue-900/90 backdrop-blur-xl p-4 border-b border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">₿</span>
              </div>
              <div>
                <h1 className="text-lg font-black text-white">PRO BIST</h1>
                <p className="text-xs text-blue-300">Portföy Yönetim Sistemi</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={updateLiveData}
                disabled={isUpdating}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                <RefreshCw size={18} className={isUpdating ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setHideValues(!hideValues)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
              >
                {hideValues ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <button
                onClick={logout}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <Lock size={18} />
              </button>
            </div>
          </div>

          {lastUpdate && (
            <p className="text-xs text-blue-300 text-center">Son güncelleme: {lastUpdate}</p>
          )}
        </div>
      </header>

      {/* İÇERİK */}
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            {/* PORTFÖY ÖZETİ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-5 rounded-2xl border border-blue-600/30 backdrop-blur">
                <p className="text-blue-300 text-xs font-bold mb-2 uppercase tracking-wider">Toplam Yatırı</p>
                <p className="text-3xl font-black text-white">
                  {hideValues ? '₺ ***' : `₺${(totalInvested / 1000).toFixed(0)}K`}
                </p>
                <p className="text-xs text-blue-200 mt-2">Cari: ${(totalInvested / 44).toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 p-5 rounded-2xl border border-cyan-600/30 backdrop-blur">
                <p className="text-cyan-300 text-xs font-bold mb-2 uppercase tracking-wider">Güncel Değer</p>
                <p className="text-3xl font-black text-white">
                  {hideValues ? '₺ ***' : `₺${(totalCurrent / 1000).toFixed(0)}K`}
                </p>
                <p className="text-xs text-cyan-200 mt-2">Cari: ${(totalCurrent / 44).toFixed(2)}</p>
              </div>

              <div className={`p-5 rounded-2xl border backdrop-blur ${gainLoss >= 0 ? 'bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-600/30' : 'bg-gradient-to-br from-rose-900/40 to-rose-800/20 border-rose-600/30'}`}>
                <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${gainLoss >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>Kar/Zarar</p>
                <p className={`text-3xl font-black ${gainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hideValues ? '₺ ***' : `₺${(gainLoss / 1000).toFixed(0)}K`}
                </p>
              </div>

              <div className={`p-5 rounded-2xl border backdrop-blur ${gainLossPercent >= 0 ? 'bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-600/30' : 'bg-gradient-to-br from-rose-900/40 to-rose-800/20 border-rose-600/30'}`}>
                <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${gainLossPercent >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>Getiri Oranı</p>
                <p className={`text-3xl font-black ${gainLossPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {gainLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* GRAFİK VE SINYALLER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* PORTFÖY GRAFİĞİ */}
              <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-white/10 backdrop-blur">
                <h2 className="text-lg font-bold text-white mb-4">Portföy Dağılımı</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={portfolioData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({ name }) => `${name}`}>
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₺${(value / 1000).toFixed(0)}K`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* AL/SAT SİNYALLERİ */}
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 backdrop-blur space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="text-yellow-400" size={20} /> Sinyaller
                </h2>
                {signals.map(signal => (
                  <div key={signal.id} className={`p-3 rounded-lg border-l-4 ${signal.signal === 'AL' ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-white">{signal.symbol}</p>
                      <span className={`px-3 py-1 rounded text-xs font-bold ${signal.signal === 'AL' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {signal.signal}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-1">{signal.strength}</p>
                    <p className="text-xs text-slate-400">{signal.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* HABERLER */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 backdrop-blur">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Bell className="text-blue-400" size={20} /> Güncel Haberler
              </h2>
              <div className="space-y-2">
                {news.map(item => (
                  <div key={item.id} className="p-3 bg-slate-700/50 rounded-lg border border-white/5 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.date}</p>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-bold ${
                      item.type === 'positive' ? 'bg-green-600/20 text-green-400' :
                      item.type === 'negative' ? 'bg-red-600/20 text-red-400' :
                      'bg-blue-600/20 text-blue-400'
                    }`}>
                      {item.type === 'positive' ? '📈' : item.type === 'negative' ? '📉' : '📰'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* PORTFÖY LİSTESİ */}
        {activeTab === 'portfolio' && (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Hisselerim</h2>
            {portfolio.map(stock => {
              const gainLossPercent = ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100;
              const totalValue = stock.quantity * stock.currentPrice;
              const invested = stock.quantity * stock.buyPrice;
              const change = totalValue - invested;

              return (
                <div key={stock.id} className="bg-slate-800/50 p-4 rounded-xl border border-white/10 backdrop-blur hover:border-white/20 transition">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="font-bold text-white text-lg">{stock.symbol}</p>
                      <p className="text-xs text-slate-400">{stock.quantity} adet</p>
                    </div>
                    <div className="text-right md:text-left">
                      <p className="text-white font-semibold">₺{hideValues ? '***' : stock.currentPrice.toFixed(2)}</p>
                      <p className={`text-xs font-bold ${gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {gainLossPercent >= 0 ? '↑' : '↓'} {Math.abs(gainLossPercent).toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-right md:text-left">
                      <p className="text-slate-300 text-sm">Yatı: ₺{hideValues ? '***' : (invested / 1000).toFixed(1)}K</p>
                      <p className="text-slate-400 text-xs">Güncel: ₺{hideValues ? '***' : (totalValue / 1000).toFixed(1)}K</p>
                    </div>
                    <div className={`text-right p-3 rounded-lg ${change >= 0 ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                      <p className={`font-bold text-lg ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {hideValues ? '₺***' : `₺${(change / 1000).toFixed(1)}K`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BIST100 CANLI */}
        {activeTab === 'market' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-white">📊 BIST100 Canlı</h2>
              <button
                onClick={fetchBist100}
                disabled={isFetchingBist}
                className="p-2 bg-green-600 text-white rounded-lg"
              >
                <RefreshCw size={18} className={isFetchingBist ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Hisse ara... (örn: TUPRS)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBist.map(stock => (
                <div key={stock.symbol} className="bg-slate-800/50 p-4 rounded-xl border border-white/10 backdrop-blur hover:border-white/20 transition">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-white text-lg">{stock.symbol}</p>
                    <TrendingUp className="text-green-400" size={18} />
                  </div>
                  <p className="text-2xl font-bold text-white">₺{stock.price.toFixed(2)}</p>
                  <p className="text-xs text-slate-400 mt-1">GetMidas Canlı</p>
                </div>
              ))}
            </div>

            {filteredBist.length === 0 && (
              <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-white/10">
                <p className="text-slate-400">Hisse bulunamadı</p>
              </div>
            )}
          </div>
        )}

        {/* ANALİZ */}
        {activeTab === 'analysis' && (
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/10 backdrop-blur text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Teknik Analiz</h2>
            <p className="text-slate-400">Grafik ve analiz araçları yakında...</p>
          </div>
        )}

        {/* AYARLAR */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/10 backdrop-blur">
              <h2 className="text-xl font-bold text-white mb-4">⚙️ Ayarlar</h2>
              
              <div className="space-y-3">
                <button
                  onClick={exportData}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Download size={18} /> Yedek İndir
                </button>
                
                <button
                  onClick={deleteAllData}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Trash2 size={18} /> Tüm Veriyi Sil
                </button>
              </div>
            </div>

            <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-600/30 backdrop-blur">
              <p className="text-blue-200 text-sm">
                <strong>🔐 Güvenlik:</strong><br/>
                ✅ Mali verileriniz SADECE cihazınızda<br/>
                ✅ GetMidas'tan canlı fiyatlar<br/>
                ✅ Şifre koruması<br/>
                ✅ Yedek alma imkanı
              </p>
            </div>
          </div>
        )}
      </main>

      {/* TAB BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur border-t border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-5 gap-0">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'portfolio', icon: '💼', label: 'Portföy' },
            { id: 'market', icon: '📈', label: 'BIST100' },
            { id: 'analysis', icon: '📉', label: 'Analiz' },
            { id: 'settings', icon: '⚙️', label: 'Ayarlar' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-3 text-center transition font-bold border-t-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600/20 text-blue-400 border-blue-600'
                  : 'bg-slate-900/50 text-slate-400 border-transparent hover:text-white'
              }`}
            >
              <div className="text-lg mb-1">{tab.icon}</div>
              <div className="text-xs">{tab.label}</div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
