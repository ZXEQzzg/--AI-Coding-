import React, { useState } from 'react';
import { Roommate, ExpenseCategory, SplitMethod, ExpenseRecord } from '../types';
import { Language, i18n, formatExpenseCategory } from '../utils/i18n';
import { X, DollarSign, Users, Home } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommates: Roommate[];
  currentUserId: string;
  lang: Language;
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
  lang,
  onAddExpense,
  prefill,
}) => {
  if (!isOpen) return null;

  const t = i18n[lang];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#292524] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E8E1D5] dark:border-stone-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] dark:border-stone-700">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 text-[#8B5E3C] dark:text-amber-400">
              <DollarSign className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-[#2C2218] dark:text-[#F5F5F4]">{t.addExpenseModalTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#796B5B] dark:text-stone-400 hover:text-[#2C2218] dark:hover:text-stone-100 hover:bg-[#FAF7F2] dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
              {t.expenseTitleLabel}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.expenseTitlePlaceholder}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                {t.amountLabel}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89F91] dark:text-stone-500 text-xs font-bold">
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
                  className="w-full pl-7 pr-3 py-2.5 text-xs font-bold rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                {t.expenseCategoryLabel}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
              >
                <option value="electricity">{formatExpenseCategory('electricity', lang)}</option>
                <option value="water_gas">{formatExpenseCategory('water_gas', lang)}</option>
                <option value="internet">{formatExpenseCategory('internet', lang)}</option>
                <option value="supplies">{formatExpenseCategory('supplies', lang)}</option>
                <option value="rent">{formatExpenseCategory('rent', lang)}</option>
                <option value="maintenance">{formatExpenseCategory('maintenance', lang)}</option>
                <option value="other">{formatExpenseCategory('other', lang)}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                {t.whoPaidLabel}
              </label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
              >
                {roommates.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.roomName.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                {t.expenseDateLabel}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
              />
            </div>
          </div>

          {/* Split Method Toggle */}
          <div>
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1.5">
              {t.splitRuleLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSplitMethod('equal')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center space-x-2 transition-colors ${
                  splitMethod === 'equal'
                    ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                    : 'bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#F4EFE6]'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-semibold">{t.equalSplitTitle}</div>
                  <div className={`text-[10px] ${splitMethod === 'equal' ? 'text-amber-100' : 'text-[#A89F91] dark:text-stone-500'}`}>
                    {t.equalSplitDesc}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSplitMethod('by_area')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center space-x-2 transition-colors ${
                  splitMethod === 'by_area'
                    ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                    : 'bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#F4EFE6]'
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-semibold">{t.areaSplitTitle}</div>
                  <div className={`text-[10px] ${splitMethod === 'by_area' ? 'text-amber-100' : 'text-[#A89F91] dark:text-stone-500'}`}>
                    {t.areaSplitDesc}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1.5">
              {t.participantsLabel} ({selectedParticipants.length} {t.participantsCount})
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
                        ? 'bg-[#EFE8DC] dark:bg-stone-800 border-[#8B5E3C] dark:border-amber-500 font-semibold text-[#2C2218] dark:text-stone-100'
                        : 'bg-white dark:bg-stone-900 border-[#E8E1D5] dark:border-stone-800 text-[#A89F91] dark:text-stone-500 opacity-60'
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
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
              {t.notesOptionalLabel}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.notesOptionalPlaceholder}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#E8E1D5] dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E8E1D5] dark:border-stone-700 text-xs font-medium text-[#796B5B] dark:text-stone-300 hover:bg-[#FAF7F2] dark:hover:bg-stone-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              id="submit-expense-btn"
              className="px-5 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold shadow-xs"
            >
              {t.submitExpenseBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
