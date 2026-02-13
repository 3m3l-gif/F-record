import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { 
  LayoutDashboard, PlusCircle, MinusCircle, Settings, Download, 
  Menu, ChevronLeft, ChevronRight, History, CloudCheck, RefreshCw 
} from 'lucide-react';
import { AppData, Transaction, Category, Account, TransactionType } from './types';
import Dashboard from './components/Dashboard';
import IncomeForm from './components/IncomeForm';
import ExpenseForm from './components/ExpenseForm';
import CategoryManager from './components/CategoryManager';
import BackupManager from './components/BackupManager';
import RecordsView from './components/RecordsView';

// 5시 09분에 캡처하신 실제 Firebase 설정 정보
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

// ... (이하 Navigation 및 App 컴포넌트 로직 동일)
