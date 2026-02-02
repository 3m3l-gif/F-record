
import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Transaction, Account, Category, TransactionType } from '../types';

interface IncomeFormProps {
  accounts: Account[];
  categories: Category[];
  onSave: (transaction: Transaction) => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ accounts, categories, onSave }) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId) return;

    onSave({
      id: Date.now().toString(),
      type: TransactionType.INCOME,
      amount: parseFloat(amount),
      date,
      memo,
      categoryId,
      accountId
    });

    setAmount('');
    setMemo('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <header className="mb-8">
        <div className="flex items-center space-x-3 text-emerald-600 mb-2">
          <PlusCircle className="w-6 h-6" />
          <h2 className="text-2xl font-bold">수입 내역 입력</h2>
        </div>
        <p className="text-slate-500">들어온 돈을 기록해보세요.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">금액</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xl font-bold"
              placeholder="0"
              required
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₩</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">수입 종류</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">입금 계좌</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none resize-none h-32"
            placeholder="상세 내용을 입력하세요..."
          />
        </div>

        <button
          type="submit"
          className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-emerald-200"
        >
          기록하기
        </button>

        {submitted && (
          <div className="p-4 bg-emerald-50 text-emerald-700 text-center rounded-xl font-medium">
            성공적으로 기록되었습니다!
          </div>
        )}
      </form>
    </div>
  );
};

export default IncomeForm;
