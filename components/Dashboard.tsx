
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AppData, TransactionType } from '../types';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {

  const isCurrentMonth = (dateStr: string) => {
    const [year, month] = dateStr.split('-').map(Number);
    const now = new Date();
    return year === now.getFullYear() && month === (now.getMonth() + 1);
  };

  const summary = useMemo(() => {
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    
    data.transactions.forEach(t => {
      if (isCurrentMonth(t.date)) {
        if (t.type === TransactionType.INCOME) monthlyIncome += t.amount;
        if (t.type === TransactionType.EXPENSE) monthlyExpense += t.amount;
      }
    });

    const accountBalances = data.accounts.map(account => {
      let balance = account.initialBalance;
      data.transactions.forEach(t => {
        if (t.accountId === account.id) {
          if (t.type === TransactionType.INCOME) balance += t.amount;
          else if (t.type === TransactionType.EXPENSE) balance -= t.amount;
        }
      });
      return { ...account, balance };
    });

    return { 
      monthlyIncome, 
      monthlyExpense, 
      totalBalance: accountBalances.reduce((sum, acc) => sum + acc.balance, 0),
      accountBalances 
    };
  }, [data]);

  const formatKRW = (val: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">대시보드</h2>
        <p className="text-slate-500">이번 달 나의 자산 요약</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Wallet size={20}/></div>
            <span className="text-sm text-slate-500">총 잔액</span>
          </div>
          <p className="text-2xl font-bold">{formatKRW(summary.totalBalance)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={20}/></div>
            <span className="text-sm text-slate-500">이번 달 수입</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatKRW(summary.monthlyIncome)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><TrendingDown size={20}/></div>
            <span className="text-sm text-slate-500">이번 달 지출</span>
          </div>
          <p className="text-2xl font-bold text-rose-600">{formatKRW(summary.monthlyExpense)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4 text-slate-700">계좌별 잔액</h3>
        <div className="space-y-2">
          {summary.accountBalances.map(acc => (
            <div key={acc.id} className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500">{acc.name}</span>
              <span className="font-semibold">{formatKRW(acc.balance)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center py-10 border-2 border-dashed rounded-2xl text-slate-400">
        상세 내역은 <span className="font-bold text-indigo-500">'전체 기록'</span> 메뉴에서 확인하세요!
      </div>
    </div>
  );
};

export default Dashboard;