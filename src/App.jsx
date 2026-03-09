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
  // 💰 PORTFÖY VERİSİ (SADECE TELEFONUNDA)
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
  // 📊 CANLI VERİ (GetMidas + UzmanPara)
  // ============================================

  const [liveData, setLiveData] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState('getmidas'); // 'getmidas' veya 'uzmanpara'
  const [connectionStatus, setConnectionStatus] = useState('offline');
  const [liveNews, setLiveNews] = useState([]);
  const [liveSignals, setLiveSignals] = useState([]);

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
  // 🔐 ŞİFRE KURULUMU
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

  // ============================================
  // 🔓 ŞİFRE DOĞRULAMA
  // ============================================

  const verifyPassword = (input) => {
    if (input === password) {
      setIsLocked(false);
      setPasswordInput('');
    } else {
      alert('❌ Şifre yanlış!');
    }
  };

  // ============================================
  // 💾 VERİ SAKLAMA
  // ============================================

  useEffect(() => {
    localStorage.setItem('myPrivatePortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('myPrivateAnalysis', JSON.stringify(analysisHistory));
  }, [analysisHistory]);

  // ============================================
  // 🔄 CANLI VERİ ÇEKME (GetMidas → UzmanPara)
  // ============================================

  const fetchLiveData = async () => {
    setIsRefreshing(true);
    setConnectionStatus('loading');

    const symbols = portfolio.map(p => p.symbol);

    // 1️⃣ GETMIDAS'TAN ÇEKMEYE ÇALIŞ
    try {
      console.log('📡 GetMidas\'dan canlı veriler çekiliyor...');
      
      const getmidasResponse = await fetch('https://www.getmidas.com/canli-borsa', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Content-Type': 'application/json'
        }
      });

      if (getmidasResponse.ok) {
        const html = await getmidasResponse.text();
        
        // HTML'den fiyatları çıkar (parse)
        const prices = parseGetMidasData(html, symbols);
        
        if (Object.keys(prices).length > 0) {
          setLiveData(prices);
          setDataSource('getmidas');
          setConnectionStatus('connected');
          updatePortfolioWithLiveData(prices);
          setLastUpdateTime(new Date().toLocaleString('tr-TR'));
          console.log('✅ GetMidas verisi başarıyla alındı');
          setIsRefreshing(false);
          return;
        }
      }
    } catch (error) {
      console.log('⚠️ GetMidas bağlantı hatası:', error.message);
    }

    // 2️⃣ GETMIDAS BAŞARISIZSA UZMANPARA'DAN ÇEKMEYE ÇALIŞ
    try {
      console.log('📡 UzmanPara\'dan canlı veriler çekiliyor...');
      
      const uzmanparaResponse = await fetch('https://www.uzmanpara.milliyet.com.tr/canli-borsa', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Content-Type': 'application/json'
        }
      });

      if (uzmanparaResponse.ok) {
        const html = await uzmanparaResponse.text();
        
        // HTML'den fiyatları çıkar (parse)
        const prices = parseUzmanparaData(html, symbols);
        
        if (Object.keys(prices).length > 0) {
          setLiveData(prices);
          setDataSource('uzmanpara');
          setConnectionStatus('connected');
          updatePortfolioWithLiveData(prices);
          setLastUpdateTime(new Date().toLocaleString('tr-TR'));
          console.log('✅ UzmanPara verisi başarıyla alındı');
          setIsRefreshing(false);
          return;
        }
      }
    } catch (error) {
      console.log('⚠️ UzmanPara bağlantı hatası:', error.message);
    }

    // 3️⃣ İKİSİ DE BAŞARISIZSA OFFLINE MODA GEÇ
    setConnectionStatus('offline');
    console.log('⚠️ Offline modda çalışıyor - canlı veriler alınamadı');
    setIsRefreshing(false);
  };

  // ============================================
  // GETMIDAS VERİ PARSE
  // ============================================

  const parseGetMidasData = (html, symbols) => {
    const prices = {};

    // GetMidas HTML yapısını parse et
    // Örnek: <span class="price" data-symbol="TUPRS">274.50</span>
    const regex = /data-symbol="(\w+)"[^>]*>([0-9,\.]+)</g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const symbol = match[1];
      const price = match[2].replace(',', '.');
      
      if (symbols.includes(symbol)) {
        prices[symbol] = {
          price: parseFloat(price),
          change: '0',
          source: 'GetMidas'
        };
      }
    }

    return prices;
  };

  // ============================================
  // UZMANPARA VERİ PARSE
  // ============================================

  const parseUzmanparaData = (html, symbols) => {
    const prices = {};

    // UzmanPara HTML yapısını parse et
    // Örnek: <tr data-symbol="TUPRS"><td class="price">274.50</td>
    symbols.forEach(symbol => {
      const pattern = new RegExp(
        `<tr[^>]*data-symbol="${symbol}"[^>]*>.*?<td[^>]*class="price"[^>]*>([0-9,\\.]+)`,
        's'
      );
      
      const match = html.match(pattern);
      if (match) {
        const price = match[1].replace(',', '.');
        prices[symbol] = {
          price: parseFloat(price),
          change: '0',
          source: 'UzmanPara'
        };
      }
    });

    return prices;
  };

  // ============================================
  // PORTFÖY'Ü CANLI VERİ İLE GÜNCELLE
  // ============================================

  const updatePortfolioWithLiveData = (prices) => {
    setPortfolio(prev =>
      prev.map(stock => {
        if (prices[stock.symbol]) {
          const newPrice = prices[stock.symbol].price;
          const newAmount = stock.quantity * newPrice;
          return {
            ...stock,
            currentPrice: newPrice,
            currentAmount: newAmount
          };
        }
        return stock;
      })
    );
  };

  // ============================================
  // OTOMATIK GÜNCELLEME (5 dakika)
  // ============================================

  useEffect(() => {
    fetchLiveData(); // İlk açılışta çek

    const interval = setInterval(() => {
      console.log('🔄 Canlı veriler otomatik güncelleniyor...');
      fetchLiveData();
    }, 300000); // Her 5 dakika

    return () => clearInterval(interval);
  }, [portfolio]);

  // ============================================
  // FİYAT GÜNCELLEME (Manual)
  // ============================================

  const updatePrice = (stockId, newPriceValue) => {
    const price = parseFloat(newPriceValue);
    if (isNaN(price) || price <= 0) {
      alert('Geçerli bir fiyat gir');
      return;
    }

    setPortfolio(prev =>
      prev.map(stock => {
        if (stock.id === stockId) {
          const newAmount = stock.quantity * price;
          return {
            ...stock,
            currentPrice: price,
            currentAmount: newAmount
          };
        }
        return stock;
      })
    );
    setEditingPrice(null);
    setNewPrice('');
  };

  // ============================================
  // FOTOĞRAF ANALİZİ
  // ============================================

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setIsAnalyzing(true);

        setTimeout(() => {
          const analysis = {
            timestamp: new Date().toLocaleString('tr-TR'),
            note: 'Fotoğraf kaydedildi',
            dataSource: dataSource,
            portfolioSnapshot: portfolio.map(p => ({
              symbol: p.symbol,
              price: p.currentPrice,
              quantity: p.quantity,
              value: (p.currentAmount / 1000).toFixed(0) + 'K'
            }))
          };

          setAnalysisHistory(prev => [{
            date: new Date().toLocaleString('tr-TR'),
            image: event.target.result,
            analysis: analysis,
            totalValue: portfolio.reduce((sum, p) => sum + p.currentAmount, 0)
          }, ...prev].slice(0, 100));

          setIsAnalyzing(false);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // HESAPLAMALAR
  // ============================================

  const calculateTotals = () => {
    const invested = portfolio.reduce((sum, s) => sum + s.investedAmount, 0);
    const current = portfolio.reduce((sum, s) => sum + s.currentAmount, 0);
    const gainLoss = current - invested;
    const gainLossPercent = ((gainLoss / invested) * 100).toFixed(2);
    return { invested, current, gainLoss, gainLossPercent };
  };

  const totals = calculateTotals();
  const portfolioData = portfolio.map(s => ({ name: s.symbol, value: parseFloat(s.currentAmount.toFixed(0)) }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#fb923c', '#f43f5e', '#6366f1'];

  // ============================================
  // YEDEKLEME
  // ============================================

  const exportData = () => {
    const backup = {
      portfolio,
      analysisHistory,
      exportedAt: new Date().toISOString(),
      dataSource: dataSource,
      note: '⚠️ Bu dosya çok HASSAStır! Kimseyle paylaşma!'
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `private-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Yedek indirildi!');
  };

  // ============================================
  // VERİ SİLME
  // ============================================

  const deleteAllData = () => {
    if (window.confirm('⚠️ TÜM MALİ VERİLER SİLİNECEK!\n\nBu işlem geri alınamaz.')) {
      if (window.confirm('Son kontrol: Gerçekten tüm veriyi silmek istiyorsun?')) {
        localStorage.removeItem('myPrivatePortfolio');
        localStorage.removeItem('myPrivateAnalysis');
        localStorage.removeItem('appPassword');
        alert('✅ Tüm veriler silindi.');
        window.location.reload();
      }
    }
  };

  // ============================================
  // 🔐 KİLİTLİ EKRAN
  // ============================================

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {showPasswordSetup ? (
            <div className="bg-slate-800 p-8 rounded-lg border-2 border-blue-600 text-center space-y-6">
              <Lock className="w-16 h-16 text-blue-400 mx-auto" />
              <h1 className="text-2xl font-bold text-white">🔐 Uygulama Şifresi</h1>
              <p className="text-slate-300 text-sm">Mali verilerinizi korumak için 4+ karakterli şifre ayarla</p>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Şifre gir..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && setupPassword()}
                  autoFocus
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <button
                onClick={setupPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition"
              >
                Şifreyi Ayarla
              </button>

              <p className="text-xs text-red-400">⚠️ Şifreyi unutma!</p>
            </div>
          ) : (
            <div className="bg-slate-800 p-8 rounded-lg border-2 border-red-600 text-center space-y-6">
              <Lock className="w-16 h-16 text-red-400 mx-auto" />
              <h1 className="text-2xl font-bold text-white">🔒 Kilitli</h1>
              <p className="text-slate-300">Mali verilerine erişmek için şifreyi gir</p>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Şifre..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && verifyPassword(passwordInput)}
                  autoFocus
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <button
                onClick={() => verifyPassword(passwordInput)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition"
              >
                Kilidi Aç
              </button>

              <p className="text-xs text-slate-400">🔐 Verileriniz SADECE bu telefonunda</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // 🔓 AÇILMIŞ UYGULAMA
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 p-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lock className="text-red-400" size={22} />
            <div>
              <h1 className="text-lg font-bold text-white">🔐 Özel Portföyüm</h1>
              <p className="text-xs text-blue-200">Canlı veriler: {dataSource === 'getmidas' ? 'GetMidas' : 'UzmanPara'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchLiveData}
              disabled={isRefreshing}
              className={`p-2 rounded-lg text-white ${
                isRefreshing ? 'bg-yellow-600' : connectionStatus === 'connected' ? 'bg-green-600' : 'bg-red-600'
              }`}
              title={`Güncelle (${connectionStatus})`}
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsLocked(true)}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
              title="Kilitle"
            >
              <Lock size={18} />
            </button>
          </div>
        </div>

        {/* Bağlantı Durumu */}
        <div className="flex items-center gap-2 text-xs">
          {connectionStatus === 'connected' && (
            <>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-300">Bağlandı</span>
            </>
          )}
          {connectionStatus === 'offline' && (
            <>
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              <span className="text-red-300">Offline</span>
            </>
          )}
          {connectionStatus === 'loading' && (
            <>
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-spin"></span>
              <span className="text-yellow-300">Güncelleniyor...</span>
            </>
          )}
          {lastUpdateTime && <span className="text-slate-400 ml-2">Son güncelleme: {lastUpdateTime}</span>}
        </div>
      </div>

      {/* İçerik */}
      <div className="p-3 space-y-3">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-3">
            {/* Özet */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-900 p-3 rounded-lg border border-blue-600">
                <p className="text-blue-200 text-xs mb-1">Yatırılan</p>
                <p className="text-xl font-bold text-white">₺{(totals.invested / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-cyan-900 p-3 rounded-lg border border-cyan-600">
                <p className="text-cyan-200 text-xs mb-1">Güncel</p>
                <p className="text-xl font-bold text-white">₺{(totals.current / 1000).toFixed(0)}K</p>
              </div>
              <div className={`p-3 rounded-lg border-2 ${totals.gainLoss >= 0 ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
                <p className={`text-xs mb-1 ${totals.gainLoss >= 0 ? 'text-green-200' : 'text-red-200'}`}>Kar/Zarar</p>
                <p className={`text-xl font-bold ${totals.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₺{(totals.gainLoss / 1000).toFixed(0)}K
                </p>
              </div>
              <div className={`p-3 rounded-lg border-2 ${totals.gainLossPercent >= 0 ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
                <p className={`text-xs mb-1 ${totals.gainLossPercent >= 0 ? 'text-green-200' : 'text-red-200'}`}>Getiri</p>
                <p className={`text-xl font-bold ${totals.gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totals.gainLossPercent}%
                </p>
              </div>
            </div>

            {/* Portföy Dağılımı */}
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <h3 className="text-sm font-bold text-white mb-2">Portföy Dağılımı</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={portfolioData} cx="50%" cy="50%" outerRadius={70} fill="#8884d8" dataKey="value">
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₺${(value / 1000).toFixed(0)}K`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* PORTFÖY */}
        {activeTab === 'portfolio' && (
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-2">
            <h3 className="text-lg font-bold text-white">💼 Hisselerim</h3>
            {portfolio.map(stock => {
              const gainLossPercent = (((stock.currentAmount - stock.investedAmount) / stock.investedAmount) * 100).toFixed(2);
              return (
                <div key={stock.id} className="p-2 bg-slate-700 rounded border border-slate-600">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-bold text-white text-sm">{stock.symbol}</p>
                      <p className="text-xs text-slate-400">{stock.name}</p>
                    </div>
                    <span className={`text-sm font-bold ${gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {gainLossPercent}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="bg-slate-800 p-1 rounded">
                      <p className="text-slate-400">Adet: {stock.quantity}</p>
                    </div>
                    <div className="bg-slate-800 p-1 rounded">
                      {editingPrice === stock.id ? (
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          onBlur={() => updatePrice(stock.id, newPrice)}
                          onKeyPress={(e) => e.key === 'Enter' && updatePrice(stock.id, newPrice)}
                          autoFocus
                          className="w-full bg-blue-700 text-white px-1 rounded text-xs"
                        />
                      ) : (
                        <p className="text-white cursor-pointer hover:text-blue-400" onClick={() => { setEditingPrice(stock.id); setNewPrice(stock.currentPrice); }}>
                          ₺{stock.currentPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="bg-slate-800 p-1 rounded col-span-2">
                      <p className="text-slate-400">Yat: ₺{(stock.investedAmount / 1000).toFixed(0)}K → Güncel: ₺{(stock.currentAmount / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ANALİZ */}
        {activeTab === 'analysis' && (
          <div className="space-y-3">
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Camera size={20} /> Fotoğraf Çek
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageAnalysis}
                className="hidden"
              />
            </div>

            {uploadedImage && (
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <img src={uploadedImage} alt="Analiz" className="w-full rounded-lg max-h-56 object-cover" />
                <p className="text-xs text-slate-400 mt-2">📸 Fotoğraf kaydedildi (internet'e gönderilmedi)</p>
              </div>
            )}

            {analysisHistory.length > 0 && (
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <h3 className="text-sm font-bold text-white mb-2">📋 Geçmiş</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {analysisHistory.map((item, idx) => (
                    <div key={idx} className="p-2 bg-slate-700 rounded text-xs">
                      <p className="text-slate-400">{item.date}</p>
                      <p className="text-white">✅ Portföy: ₺{(item.totalValue / 1000).toFixed(0)}K</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AYARLAR */}
        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-3">
              <h3 className="text-lg font-bold text-white">⚙️ Ayarlar</h3>

              <div className="pb-3 border-b border-slate-600">
                <h4 className="text-sm font-bold text-white mb-2">📊 Veri Kaynağı</h4>
                <p className="text-xs text-slate-300 mb-2">
                  Aktif: <span className="font-bold text-blue-400">{dataSource === 'getmidas' ? 'GetMidas' : 'UzmanPara'}</span>
                </p>
                <p className="text-xs text-slate-400">GetMidas birincil, UzmanPara yedek kaynak olarak kullanılıyor.</p>
              </div>

              <div className="pb-3 border-b border-slate-600">
                <h4 className="text-sm font-bold text-white mb-2">💾 Yedekleme</h4>
                <button
                  onClick={exportData}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Yedek İndir
                </button>
                <p className="text-xs text-slate-400 mt-2">⚠️ Dosya çok hassastır!</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-2">🗑️ Veriyi Sil</h4>
                <button
                  onClick={deleteAllData}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Tüm Veriyi Sil
                </button>
                <p className="text-xs text-red-400 mt-2">⚠️ Geri alınamaz!</p>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-600 p-3 rounded-lg">
              <p className="text-xs text-blue-200">
                <strong>🔐 Güvenlik:</strong><br/>
                ✅ Mali bilgileriniz SADECE telefonunda<br/>
                ✅ GetMidas + UzmanPara'dan canlı fiyatlar<br/>
                ✅ Kimlik bilgisi paylaşılmıyor<br/>
                ✅ Şifreli korunma
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 flex justify-around p-2">
        {[
          { id: 'dashboard', icon: '📊', label: 'Dashboard' },
          { id: 'portfolio', icon: '💼', label: 'Portföy' },
          { id: 'analysis', icon: '📸', label: 'Analiz' },
          { id: 'settings', icon: '⚙️', label: 'Ayarlar' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded transition ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
                     }
