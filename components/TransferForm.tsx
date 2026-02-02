
import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Transaction, Account, TransactionType } from '../types';

interface TransferFormProps {
  accounts: Account[];
  onSave: (transaction: Transaction) => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ accounts, onSave }) => {
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !fromAccountId || !toAccountId || fromAccountId === toAccountId) {
      alert("출금 계좌와 입금 계좌는 서로 달라야 합니다.");
      return;
    }

    onSave({
      id: Date.now().toString(),
      type: TransactionType.TRANSFER,
      amount: parseFloat(amount),
      date,
      memo,
      fromAccountId,
      toAccountId
    });

    setAmount('');
    setMemo('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <header className="mb-8">
        <div className="flex items-center space-x-3 text-indigo-600 mb-2">
          <ArrowLeftRight className="w-6 h-6" />
          <h2 className="text-2xl font-bold">계좌 이체 입력</h2>
        </div>
        <p className="text-slate-500">계좌 간에 돈을 옮겨보세요.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">이체 금액</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xl font-bold"
              placeholder="0"
              required
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₩</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">출금 계좌 (보내는 곳)</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">입금 계좌 (받는 곳)</label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
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
            placeholder="이체 사유 등을 입력하세요."
          />
        </div>

        <button
          type="submit"
          className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-indigo-200"
        >
          이체 완료
        </button>

        {submitted && (
          <div className="p-4 bg-indigo-50 text-indigo-700 text-center rounded-xl font-medium">
            성공적으로 이체되었습니다! (총 수입/지출 합계에는 영향을 주지 않습니다)
          </div>
        )}
      </form>
    </div>
  );
};

export default TransferForm;
