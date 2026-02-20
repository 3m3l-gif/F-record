import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AppData, TransactionType } from '../types';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // 이번 달 확인 함수
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
        if (t.type === TransactionType.INCOME && t.accountId === account.id) {
          balance += t.amount;
        } else if (t.type === TransactionType.EXPENSE && t.accountId === account.id) {
          balance -= t.amount;
        } else if (t.type === TransactionType.TRANSFER) {
          if (t.fromAccountId === account.id) balance -= t.amount;
          if (t.toAccountId === account.id) balance += t.amount;
        }
      });
      return { ...account, balance };
    });

    const totalBalance = accountBalances.reduce((sum, acc) => sum + acc.balance, 0);

    return { monthlyIncome, monthlyExpense, totalBalance, accountBalances };
  }, [data]);

  const getChartData = (type: TransactionType) => {
    const totals: Record<string, number> = {};
    data.transactions
      .filter(t => t.type === type && isCurrentMonth(t.date))
      .forEach(t => {
        const cat = data.categories.find(c => c.id === t.categoryId);
        const name = cat ? cat.name : '기타';
        totals[name] = (totals[name] || 0) + t.amount;
      });

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value,
      color: data.categories.find(c => c.name === name)?.color || '#cbd5e1'
    }));
  };

  const incomeChartData = getChartData(TransactionType.INCOME);
  const expenseChartData = getChartData(TransactionType.EXPENSE);

  const formatKRW = (val: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">대시보드</h2>
        <p className="text-slate-500 text-sm">{new Date().getFullYear()}년 {new Date().getMonth() + 1}월 자산 현황</p>
      </header>

      {/* 요약 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 총 잔액 카드 (계좌별 잔액 포함) */}
        <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 opacity-80 mb-1">
              <Wallet size={18} />
              <span className="text-sm font-medium">총 잔액</span>
            </div>
            <p className="text-3xl font-bold">{formatKRW(summary.totalBalance)}</p>
          </div>
          
          {/* 계좌별 잔액 표시 (작게) */}
          <div className="mt-4 pt-3 border-t border-white/20 space-y-1">
            {summary.accountBalances.map(acc => (
              <div key={acc.id} className="flex justify-between text-[11px] opacity-90">
                <span>{acc.name}</span>
                <span className="font-semibold">{formatKRW(acc.balance)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 이번 달 수입 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">이번 달 수입</p>
            <p className="text-xl font-bold text-emerald-600">{formatKRW(summary.monthlyIncome)}</p>
          </div>
        </div>

        {/* 이번 달 지출 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">이번 달 지출</p>
            <p className="text-xl font-bold text-rose-600">{formatKRW(summary.monthlyExpense)}</p>
          </div>
        </div>
      </div>

      {/* 그래프 섹션 (다시 추가됨) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">지출 분포</h3>
          <div className="h-64">
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {expenseChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatKRW(val)} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">지출 데이터가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">수입 분포</h3>
          <div className="h-64">
            {incomeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={incomeChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {incomeChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatKRW(val)} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">수입 데이터가 없습니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;