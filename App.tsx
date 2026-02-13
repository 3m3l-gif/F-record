import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
// Firebase 도구 가져오기
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
// 기존 아이콘 및 컴포넌트들
import { LayoutDashboard, History, PlusCircle, MinusCircle, Settings, Download } from 'lucide-react';
import { AppData, TransactionType } from './types';
import Dashboard from './components/Dashboard';
import RecordsView from './components/RecordsView';
import IncomeForm from './components/IncomeForm';
import ExpenseForm from './components/ExpenseForm';
import CategoryManager from './components/CategoryManager';
import BackupManager from './components/BackupManager';
import Navigation from './components/Navigation'; // Navigation이 별도 파일인 경우

// 1. 사용자님이 보내주신 실제 열쇠 정보
const firebaseConfig = {
  apiKey: "AIzaSyDVRpRHS52MafuqHZL9aM7ORo9u-oqCdRU",
  authDomain: "f-record.firebaseapp.com",
  databaseURL: "https://f-record-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "f-record",
  storageBucket: "f-record.firebasestorage.app",
  messagingSenderId: "188434268758",
  appId: "1:188434268758:web:47384e682911afa2dff1f7"
};

// 2. Firebase 초기화
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

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // 3. 클라우드에서 실시간 데이터 읽기
  useEffect(() => {
    const dataRef = ref(db, 'user_main_data');
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const cloudData = snapshot.val();
      if (cloudData) {
        setData(cloudData);
      } else {
        setData(INITIAL_DATA); // 클라우드에 데이터가 없으면 초기값 세팅
      }
    });
    return () => unsubscribe();
  }, []);

  // 4. 데이터 변경 시 자동으로 클라우드에 쓰기
  useEffect(() => {
    if (data) {
      setIsSyncing(true);
      const timer = setTimeout(async () => {
        try {
          await set(ref(db, 'user_main_data'), data);
        } finally {
          setIsSyncing(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data) return <div className="h-screen flex items-center justify-center font-bold">데이터 연결 중...</div>;

  // ... 기존 return 문 및 기능 함수(addTransaction 등)는 그대로 유지
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Navigation isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isSyncing={isSyncing} cloudEnabled={true} />
        <main className={`flex-1 p-4 md:p-8 transition-all ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <Routes>
            <Route path="/" element={<Dashboard data={data} />} />
            {/* 나머지 Route들도 기존과 동일하게 유지 */}
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
