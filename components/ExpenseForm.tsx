
import React, { useState } from 'react';
import { MinusCircle, ArrowLeftRight, CreditCard, Repeat } from 'lucide-react';
import { Transaction, Account, Category, TransactionType } from '../types';

interface ExpenseFormProps {
  accounts: Account[];
  categories: Category[];
  onSave: (transaction: Transaction) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ accounts, categories, onSave }) => {
  const [formMode, setFormMode] = useState<'EXPENSE' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId) return;

    if (formMode === 'TRANSFER' && accountId === toAccountId) {
      alert("출금 계좌와 입금 계좌는 서로 달라야 합니다.");
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: formMode === 'EXPENSE' ? TransactionType.EXPENSE : TransactionType.TRANSFER,
      amount: parseFloat(amount),
      date,
      memo,
      ...(formMode === 'EXPENSE' 
        ? { categoryId, accountId } 
        : { fromAccountId: accountId, toAccountId }
      )
    };

    onSave(transaction);

    setAmount('');
    setMemo('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <header className="mb-8">
        <div className="flex items-center space-x-3 text-rose-600 mb-2">
          {formMode === 'EXPENSE' ? <MinusCircle className="w-6 h-6" /> : <ArrowLeftRight className="w-6 h-6 text-indigo-600" />}
          <h2 className="text-2xl font-bold text-slate-800">
            {formMode === 'EXPENSE' ? '지출 내역 입력' : '계좌 이체 입력'}
          </h2>
        </div>
        <p className="text-slate-500">
          {formMode === 'EXPENSE' ? '사용한 돈을 기록해보세요.' : '계좌 간 자산 이동을 기록하세요.'}
        </p>
      </header>

      {/* Mode Selector */}
      <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
        <button
          type="button"
          onClick={() => setFormMode('EXPENSE')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-bold ${
            formMode === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>지출</span>
        </button>
        <button
          type="button"
          onClick={() => setFormMode('TRANSFER')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-bold ${
            formMode === 'TRANSFER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>이체</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">금액</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 outline-none transition-all text-xl font-bold ${
                formMode === 'EXPENSE' ? 'focus:ring-rose-500' : 'focus:ring-indigo-500'
              }`}
              placeholder="0"
              required
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₩</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {formMode === 'EXPENSE' ? '지출 종류' : '출금 계좌 (보내는 곳)'}
            </label>
            {formMode === 'EXPENSE' ? (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            ) : (
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {formMode === 'EXPENSE' ? '결제 계좌' : '입금 계좌 (받는 곳)'}
            </label>
            <select
              value={formMode === 'EXPENSE' ? accountId : toAccountId}
              onChange={(e) => formMode === 'EXPENSE' ? setAccountId(e.target.value) : setToAccountId(e.target.value)}
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
            placeholder={formMode === 'EXPENSE' ? "어디에 사용하셨나요?" : "이체 사유를 입력하세요."}
          />
        </div>

        <button
          type="submit"
          className={`w-full p-4 text-white font-bold rounded-2xl transition-all shadow-lg ${
            formMode === 'EXPENSE' 
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
          }`}
        >
          {formMode === 'EXPENSE' ? '지출 기록하기' : '이체 완료'}
        </button>

        {submitted && (
          <div className={`p-4 text-center rounded-xl font-medium ${
            formMode === 'EXPENSE' ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-700'
          }`}>
            성공적으로 기록되었습니다!
            {formMode === 'TRANSFER' && " (총 수입/지출 합계에는 영향을 주지 않습니다)"}
          </div>
        )}
      </form>
    </div>
  );
};

export default ExpenseForm;
