import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
// Firebase 도구
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
// 아이콘
import { 
  LayoutDashboard, PlusCircle, MinusCircle, Settings, Download, 
  Menu, ChevronLeft, ChevronRight, History, CloudCheck, RefreshCw 
} from 'lucide-react';
// 타입 및 컴포넌트
import { AppData, TransactionType, Transaction, Category, Account } from './types';
import Dashboard from './components/Dashboard';
import IncomeForm from './components/IncomeForm';
import ExpenseForm from './components/ExpenseForm';
import CategoryManager from './components/CategoryManager';
import BackupManager from './components/BackupManager';
import RecordsView from './components/RecordsView';

// 1. Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDVRpRHS52MafuqHZL9aM7ORo9u-oqCdRU",
  authDomain: "f-record.firebaseapp.com",
  databaseURL: "https://f-record-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "f-record",
  storageBucket: "f-record.firebasestorage.app",
  messagingSenderId: "188434268758",
  appId: "1:188434268758:web:47384e682911afa2dff1f7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const INITIAL_DATA: AppData = {
  accounts: [{ id: '1', name: '현금', initialBalance: 0 }, { id: '2', name: '은행', initialBalance: 0 }],
  categories: [
    { id: 'c1', name: '급여', type: TransactionType.INCOME, color: '#10b981' },
    { id: 'c2', name: '식비', type: TransactionType.EXPENSE, color: '#f59e0b' }
  ],
  transactions: [],
  cloudConfig: { dbUrl: firebaseConfig.databaseURL, apiKey: firebaseConfig.apiKey, isEnabled: true }
};

// 2. Navigation 컴포넌트 (파일 누락 에러 방지를 위해 내부에 포함)
const Navigation: React.FC<{ isOpen: boolean; setIsOpen: (v: boolean) => void; isSyncing: boolean; }> = ({ isOpen, setIsOpen, isSyncing }) => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: '대시보드', icon: LayoutDashboard },
    { path: '/records', label: '전체 기록', icon: History },
    { path: '/income', label: '수입 입력', icon: PlusCircle },
    { path: '/expense', label: '지출 입력', icon: MinusCircle },
    { path: '/manage', label: '분류 관리', icon: Settings },
    { path: '/backup', label: '데이터/클라우드', icon: Download },
  ];

  return (
    <nav className={`fixed inset-y-0 left-0 bg-white border-r z-50 transition-all ${isOpen ? 'w-64' : 'w-20'} flex flex-col`}>
      <div className="p-6 flex items-center justify-between">
        {isOpen && <h1 className="text-xl font-bold text-indigo-600">Smart Ledger</h1>}
        <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      <ul className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link to={item.path} className={`flex items-center p-3 rounded-xl ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
              <item.icon className={`w-5 h-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
              {isOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t flex justify-center">
        {isSyncing ? <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" /> : <CloudCheck className="w-4 h-4 text-emerald-500" />}
      </div>
    </nav>
  );
};

// 3. 메인 App
const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'user_main_data'), (snapshot) => {
      setData(snapshot.val() || INITIAL_DATA);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (data) {
      setIsSyncing(true);
      const timer = setTimeout(async () => {
        try { await set(ref(db, 'user_main_data'), data); }
        finally { setIsSyncing(false); }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const addTransaction = (t: Transaction) => setData(p => p ? ({ ...p, transactions: [t, ...p.transactions] }) : p);
  const deleteTransaction = (id: string) => {
    if (window.confirm("삭제하시겠습니까?")) {
      setData(p => p ? ({ ...p, transactions: p.transactions.filter(t => t.id !== id) }) : p);
    }
  };
  const updateSettings = (categories: Category[], accounts: Account[]) => setData(p => p ? ({ ...p, categories, accounts }) : p);

  if (!data) return <div className="h-screen flex items-center justify-center font-bold">데이터 불러오는 중...</div>;

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Navigation isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isSyncing={isSyncing} />
        <main className={`flex-1 p-4 md:p-8 transition-all ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <Routes>
            <Route path="/" element={<Dashboard data={data} />} />
            <Route path="/records" element={<RecordsView data={data} onDelete={deleteTransaction} />} />
            <Route path="/income" element={<IncomeForm accounts={data.accounts} categories={data.categories.filter(c => c.type === TransactionType.INCOME)} onSave={addTransaction} />} />
            <Route path="/expense" element={<ExpenseForm accounts={data.accounts} categories={data.categories.filter(c => c.type === TransactionType.EXPENSE)} onSave={addTransaction} />} />
            <Route path="/manage" element={<CategoryManager categories={data.categories} accounts={data.accounts} onUpdate={updateSettings} />} />
            <Route path="/backup" element={<BackupManager data={data} onRestore={setData} onUpdateCloudConfig={() => {}} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
