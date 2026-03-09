import React, { useState, useRef, useEffect } from 'react';
import { Camera, TrendingUp, TrendingDown, Lock, Unlock, Settings, Eye, EyeOff, RefreshCw, Trash2, Download, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CompletelyPrivateWithLiveData() {
  // ============================================
  // 🔐 ŞİFRE VE KİLİT
  // ============================================

  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState(() => localStorage.getItem('appPassword') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(!localStorage.getItem('appPassword'));

  // ============================================
  // 💰 PORTFÖY VERİSİ
  // ============================================

  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('myPrivatePortfolio');
    return saved ? JSON.parse(saved) : [
      { id: 1, symbol: 'ANSGR', name: 'Angelini', quantity: 306, buyPrice: 26.97, currentPrice: 26.28, investedAmount: 8249.82, currentAmount: 8049.68, priority: 1 },
      { id: 2, symbol: 'TUPRS', name: 'Tuprs', quantity: 45, buyPrice: 226.11, currentPrice: 274.00, investedAmount: 10174.95, currentAmount: 12330.00, priority: 1 },
      { id: 3, symbol: 'İSMEN', name: 'İstek', quantity: 427, buyPrice: 48.81, currentPrice: 43.00, investedAmount: 20841.87, currentAmount: 18361.00, priority: 1 },
      { id: 4, symbol: 'RYGYO', name: 'Rygyo', quantity: 628, buyPrice: 30.03, currentPrice: 29.52, investedAmount: 18858.84, currentAmount: 18538.56, priority: 1 },
      { id: 5, symbol: 'TRGYO', name: 'Türk GYO', quantity: 60, buyPrice: 84.17, currentPrice: 76.75, investedAmount: 5050.20, currentAmount: 4605.00, priority: 1 },
      { id: 6, symbol: 'TBORG', name: 'Türk Borsa', quantity: 16, buyPrice: 167.36, currentPrice: 155.10, investedAmount: 2677.76, currentAmount: 2481.60, priority: 2 },
      { id: 7, symbol: 'PGSUS', name: 'Pegasus', quantity: 25, buyPrice: 202.40, currentPrice: 168.90, investedAmount: 5060.00, currentAmount: 4222.50, priority: 2 },
      { id: 8, symbol: 'MGROS', name: 'Migros', quantity: 9, buyPrice: 661.17, currentPrice: 563.50, investedAmount: 5950.50, currentAmount: 5071.50, priority: 2 },
      { id: 9, symbol: 'KLKIM', name: 'Klkim', quantity: 50, buyPrice: 37.11, currentPrice: 34.40, investedAmount: 1855.50, currentAmount: 1720.00, priority: 2 },
      { id: 10, symbol: 'FROTO', name: 'Froto', quantity: 100, buyPrice: 117.51, currentPrice: 105.00, investedAmount: 11751.00, currentAmount: 10500.00, priority: 3 },
      { id: 11, symbol: 'GLYHO', name: 'Glyho', quantity: 538, buyPrice: 15.58, currentPrice: 13.26, investedAmount: 8382.04, currentAmount: 7138.88, priority: 3 },
      { id: 12, symbol: 'CLEBI', name: 'Çelebı', quantity: 3, buyPrice: 1831.33, currentPrice: 1668.00, investedAmount: 5494.00, currentAmount: 5004.00, priority: 3 },
      { id: 13, symbol: 'TATGD', name: 'Tatgd', quantity: 137, buyPrice: 17.50, currentPrice: 17.54, investedAmount: 2397.50, currentAmount: 2402.98, priority: 3 }
    ];
  });

  const [analysisHistory, setAnalysisHistory] = useState(() => {
    const saved = localStorage.getItem('myPrivateAnalysis');
    return saved ? JSON.parse(saved) : [];
  });

  // ============================================
  // 📊 CANLI VERİ DURUMU
  // ============================================

  const [liveData, setLiveData] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState('getmidas');
  const [connectionStatus, setConnectionStatus] = useState('offline');

  const cameraInputRef = useRef(null);

  // ============================================
  // UI STATE
  // ============================================

  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  // ============================================
  // 🔐 ŞİFRE İŞLEMLERİ
  // ============================================

  const setupPassword = () => {
    if (passwordInput.length < 4) {
      alert('Şifre en az 4 karakter olmalı');
      return;
    }
    localStorage.setItem('appPassword', passwordInput);
    setPassword(passwordInput);
    setShowPasswordSetup(false);
    setPasswordInput('');
  };

  const verifyPassword = (input) => {
    if (input === password) {
      setIsLocked(false);
      setPasswordInput('');
    } else {
      alert('❌ Şifre yanlış!');
    }
  };

  // ============================================
  // 💾 YEREL DEPOLAMA
  // ============================================

  useEffect(() => {
    localStorage.setItem('myPrivatePortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('myPrivateAnalysis', JSON.stringify(analysisHistory));
  }, [analysisHistory]);

  // ============================================
  // 🔄 CANLI VERİ ÇEKME
  // ============================================

  const fetchLiveData = async () => {
    setIsRefreshing(true);
    setConnectionStatus('loading');
    const symbols = portfolio.map(p => p.symbol);

    try {
      const getmidasResponse = await fetch('https://www.getmidas.com/canli-borsa');
      if (getmidasResponse.ok) {
        const html = await getmidasResponse.text();
        const prices = parseGetMidasData(html, symbols);
        if (Object.keys(prices).length > 0) {
          processPriceUpdate(prices, 'getmidas');
          return;
        }
      }
    } catch (e) { console.log('GetMidas hatası'); }

    try {
      const uzmanResponse = await fetch('https://www.uzmanpara.milliyet.com.tr/canli-borsa');
      if (uzmanResponse.ok) {
        const html = await uzmanResponse.text();
        const prices = parseUzmanparaData(html, symbols);
        if (Object.keys(prices).length > 0) {
          processPriceUpdate(prices, 'uzmanpara');
          return;
        }
      }
    } catch (e) { console.log('UzmanPara hatası'); }

    setConnectionStatus('offline');
    setIsRefreshing(false);
  };

  const processPriceUpdate = (prices, source) => {
    setLiveData(prices);
    setDataSource(source);
    setConnectionStatus('connected');
    updatePortfolioWithLiveData(prices);
    setLastUpdateTime(new Date().toLocaleString('tr-TR'));
    setIsRefreshing(false);
  };

  const parseGetMidasData = (html, symbols) => {
    const prices = {};
    const regex = /data-symbol="(\w+)"[^>]*>([0-9,\.]+)</g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const symbol = match[1];
      if (symbols.includes(symbol)) {
        prices[symbol] = { price: parseFloat(match[2].replace(',', '.')), source: 'GetMidas' };
      }
    }
    return prices;
  };

  const parseUzmanparaData = (html, symbols) => {
    const prices = {};
    symbols.forEach(symbol => {
      const pattern = new RegExp(`<tr[^>]*data-symbol="${symbol}"[^>]*>.*?<td[^>]*class="price"[^>]*>([0-9,\\.]+)`, 's');
      const match = html.match(pattern);
      if (match) prices[symbol] = { price: parseFloat(match[1].replace(',', '.')), source: 'UzmanPara' };
    });
    return prices;
  };

  const updatePortfolioWithLiveData = (prices) => {
    setPortfolio(prev => prev.map(stock => {
      if (prices[stock.symbol]) {
        const newPrice = prices[stock.symbol].price;
        return { ...stock, currentPrice: newPrice, currentAmount: stock.quantity * newPrice };
      }
      return stock;
    }));
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 300000);
    return () => clearInterval(interval);
  }, []);

  // ============================================
  // 📸 FOTOĞRAF ANALİZİ (Düzeltilen Kısım)
  // ============================================

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setIsAnalyzing(true);
        setTimeout(() => {
          setAnalysisHistory(prev => [{
            date: new Date().toLocaleString('tr-TR'),
            image: event.target.result,
            totalValue: portfolio.reduce((sum, p) => sum + p.currentAmount, 0)
          }, ...prev].slice(0, 10));
          setIsAnalyzing(false);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePrice = (stockId, newPriceValue) => {
    const price = parseFloat(newPriceValue);
    if (!isNaN(price) && price > 0) {
      setPortfolio(prev => prev.map(s => s.id === stockId ? { ...s, currentPrice: price, currentAmount: s.quantity * price } : s));
    }
    setEditingPrice(null);
  };

  const calculateTotals = () => {
    const invested = portfolio.reduce((sum, s) => sum + s.investedAmount, 0);
    const current = portfolio.reduce((sum, s) => sum + s.currentAmount, 0);
    return { invested, current, gainLoss: current - invested, gainLossPercent: (((current - invested) / invested) * 100).toFixed(2) };
  };

  const totals = calculateTotals();
  const portfolioData = portfolio.map(s => ({ name: s.symbol, value: s.currentAmount }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-lg border-2 border-blue-600 text-center space-y-6">
          <Lock className="w-16 h-16 text-blue-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">{showPasswordSetup ? 'Şifre Belirle' : 'Kilitli'}</h1>
          <input
            type={showPassword ? 'text' : 'password'}
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded text-white text-center"
            placeholder="****"
            onKeyPress={(e) => e.key === 'Enter' && (showPasswordSetup ? setupPassword() : verifyPassword(passwordInput))}
          />
          <button
            onClick={() => showPasswordSetup ? setupPassword() : verifyPassword(passwordInput)}
            className="w-full bg-blue-600 py-3 rounded text-white font-bold"
          >
            {showPasswordSetup ? 'Kaydet' : 'Giriş Yap'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <div className="sticky top-0 z-50 bg-blue-900 p-4 shadow-xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Lock size={20} className="text-blue-400" />
          <h1 className="font-bold">Özel Portföy</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLiveData} className="p-2 bg-slate-800 rounded"><RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} /></button>
          <button onClick={() => setIsLocked(true)} className="p-2 bg-red-900 rounded"><Lock size={18} /></button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                <p className="text-xs text-slate-400">Güncel Değer</p>
                <p className="text-xl font-bold text-blue-400">₺{(totals.current / 1000).toFixed(1)}K</p>
              </div>
              <div className={`bg-slate-800 p-4 rounded-lg border border-slate-700 text-center ${totals.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <p className="text-xs text-slate-400">Kâr/Zarar</p>
                <p className="text-xl font-bold">{totals.gainLossPercent}%</p>
              </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={portfolioData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                    {portfolioData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-2">
            {portfolio.map(stock => (
              <div key={stock.id} className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between">
                <div>
                  <p className="font-bold">{stock.symbol}</p>
                  <p className="text-xs text-slate-400">{stock.quantity} Adet</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₺{stock.currentPrice.toFixed(2)}</p>
                  <p className={`text-xs ${stock.currentAmount >= stock.investedAmount ? 'text-green-400' : 'text-red-400'}`}>
                    ₺{(stock.currentAmount / 1000).toFixed(1)}K
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <button onClick={() => cameraInputRef.current.click()} className="w-full bg-blue-600 p-4 rounded-lg font-bold flex items-center justify-center gap-2">
              <Camera /> Fotoğraf Çek / Yükle
            </button>
            <input ref={cameraInputRef} type="file" accept="image/*" onChange={handleImageCapture} className="hidden" />
            {uploadedImage && <img src={uploadedImage} className="w-full rounded-lg border border-slate-700" alt="Son yüklenen" />}
            <div className="space-y-2">
              {analysisHistory.map((h, i) => (
                <div key={i} className="bg-slate-800 p-3 rounded text-xs flex justify-between">
                  <span>{h.date}</span>
                  <span className="font-bold text-blue-400">₺{(h.totalValue / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-800 p-4 rounded-lg space-y-4">
            <h3 className="font-bold border-b border-slate-700 pb-2">Ayarlar</h3>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full bg-red-900/50 text-red-400 p-3 rounded border border-red-900 flex items-center justify-center gap-2">
              <Trash2 size={18} /> Tüm Verileri Sıfırla
            </button>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-4">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-500'}><TrendingUp /></button>
        <button onClick={() => setActiveTab('portfolio')} className={activeTab === 'portfolio' ? 'text-blue-400' : 'text-slate-500'}><Settings /></button>
        <button onClick={() => setActiveTab('analysis')} className={activeTab === 'analysis' ? 'text-blue-400' : 'text-slate-500'}><Camera /></button>
        <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-blue-400' : 'text-slate-500'}><Trash2 /></button>
      </nav>
    </div>
  );
}
