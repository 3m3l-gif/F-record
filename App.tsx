
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  MinusCircle, 
  Settings, 
  Download, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  History,
  Cloud,
  CloudCheck,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { AppData, Transaction, Category, Account, TransactionType, CloudConfig } from './types';
import Dashboard from './components/Dashboard';
import IncomeForm from './components/IncomeForm';
import ExpenseForm from './components/ExpenseForm';
import CategoryManager from './components/CategoryManager';
import BackupManager from './components/BackupManager';
import RecordsView from './components/RecordsView';

const STORAGE_KEY = 'smart_ledger_data_v1';

const INITIAL_DATA: AppData = {
  accounts: [
    { id: '1', name: '현금', initialBalance: 0 },
    { id: '2', name: '은행', initialBalance: 0 }
  ],
  categories: [
    { id: 'c1', name: '급여', type: TransactionType.INCOME, color: '#10b981' },
    { id: 'c2', name: '식비', type: TransactionType.EXPENSE, color: '#f59e0b' },
    { id: 'c3', name: '교통', type: TransactionType.EXPENSE, color: '#3b82f6' }
  ],
  transactions: [],
  cloudConfig: { dbUrl: '', apiKey: '', isEnabled: false }
};

const CloudService = {
  fetchData: async (config?: CloudConfig): Promise<AppData> => {
    if (config?.isEnabled && config.dbUrl) {
      try {
        const response = await fetch(config.dbUrl, {
          headers: { 
            'Authorization': `Bearer ${config.apiKey}`,
            'x-api-key': config.apiKey,
            'Content-Type': 'application/json' 
          }
        });
        if (response.ok) {
          const cloudData = await response.json();
          // 데이터 구조 검증
          if (cloudData && cloudData.transactions) return cloudData;
        }
      } catch (e) {
        console.warn("Cloud fetch failed, using local storage");
      }
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_DATA;
  },
  saveData: async (data: AppData): Promise<void> => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const config = data.cloudConfig;
    if (config?.isEnabled && config.dbUrl) {
      try {
        await fetch(config.dbUrl, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${config.apiKey}`,
            'x-api-key': config.apiKey,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(data)
        });
      } catch (e) {
        console.error("Cloud save failed", e);
      }
    }
  }
};

const Navigation: React.FC<{ isOpen: boolean; setIsOpen: (v: boolean) => void; isSyncing: boolean; cloudEnabled: boolean; }> = ({ isOpen, setIsOpen, isSyncing, cloudEnabled }) => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: '대시보드', icon: LayoutDashboard },
    { path: '/records', label: '전체 기록', icon: History },
    { path: '/income', label: '수입 입력', icon: PlusCircle },
    { path: '/expense', label: '지출/이체 입력', icon: MinusCircle },
    { path: '/manage', label: '분류 관리', icon: Settings },
    { path: '/backup', label: '데이터 관리', icon: Download },
  ];

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
        <h1 className="text-lg font-bold text-indigo-600">Smart Ledger</h1>
        <div className="flex items-center gap-2">
          {isSyncing ? <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" /> : 
           cloudEnabled ? <CloudCheck className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <nav className={`fixed inset-y-0 left-0 bg-white border-r z-50 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 md:w-20'} overflow-hidden flex flex-col`}>
        <div className="p-6 mb-4 flex items-center justify-between">
          <h1 className={`text-xl font-bold text-indigo-600 ${!isOpen && 'hidden'}`}>Smart Ledger</h1>
          <button onClick={() => setIsOpen(!isOpen)} className="hidden md:block p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <ul className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link to={item.path} onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                  className={`flex items-center p-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Icon className={`w-5 h-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
                  {isOpen && <span className="text-sm">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={`p-4 border-t flex items-center gap-2 ${!isOpen && 'justify-center'}`}>
          {isSyncing ? <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" /> : 
           cloudEnabled ? <CloudCheck className="w-4 h-4 text-emerald-500" /> : <Cloud className="w-4 h-4 text-slate-300" />}
          {isOpen && <span className={`text-[10px] font-bold uppercase tracking-tighter ${isSyncing ? 'text-indigo-400' : cloudEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
            {isSyncing ? 'Syncing...' : cloudEnabled ? 'Cloud Sync' : 'Local Only'}
          </span>}
        </div>
      </nav>
      {isOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      const initial = stored ? JSON.parse(stored) : INITIAL_DATA;
      const cloudData = await CloudService.fetchData(initial.cloudConfig);
      setData(cloudData);
    })();
  }, []);

  useEffect(() => {
    if (data) {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        CloudService.saveData(data).finally(() => setIsSyncing(false));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const addTransaction = (t: Transaction) => setData(p => p ? ({ ...p, transactions: [t, ...p.transactions] }) : p);
  const deleteTransaction = (id: string) => {
    if (confirm("삭제하시겠습니까?")) {
      setData(p => p ? ({ ...p, transactions: p.transactions.filter(t => t.id !== id) }) : p);
    }
  };
  const updateSettings = (categories: Category[], accounts: Account[]) => setData(p => p ? ({ ...p, categories, accounts }) : p);
  const updateCloudConfig = (cloudConfig: CloudConfig) => setData(p => p ? ({ ...p, cloudConfig }) : p);

  if (!data) return <div className="h-screen flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Navigation isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isSyncing={isSyncing} cloudEnabled={data.cloudConfig?.isEnabled || false} />
        <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <Routes>
            <Route path="/" element={<Dashboard data={data} />} />
            <Route path="/records" element={<RecordsView data={data} onDelete={deleteTransaction} />} />
            <Route path="/income" element={<IncomeForm accounts={data.accounts} categories={data.categories.filter(c => c.type === TransactionType.INCOME)} onSave={addTransaction} />} />
            <Route path="/expense" element={<ExpenseForm accounts={data.accounts} categories={data.categories.filter(c => c.type === TransactionType.EXPENSE)} onSave={addTransaction} />} />
            <Route path="/manage" element={<CategoryManager categories={data.categories} accounts={data.accounts} onUpdate={updateSettings} />} />
            <Route path="/backup" element={<BackupManager data={data} onRestore={setData} onUpdateCloudConfig={updateCloudConfig} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
