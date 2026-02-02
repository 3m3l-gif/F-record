
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
  History
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

interface NavigationProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: '대시보드', icon: LayoutDashboard },
    { path: '/records', label: '전체 기록', icon: History },
    { path: '/income', label: '수입 입력', icon: PlusCircle },
    { path: '/expense', label: '지출/이체 입력', icon: MinusCircle },
    { path: '/manage', label: '분류 관리', icon: Settings },
    { path: '/backup', label: '백업/복구', icon: Download },
  ];

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <h1 className="text-lg font-bold text-indigo-600">Smart Ledger</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <nav className={`
        fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}
        overflow-hidden flex flex-col
      `}>
        <div className={`p-6 mb-4 flex items-center justify-between ${!isOpen && 'md:justify-center'}`}>
          <h1 className={`text-xl font-bold text-indigo-600 whitespace-nowrap ${!isOpen && 'md:hidden'}`}>Smart Ledger Pro</h1>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="hidden md:flex p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <ul className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                  className={`flex items-center p-3 rounded-xl transition-all ${
                    isActive 
                    ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                    : 'text-slate-500 hover:bg-slate-50'
                  } ${!isOpen && 'md:justify-center'}`}
                  title={!isOpen ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 ${isOpen ? 'mr-3' : 'md:mr-0'}`} />
                  <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={`p-4 border-t border-slate-50 flex items-center ${!isOpen ? 'justify-center' : 'space-x-2'}`}>
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className={`text-[10px] text-slate-400 font-medium whitespace-nowrap ${!isOpen && 'hidden'}`}>
            브라우저 캐시 자동 저장 중
          </span>
        </div>
      </nav>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_DATA;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addTransaction = (transaction: Transaction) => {
    setData(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions]
    }));
  };

  const deleteTransaction = (id: string) => {
    if (confirm("이 기록을 삭제하시겠습니까?")) {
      setData(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id)
      }));
    }
  };

  const updateSettings = (categories: Category[], accounts: Account[]) => {
    setData(prev => ({
      ...prev,
      categories,
      accounts
    }));
  };

  const handleRestore = (restoredData: AppData) => {
    setData(restoredData);
  };

  return (
    <HashRouter>
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
        <Navigation isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <main className={`
          flex-1 p-4 md:p-8 overflow-y-auto max-h-screen transition-all duration-300
          ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}
        `}>
          <Routes>
            <Route path="/" element={<Dashboard data={data} />} />
            <Route path="/records" element={<RecordsView data={data} onDelete={deleteTransaction} />} />
            <Route path="/income" element={<IncomeForm accounts={data.accounts} categories={data.categories.filter(c => c.type === TransactionType.INCOME)} onSave={addTransaction} />} />
            <Route path="/expense" element={<ExpenseForm accounts={data.accounts} categories={data.categories.filter(c => c.type === TransactionType.EXPENSE)} onSave={addTransaction} />} />
            <Route path="/manage" element={<CategoryManager categories={data.categories} accounts={data.accounts} onUpdate={updateSettings} />} />
            <Route path="/backup" element={<BackupManager data={data} onRestore={handleRestore} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
