import React, { useState } from 'react';
import { Roommate, ExpenseCategory, SplitMethod, ExpenseRecord } from '../types';
import { X, DollarSign, Users, Home, Sparkles } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommates: Roommate[];
  currentUserId: string;
  onAddExpense: (expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'isFullySettled'>) => void;
  prefill?: {
    title?: string;
    amount?: number;
    category?: ExpenseCategory;
    note?: string;
  };
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  roommates,
  currentUserId,
  onAddExpense,
  prefill,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(prefill?.title || '');
  const [amount, setAmount] = useState(prefill?.amount ? String(prefill.amount) : '');
  const [category, setCategory] = useState<ExpenseCategory>(prefill?.category || 'supplies');
  const [payerId, setPayerId] = useState(currentUserId);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    roommates.map((r) => r.id)
  );
  const [date, setDate] = useState('2026-09-12');
  const [note, setNote] = useState(prefill?.note || '');

  const totalArea = roommates.reduce((s, r) => s + r.roomArea, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    if (selectedParticipants.length === 0) return;

    // Calculate splits
    let splits: { roommateId: string; amount: number; isPaid: boolean; settledAt?: string }[] = [];

    if (splitMethod === 'equal') {
      const perPerson = Math.round((numAmount / selectedParticipants.length) * 100) / 100;
      splits = selectedParticipants.map((rid) => ({
        roommateId: rid,
        amount: perPerson,
        isPaid: rid === payerId,
        settledAt: rid === payerId ? `${date} 12:00` : undefined,
      }));
    } else if (splitMethod === 'by_area') {
      // Split proportional to room area
      const activeArea = roommates
        .filter((r) => selectedParticipants.includes(r.id))
        .reduce((sum, r) => sum + r.roomArea, 0);

      splits = selectedParticipants.map((rid) => {
        const r = roommates.find((x) => x.id === rid)!;
        const share = Math.round((numAmount * (r.roomArea / activeArea)) * 100) / 100;
        return {
          roommateId: rid,
          amount: share,
          isPaid: rid === payerId,
          settledAt: rid === payerId ? `${date} 12:00` : undefined,
        };
      });
    }

    onAddExpense({
      title: title.trim() || '合租公共支出',
      amount: numAmount,
      category,
      payerId,
      date,
      splitMethod,
      splits,
      note: note.trim(),
    });

    onClose();
  };

  const toggleParticipant = (id: string) => {
    if (selectedParticipants.includes(id)) {
      if (selectedParticipants.length > 1) {
        setSelectedParticipants(selectedParticipants.filter((x) => x !== id));
      }
    } else {
      setSelectedParticipants([...selectedParticipants, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-stone-100 text-stone-900">
              <DollarSign className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900">录入合租公共开销</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              支出项目名称 *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：9月公共电费充值、立白洗洁精+卷纸..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                总金额 (元) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                  ¥
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2.5 text-xs font-bold rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                费用类型
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400"
              >
                <option value="electricity">公区电费</option>
                <option value="water_gas">水费/燃气</option>
                <option value="internet">合租宽带</option>
                <option value="supplies">公共日用消耗品</option>
                <option value="rent">房屋租金</option>
                <option value="maintenance">维修五金</option>
                <option value="other">其他杂项</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                谁垫付的这笔钱？
              </label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400"
              >
                {roommates.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.roomName.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                消费日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Split Method Toggle */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              分摊计算规则
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSplitMethod('equal')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center space-x-2 transition-colors ${
                  splitMethod === 'equal'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-semibold">人人均摊</div>
                  <div className={`text-[10px] ${splitMethod === 'equal' ? 'text-stone-300' : 'text-stone-400'}`}>
                    选定室友平分总额
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSplitMethod('by_area')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center space-x-2 transition-colors ${
                  splitMethod === 'by_area'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-semibold">按房间面积分摊</div>
                  <div className={`text-[10px] ${splitMethod === 'by_area' ? 'text-stone-300' : 'text-stone-400'}`}>
                    适合主次卧房租或大功率暖气
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              参与分摊的室友 ({selectedParticipants.length}人参与)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {roommates.map((r) => {
                const isSelected = selectedParticipants.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleParticipant(r.id)}
                    className={`p-2 rounded-xl border text-xs flex items-center space-x-1.5 transition-all ${
                      isSelected
                        ? 'bg-stone-100 border-stone-400 font-semibold text-stone-900'
                        : 'bg-white border-stone-200 text-stone-400 opacity-60'
                    }`}
                  >
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="truncate">{r.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              备注或采购说明（选填）
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例：山姆超市实付凭证已存在微信群相册..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50"
            >
              取消
            </button>
            <button
              type="submit"
              id="submit-expense-btn"
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
            >
              确认生成AA账单
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
