/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, TrendingUp, Lock, Settings, RefreshCw, Trash2 } from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState(() => localStorage.getItem('appPassword') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(!localStorage.getItem('appPassword'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const cameraInputRef = useRef(null);

  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('myPrivatePortfolio');
    return saved ? JSON.parse(saved) : [
      { id: 1, symbol: 'ANSGR', name: 'Angelini', quantity: 306, buyPrice: 26.97, currentPrice: 26.28, investedAmount: 8249.82, currentAmount: 8049.68 },
      { id: 2, symbol: 'TUPRS', name: 'Tuprs', quantity: 45, buyPrice: 226.11, currentPrice: 274.00, investedAmount: 10174.95, currentAmount: 12330.00 }
    ];
  });

  const [analysisHistory, setAnalysisHistory] = useState(() => {
    const saved = localStorage.getItem('myPrivateAnalysis');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchLiveData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('https://www.getmidas.com/canli-borsa');
      if (res.ok) {
        // Canlı veri işleme mantığı buraya gelecek
      }
    } catch (e) { console.error("Veri çekilemedi"); }
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  const verifyPassword = () => {
    if (passwordInput === password) setIsLocked(false);
    else alert('Şifre Yanlış');
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  if (isLocked && !showPasswordSetup) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-lg border-2 border-blue-600 text-center space-y-4">
          <Lock className="mx-auto text-blue-400" size={48} />
          <input 
            type="password" 
            className="w-full p-2 bg-slate-700 text-white rounded" 
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
          />
          <button onClick={verifyPassword} className="w-full bg-blue-600 p-2 rounded font-bold text-white">Giriş</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <header className="p-4 bg-blue-900 flex justify-between items-center">
        <h1 className="font-bold flex items-center gap-2"><Lock size={18}/> Portföy</h1>
        <button onClick={fetchLiveData}><RefreshCw className={isRefreshing ? 'animate-spin' : ''}/></button>
      </header>

      <main className="p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-sm">Toplam Varlık</p>
              <p className="text-2xl font-bold text-blue-400">₺{portfolio.reduce((a,b) => a + b.currentAmount, 0).toLocaleString()}</p>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={portfolio} dataKey="currentAmount" nameKey="symbol" cx="50%" cy="50%" outerRadius={50}>
                    {portfolio.map((entry, index) => <Cell key={index} fill={['#3b82f6', '#10b981'][index % 2]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {activeTab === 'portfolio' && (
          <div className="space-y-2">
            {portfolio.map(s => (
              <div key={s.id} className="p-3 bg-slate-800 rounded flex justify-between">
                <span>{s.symbol}</span>
                <span className="font-bold text-green-400">₺{s.currentPrice}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-4">
        <button onClick={() => setActiveTab('dashboard')}><TrendingUp /></button>
        <button onClick={() => setActiveTab('portfolio')}><Settings /></button>
        <button onClick={() => cameraInputRef.current.click()}><Camera /></button>
        <input ref={cameraInputRef} type="file" className="hidden" onChange={handleImageCapture} />
      </nav>
    </div>
  );
}
