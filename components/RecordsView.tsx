
import React, { useState, useMemo } from 'react';
import { AppData, TransactionType } from '../types';
import { 
  Search, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Repeat, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Scale
} from 'lucide-react';

interface RecordsViewProps {
  data: AppData;
  onDelete: (id: string) => void;
}

const RecordsView: React.FC<RecordsViewProps> = ({ data, onDelete }) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const formatKRW = (val: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);

  const changeMonth = (offset: number) => {
    let newMonth = selectedMonth + offset;
    let newYear = selectedYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
  };

  const monthlyData = useMemo(() => {
    const filteredByMonth = data.transactions.filter(t => {
      const [y, m] = t.date.split('-').map(Number);
      return y === selectedYear && m === selectedMonth;
    });

    let income = 0;
    let expense = 0;
    const categoryTotals: Record<string, number> = {};

    filteredByMonth.forEach(t => {
      if (t.type === TransactionType.INCOME) income += t.amount;
      if (t.type === TransactionType.EXPENSE) {
        expense += t.amount;
        const catName = data.categories.find(c => c.id === t.categoryId)?.name || '기타';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
      }
    });

    const topCategory = Object.entries(categoryTotals).reduce((prev, curr) => {
      return (curr[1] > (prev?.[1] || 0)) ? curr : prev;
    }, null as [string, number] | null);

const finalFiltered = filteredByMonth.filter(t => {
  const matchesType = filterType === 'ALL' || t.type === filterType;
  const matchesSearch = t.memo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (data.categories.find(c => c.id === t.categoryId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
  return matchesType && matchesSearch;
}) // 1. 여기서 세미콜론(;)을 뺍니다.
.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // 2. 이 줄을 새로 추가합니다.


    return { income, expense, topCategory, transactions: finalFiltered };
  }, [data, selectedYear, selectedMonth, filterType, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">월간 기록</h2>
          <p className="text-slate-500">{selectedYear}년 {selectedMonth}월의 가계부 현황입니다.</p>
        </div>
        
        <div className="flex items-center space-x-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-lg font-bold text-slate-700 min-w-[100px] text-center">
            {selectedYear}. {String(selectedMonth).padStart(2, '0')}
          </span>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">총 수입</p>
            <p className="text-lg font-bold text-emerald-600">{formatKRW(monthlyData.income)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">총 지출</p>
            <p className="text-lg font-bold text-rose-600">{formatKRW(monthlyData.expense)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">최다 지출 분야</p>
            <p className="text-sm font-bold text-slate-700">
              {monthlyData.topCategory ? `${monthlyData.topCategory[0]} (${formatKRW(monthlyData.topCategory[1])})` : '-'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">당월 순수익</p>
            <p className={`text-lg font-bold ${monthlyData.income - monthlyData.expense >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              {formatKRW(monthlyData.income - monthlyData.expense)}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="메모 또는 분류 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(['ALL', TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.TRANSFER] as const).map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  filterType === type 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? '전체' : type === TransactionType.INCOME ? '수입' : type === TransactionType.EXPENSE ? '지출' : '이체'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="px-6 py-4">날짜</th>
                <th className="px-6 py-4">분류 / 계좌</th>
                <th className="px-6 py-4">메모</th>
                <th className="px-6 py-4 text-right">금액</th>
                <th className="px-6 py-4 text-center w-20">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyData.transactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {t.date.split('-').slice(1).join('/')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="shrink-0">
                        {t.type === TransactionType.INCOME && <ArrowUpCircle className="w-4 h-4 text-emerald-500" />}
                        {t.type === TransactionType.EXPENSE && <ArrowDownCircle className="w-4 h-4 text-rose-500" />}
                        {t.type === TransactionType.TRANSFER && <Repeat className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-bold leading-tight">
                          {t.type === TransactionType.TRANSFER ? '계좌 이체' : (data.categories.find(c => c.id === t.categoryId)?.name || '기타')}
                        </span>
                        <span className="text-slate-400 text-[10px] font-medium">
                          {t.type === TransactionType.TRANSFER 
                            ? `${data.accounts.find(a => a.id === t.fromAccountId)?.name} → ${data.accounts.find(a => a.id === t.toAccountId)?.name}`
                            : data.accounts.find(a => a.id === t.accountId)?.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic max-w-[150px] truncate" title={t.memo}>
                    {t.memo || <span className="text-slate-200">-</span>}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${
                      t.type === TransactionType.INCOME ? 'text-emerald-600' : 
                      t.type === TransactionType.EXPENSE ? 'text-rose-600' : 'text-blue-600'
                  }`}>
                    {t.type === TransactionType.EXPENSE ? '-' : ''}{formatKRW(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {monthlyData.transactions.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-4 bg-slate-50 text-slate-300 rounded-full">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-medium italic">이 달의 기록이 없거나 검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordsView;
