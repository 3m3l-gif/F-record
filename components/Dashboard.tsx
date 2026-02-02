
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AppData, TransactionType } from '../types';
import { Wallet, TrendingUp, TrendingDown, Landmark } from 'lucide-react';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Helper to check if a date string (YYYY-MM-DD) is in the current month
  const isCurrentMonth = (dateStr: string) => {
    const [year, month] = dateStr.split('-').map(Number);
    const now = new Date();
    // Using local time as per standard browser behavior, which aligns with user's current "Today"
    return year === now.getFullYear() && month === (now.getMonth() + 1);
  };

  const summary = useMemo(() => {
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    
    // Monthly totals (Reset on the 1st of every month)
    data.transactions.forEach(t => {
      if (isCurrentMonth(t.date)) {
        if (t.type === TransactionType.INCOME) monthlyIncome += t.amount;
        if (t.type === TransactionType.EXPENSE) monthlyExpense += t.amount;
      }
    });

    // Account Balances (Cumulative - not reset)
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
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">대시보드</h2>
          <p className="text-slate-500">이번 달 나의 자산 현황</p>
        </div>
        <div className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">
          {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 현황
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance Card with Account Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col space-y-4 hover:border-indigo-200 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">총 잔액</p>
              <p className="text-xl font-bold">{formatKRW(summary.totalBalance)}</p>
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-50 space-y-1.5">
            {summary.accountBalances.map(acc => (
              <div key={acc.id} className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-medium">{acc.name}</span>
                <span className="text-slate-600 font-semibold">{formatKRW(acc.balance)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 h-fit hover:border-emerald-200 transition-colors">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">이번 달 수입</p>
            <p className="text-xl font-bold text-emerald-600">{formatKRW(summary.monthlyIncome)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 h-fit hover:border-rose-200 transition-colors">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">이번 달 지출</p>
            <p className="text-xl font-bold text-rose-600">{formatKRW(summary.monthlyExpense)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Charts */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
            <span>지출 분포</span>
            <span className="text-[10px] text-slate-400 font-normal">이번 달 기준</span>
          </h3>
          <div className="h-64">
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatKRW(value)} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                이번 달 지출 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
            <span>수입 분포</span>
            <span className="text-[10px] text-slate-400 font-normal">이번 달 기준</span>
          </h3>
          <div className="h-64">
            {incomeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeChartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {incomeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatKRW(value)} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                이번 달 수입 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">최근 내역</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-medium min-w-[100px]">날짜</th>
                  <th className="pb-3 font-medium min-w-[80px]">유형</th>
                  <th className="pb-3 font-medium min-w-[150px]">카테고리/계좌</th>
                  <th className="pb-3 font-medium min-w-[200px]">메모</th>
                  <th className="pb-3 font-medium text-right min-w-[120px]">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.transactions.slice(0, 10).map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-slate-500 whitespace-nowrap">{t.date}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 
                        t.type === TransactionType.EXPENSE ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {t.type === TransactionType.INCOME ? '수입' : t.type === TransactionType.EXPENSE ? '지출' : '이체'}
                      </span>
                    </td>
                    <td className="py-3">
                      {t.type === TransactionType.TRANSFER ? (
                        <span className="text-slate-600">{data.accounts.find(a => a.id === t.fromAccountId)?.name} → {data.accounts.find(a => a.id === t.toAccountId)?.name}</span>
                      ) : (
                        <span className="text-slate-600">
                          {data.categories.find(c => c.id === t.categoryId)?.name || '기타'} 
                          <span className="text-slate-400 text-[11px] ml-1">({data.accounts.find(a => a.id === t.accountId)?.name})</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500 italic max-w-xs truncate" title={t.memo}>
                      {t.memo || <span className="text-slate-300">-</span>}
                    </td>
                    <td className={`py-3 text-right font-semibold whitespace-nowrap ${
                        t.type === TransactionType.INCOME ? 'text-emerald-600' : 
                        t.type === TransactionType.EXPENSE ? 'text-rose-600' : 'text-blue-600'
                    }`}>
                      {t.type === TransactionType.EXPENSE ? '-' : ''}{formatKRW(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.transactions.length === 0 && (
              <div className="py-12 text-center text-slate-400 italic">
                표시할 내역이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
