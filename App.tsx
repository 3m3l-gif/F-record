import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  MinusCircle, 
  Settings, 
  Download, 
  Menu, 
  ChevronLeft,
  ChevronRight,
  History,
  Database
} from 'lucide-react';
import { AppData, Transaction, Category, Account, TransactionType } from './types';
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
  transactions: []
};

// 1. 최신순 정렬을 위한 계산기 함수
const sortTransactions = (list: Transaction[]) => {
  return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const Navigation: React.FC<{ isOpen: boolean; setIsOpen: (v: boolean) => void; }> = ({ isOpen, setIsOpen }) => {
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
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
          <Menu className="w-6 h-6" />
        </button>
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

        <div className="p-4 border-t flex items-center justify-center">
          <div className="flex items-center gap-2 opacity-40">
            <Database className="w-3.5 h-3.5" />
            {isOpen && <span className="text-[10px] font-bold uppercase tracking-widest">Local Storage Only</span>}
          </div>
        </div>
      </nav>
      {isOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // 2. 데이터 불러올 때 최신순 정렬 적용
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setData({
        ...parsed,
        transactions: sortTransactions(parsed.transactions || [])
      });
    } else {
      setData(INITIAL_DATA);
    }
  }, []);

  useEffect(() => {
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  // 3. 기록 추가할 때 최신순 정렬 유지
  const addTransaction = (t: Transaction) => setData(p => {
    if (!p) return p;
    return {
      ...p,
      transactions: sortTransactions([t, ...p.transactions])
    };
  });

  const deleteTransaction = (id: string) => {
    if (window.confirm("삭제하시겠습니까?")) {
      setData(p => p ? ({ ...p, transactions: p.transactions.filter(t => t.id !== id) }) : p);
    }
  };

  const updateSettings = (categories: Category[], accounts: Account[]) => setData(p => p ? ({ ...p, categories, accounts }) : p);

  if (!data) return null;

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Navigation isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <Routes>
            <Route path="/" element={<Dashboard data={data} />} />
            <Route path="/records" element={<RecordsView data={data} onDelete={deleteTransaction} />} />
            <Route path="/income" element={<IncomeForm accounts={data.accounts} categories={data.categories.filter(c => c.type === TransactionType.INCOME)} onSave={addTransaction} />} />
            <Route path="/expense" element={<ExpenseForm accounts={data.accounts} categories={data.categories.filter(c => c.type === TransactionType.EXPENSE)} onSave={addTransaction} />} />
            <Route path="/manage" element={<CategoryManager categories={data.categories} accounts={data.accounts} onUpdate={updateSettings} />} />
            <Route path="/backup" element={<BackupManager data={data} onRestore={setData} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;