import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, X, TrendingUp, Lock, Zap, Eye, EyeOff, RefreshCw, Search, AlertCircle } from 'lucide-react';

export default function InvestmentApp() {
  // 🔐 ŞİFRE VE KİLİT
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('app_locked') !== 'false');
  const [password, setPassword] = useState('');
  const [hideValues, setHideValues] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // 📊 PORTFÖY
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('my_portfolio');
    return saved ? JSON.parse(saved) : [
      { id: 1, symbol: 'ANSGR', name: 'Angelini', quantity: 306, buyPrice: 26.97, currentPrice: 26.28 },
      { id: 2, symbol: 'TUPRS', name: 'Tuprs', quantity: 45, buyPrice: 226.11, currentPrice: 274.00 },
      { id: 3, symbol: 'İSMEN', name: 'İstek', quantity: 427, buyPrice: 48.81, currentPrice: 43.00 },
      { id: 4, symbol: 'RYGYO', name: 'Rygyo', quantity: 628, buyPrice: 30.03, currentPrice: 29.52 },
      { id: 5, symbol: 'TRGYO', name: 'Türk GYO', quantity: 60, buyPrice: 84.17, currentPrice: 76.75 },
      { id: 6, symbol: 'TBORG', name: 'Türk Borsa', quantity: 16, buyPrice: 167.36, currentPrice: 155.10 },
      { id: 7, symbol: 'PGSUS', name: 'Pegasus', quantity: 25, buyPrice: 202.40, currentPrice: 168.90 },
      { id: 8, symbol: 'MGROS', name: 'Migros', quantity: 9, buyPrice: 661.17, currentPrice: 563.50 },
      { id: 9, symbol: 'KLKIM', name: 'Klkim', quantity: 50, buyPrice: 37.11, currentPrice: 34.40 },
      { id: 10, symbol: 'FROTO', name: 'Froto', quantity: 100, buyPrice: 117.51, currentPrice: 105.00 },
      { id: 11, symbol: 'GLYHO', name: 'Glyho', quantity: 538, buyPrice: 15.58, currentPrice: 13.26 },
      { id: 12, symbol: 'CLEBI', name: 'Çelebı', quantity: 3, buyPrice: 1831.33, currentPrice: 1668.00 },
      { id: 13, symbol: 'TATGD', name: 'Tatgd', quantity: 137, buyPrice: 17.50, currentPrice: 17.54 }
    ];
  });

  const [newStock, setNewStock] = useState({ symbol: '', name: '', quantity: '', buyPrice: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 💾 PORTFÖY KAYDET
  useEffect(() => {
    localStorage.setItem('my_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // 🔐 ŞİFRE
  const handleLogin = () => {
    if (password === '1234') {
      localStorage.setItem('app_locked', 'false');
      setIsLocked(false);
    } else {
      alert('❌ Şifre yanlış!');
    }
  };

  const handleLogout = () => {
    localStorage.setItem('app_locked', 'true');
    setIsLocked(true);
    setPassword('');
  };

  // 🔍 HİSSE ARA (GetMidas/UzmanPara)
  const searchStock = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const query_upper = query.toUpperCase();

    try {
      // GetMidas'tan ara
      const response = await fetch('https://www.getmidas.com/canli-borsa', {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (response.ok) {
        const html = await response.text();
        
        // Hisse sembollerini ve fiyatlarını çıkar
        const regex = /data-symbol="([A-Z]+)"[^>]*>([0-9,\.]+)/g;
        let match;
        const results = [];

        while ((match = regex.exec(html)) !== null) {
          const symbol = match[1];
          const price = parseFloat(match[2].replace(',', '.'));

          if (symbol.includes(query_upper)) {
            results.push({
              symbol: symbol,
              currentPrice: price,
              source: 'GetMidas'
            });
          }
        }

        setSearchResults(results.slice(0, 10));
      }
    } catch (error) {
      console.log('GetMidas hatası, UzmanPara deniyor...');
      
      // UzmanPara fallback
      try {
        const response2 = await fetch('https://www.uzmanpara.milliyet.com.tr/canli-borsa');
        if (response2.ok) {
          const html = await response2.text();
          const regex = /<tr[^>]*data-symbol="([A-Z]+)"[^>]*>.*?<td[^>]*>([0-9,\.]+)</gs;
          let match;
          const results = [];

          while ((match = regex.exec(html)) !== null) {
            const symbol = match[1];
            const price = parseFloat(match[2].replace(',', '.'));

            if (symbol.includes(query_upper)) {
              results.push({
                symbol: symbol,
                currentPrice: price,
                source: 'UzmanPara'
              });
            }
          }

          setSearchResults(results.slice(0, 10));
        }
      } catch (err) {
        setSearchResults([]);
      }
    }

    setSearching(false);
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
        const regex = /data-symbol="([A-Z]+)"[^>]*>([0-9,\.]+)/g;
        let match;
        const prices = {};

        while ((match = regex.exec(html)) !== null) {
          const symbol = match[1];
          const price = parseFloat(match[2].replace(',', '.'));
          prices[symbol] = price;
        }

        // Portföyü güncelle
        setPortfolio(prev =>
          prev.map(stock => ({
            ...stock,
            currentPrice: prices[stock.symbol] || stock.currentPrice
          }))
        );

        setLastUpdate(new Date().toLocaleTimeString('tr-TR'));
      }
    } catch (error) {
      console.log('Canlı veri güncellemesi başarısız');
    }

    setIsUpdating(false);
  };

  // ➕ HİSSE EKLE
  const handleAddStock = () => {
    if (!selectedStock || !newStock.quantity || !newStock.buyPrice) {
      alert('Lütfen tüm alanları doldur ve hisse seç!');
      return;
    }

    // Zaten var mı kontrol et
    if (portfolio.some(s => s.symbol === selectedStock.symbol)) {
      alert(`${selectedStock.symbol} zaten portföyde var!`);
      return;
    }

    setPortfolio([...portfolio, {
      id: Date.now(),
      symbol: selectedStock.symbol,
      name: selectedStock.symbol,
      quantity: Number(newStock.quantity),
      buyPrice: Number(newStock.buyPrice),
      currentPrice: selectedStock.currentPrice
    }]);

    setNewStock({ symbol: '', name: '', quantity: '', buyPrice: '' });
    setSelectedStock(null);
    setSearchResults([]);
    setShowAddModal(false);
  };

  // ❌ HİSSE SİL
  const removeStock = (id) => {
    if (window.confirm('Bu hisseyi silmek istediğine emin misin?')) {
      setPortfolio(portfolio.filter(s => s.id !== id));
    }
  };

  // 📊 HESAPLAMALAR
  const totalInvested = portfolio.reduce((sum, s) => sum + (s.quantity * s.buyPrice), 0);
  const totalCurrent = portfolio.reduce((sum, s) => sum + (s.quantity * s.currentPrice), 0);
  const gainLoss = totalCurrent - totalInvested;
  const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

  // 🔐 KİLİTLİ EKRAN
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl border-2 border-blue-600 text-center space-y-6">
          <Lock className="w-16 h-16 text-blue-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">🔐 Özel Portföy</h1>
          <p className="text-slate-300 text-sm">Şifreyi gir</p>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            autoFocus
          />
          
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
          >
            GİRİŞ YAP
          </button>
          
          <p className="text-xs text-slate-400">💡 Şifre: 1234</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-900 to-blue-800 p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-white">💼 Portföyüm</h1>
          <div className="flex gap-2">
            <button
              onClick={updateLiveData}
              disabled={isUpdating}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              title="Canlı veriler güncelle"
            >
              <RefreshCw size={18} className={isUpdating ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setHideValues(!hideValues)}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg"
            >
              {hideValues ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              title="Çıkış"
            >
              <Lock size={18} />
            </button>
          </div>
        </div>
        {lastUpdate && (
          <p className="text-xs text-blue-200 mt-2 text-center">Son güncelleme: {lastUpdate}</p>
        )}
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {activeTab === 'dashboard' && (
          <>
            {/* ÖZET KARTLARI */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-600">
                <p className="text-xs text-blue-200 mb-1">Yatırılan</p>
                <p className="text-xl font-bold text-white">
                  {hideValues ? '₺***' : `₺${totalInvested.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`}
                </p>
              </div>

              <div className="bg-cyan-900/40 p-4 rounded-lg border border-cyan-600">
                <p className="text-xs text-cyan-200 mb-1">Güncel</p>
                <p className="text-xl font-bold text-white">
                  {hideValues ? '₺***' : `₺${totalCurrent.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`}
                </p>
              </div>

              <div className={`p-4 rounded-lg border-2 ${gainLoss >= 0 ? 'bg-green-900/40 border-green-600' : 'bg-red-900/40 border-red-600'}`}>
                <p className={`text-xs mb-1 ${gainLoss >= 0 ? 'text-green-200' : 'text-red-200'}`}>Kar/Zarar</p>
                <p className={`text-xl font-bold ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {hideValues ? '₺***' : `₺${gainLoss.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`}
                </p>
              </div>

              <div className={`p-4 rounded-lg border-2 ${gainLossPercent >= 0 ? 'bg-green-900/40 border-green-600' : 'bg-red-900/40 border-red-600'}`}>
                <p className={`text-xs mb-1 ${gainLossPercent >= 0 ? 'text-green-200' : 'text-red-200'}`}>Getiri</p>
                <p className={`text-xl font-bold ${gainLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {gainLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* UYARI */}
            <div className="bg-blue-900/30 border border-blue-600 p-4 rounded-lg flex gap-3">
              <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
              <p className="text-xs text-blue-200">
                🔄 Canlı veriler her 5 dakikada otomatik güncellenir. Manuel güncelleme için yukarıdaki 🔄 düğmesine tıkla.
              </p>
            </div>
          </>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus size={20} /> YENİ HİSSE EKLE
            </button>

            <div className="space-y-3">
              {portfolio.map(stock => {
                const gainLossStock = (stock.quantity * stock.currentPrice) - (stock.quantity * stock.buyPrice);
                const gainLossPercentStock = ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100;

                return (
                  <div key={stock.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-white">{stock.symbol}</p>
                      <p className="text-xs text-slate-400">
                        {hideValues ? '*** adet' : `${stock.quantity} adet • Mal: ₺${stock.buyPrice.toFixed(2)}`}
                      </p>
                    </div>

                    <div className="text-right mr-4">
                      <p className="font-bold text-white">
                        {hideValues ? '₺***' : `₺${stock.currentPrice.toFixed(2)}`}
                      </p>
                      <p className={`text-xs font-bold ${gainLossPercentStock >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {gainLossPercentStock >= 0 ? '↑' : '↓'} {gainLossPercentStock.toFixed(2)}%
                      </p>
                    </div>

                    <button
                      onClick={() => removeStock(stock.id)}
                      className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: YENİ HİSSE EKLE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-800 max-w-md w-full p-6 rounded-lg border border-slate-700 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Hisse Ekle</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchResults([]);
                  setSelectedStock(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* HİSSE ARAMA */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold">Hisse Ara (GetMidas)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Örn: TUPRS, ANSGR..."
                  value={newStock.symbol}
                  onChange={(e) => {
                    setNewStock({ ...newStock, symbol: e.target.value });
                    searchStock(e.target.value);
                  }}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
                {searching && <p className="text-xs text-slate-400 mt-1">🔍 Aranıyor...</p>}
              </div>

              {/* ARAMA SONUÇLARI */}
              {searchResults.length > 0 && (
                <div className="bg-slate-700 rounded-lg border border-slate-600 max-h-48 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedStock(result);
                        setNewStock({ ...newStock, symbol: result.symbol });
                        setSearchResults([]);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-600 border-b border-slate-600 last:border-b-0 text-white text-sm"
                    >
                      <p className="font-bold">{result.symbol}</p>
                      <p className="text-xs text-slate-400">Güncel: ₺{result.currentPrice.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedStock && (
                <div className="bg-green-900/30 border border-green-600 p-3 rounded-lg">
                  <p className="text-xs text-green-200">
                    ✅ <strong>{selectedStock.symbol}</strong> seçildi (Güncel: ₺{selectedStock.currentPrice.toFixed(2)})
                  </p>
                </div>
              )}
            </div>

            {/* ADET VE FİYAT */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">Adet</label>
                <input
                  type="number"
                  placeholder="100"
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">Maliyet (₺)</label>
                <input
                  type="number"
                  placeholder="50.00"
                  value={newStock.buyPrice}
                  onChange={(e) => setNewStock({ ...newStock, buyPrice: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* EKLE BUTONU */}
            <button
              onClick={handleAddStock}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
            >
              PORTFÖYE EKLE
            </button>
          </div>
        </div>
      )}

      {/* TAB BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 flex">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'portfolio'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          💼 Portföy
        </button>
      </nav>
    </div>
  );
}
