
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Landmark, List } from 'lucide-react';
import { Category, Account, TransactionType } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  accounts: Account[];
  onUpdate: (categories: Category[], accounts: Account[]) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, accounts, onUpdate }) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<TransactionType.INCOME | TransactionType.EXPENSE>(TransactionType.EXPENSE);
  const [newAccName, setNewAccName] = useState('');

  // Editing states
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [editingAccName, setEditingAccName] = useState('');

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // --- Account Actions ---
  const addAccount = () => {
    if (!newAccName.trim()) return;
    const newAcc: Account = {
      id: Date.now().toString(),
      name: newAccName.trim(),
      initialBalance: 0 // Defaulting to 0 as requested to remove "numbers" from setup
    };
    onUpdate(categories, [...accounts, newAcc]);
    setNewAccName('');
  };

  const startEditingAccount = (acc: Account) => {
    setEditingAccId(acc.id);
    setEditingAccName(acc.name);
  };

  const saveAccountEdit = () => {
    if (!editingAccName.trim() || !editingAccId) return;
    const updated = accounts.map(a => a.id === editingAccId ? { ...a, name: editingAccName.trim() } : a);
    onUpdate(categories, updated);
    setEditingAccId(null);
  };

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) {
      alert("최소 하나의 계좌는 필요합니다.");
      return;
    }
    if (confirm("이 계좌를 삭제하시겠습니까? 연결된 내역이 있을 수 있습니다.")) {
      onUpdate(categories, accounts.filter(a => a.id !== id));
    }
  };

  // --- Category Actions ---
  const addCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: Date.now().toString(),
      name: newCatName.trim(),
      type: newCatType,
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
    };
    onUpdate([...categories, newCat], accounts);
    setNewCatName('');
  };

  const startEditingCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const saveCategoryEdit = () => {
    if (!editingCatName.trim() || !editingCatId) return;
    const updated = categories.map(c => c.id === editingCatId ? { ...c, name: editingCatName.trim() } : c);
    onUpdate(updated, accounts);
    setEditingCatId(null);
  };

  const deleteCategory = (id: string) => {
    if (confirm("이 분류를 삭제하시겠습니까?")) {
      onUpdate(categories.filter(c => c.id !== id), accounts);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">분류 관리</h2>
        <p className="text-slate-500">계좌와 카테고리를 자유롭게 관리하세요.</p>
      </header>

      {/* Account Management */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-2 mb-6 text-indigo-600">
          <Landmark className="w-5 h-5" />
          <h3 className="text-lg font-bold">계좌 관리</h3>
        </div>
        
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={newAccName}
            onChange={(e) => setNewAccName(e.target.value)}
            placeholder="새 계좌 이름 (예: 생활비 통장)"
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            onKeyPress={(e) => e.key === 'Enter' && addAccount()}
          />
          <button
            onClick={addAccount}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">추가</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {accounts.map(acc => (
            <div key={acc.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
              {editingAccId === acc.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    autoFocus
                    type="text"
                    value={editingAccName}
                    onChange={(e) => setEditingAccName(e.target.value)}
                    className="flex-1 p-1 px-2 border border-indigo-300 rounded-lg outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && saveAccountEdit()}
                  />
                  <button onClick={saveAccountEdit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check className="w-4 h-4"/></button>
                  <button onClick={() => setEditingAccId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4"/></button>
                </div>
              ) : (
                <>
                  <span className="font-medium text-slate-700">{acc.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditingAccount(acc)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Category Management */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-2 mb-6 text-emerald-600">
          <List className="w-5 h-5" />
          <h3 className="text-lg font-bold">카테고리 관리</h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-8">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="새 카테고리 이름 (예: 식비)"
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
          />
          <select
            value={newCatType}
            onChange={(e) => setNewCatType(e.target.value as TransactionType.INCOME | TransactionType.EXPENSE)}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
          >
            <option value={TransactionType.EXPENSE}>지출</option>
            <option value={TransactionType.INCOME}>수입</option>
          </select>
          <button
            onClick={addCategory}
            className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">추가</span>
          </button>
        </div>

        <div className="space-y-8">
          {/* Income Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>
              수입 카테고리
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.filter(c => c.type === TransactionType.INCOME).map(cat => (
                <div key={cat.id} className="group relative flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {editingCatId === cat.id ? (
                    <div className="flex items-center gap-1 w-full">
                      <input
                        autoFocus
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="flex-1 p-0.5 px-2 border border-emerald-300 rounded-lg outline-none text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && saveCategoryEdit()}
                      />
                      <button onClick={saveCategoryEdit} className="p-1 text-emerald-600"><Check className="w-3.5 h-3.5"/></button>
                      <button onClick={() => setEditingCatId(null)} className="p-1 text-slate-400"><X className="w-3.5 h-3.5"/></button>
                    </div>
                  ) : (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full mr-3 shrink-0" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-sm font-medium text-slate-700 flex-1 truncate">{cat.name}</span>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditingCategory(cat)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit2 className="w-3.5 h-3.5"/></button>
                        <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expense Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mr-2"></span>
              지출 카테고리
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.filter(c => c.type === TransactionType.EXPENSE).map(cat => (
                <div key={cat.id} className="group relative flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {editingCatId === cat.id ? (
                    <div className="flex items-center gap-1 w-full">
                      <input
                        autoFocus
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="flex-1 p-0.5 px-2 border border-rose-300 rounded-lg outline-none text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && saveCategoryEdit()}
                      />
                      <button onClick={saveCategoryEdit} className="p-1 text-emerald-600"><Check className="w-3.5 h-3.5"/></button>
                      <button onClick={() => setEditingCatId(null)} className="p-1 text-slate-400"><X className="w-3.5 h-3.5"/></button>
                    </div>
                  ) : (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full mr-3 shrink-0" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-sm font-medium text-slate-700 flex-1 truncate">{cat.name}</span>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditingCategory(cat)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit2 className="w-3.5 h-3.5"/></button>
                        <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryManager;
