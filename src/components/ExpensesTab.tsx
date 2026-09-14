import React, { useState } from 'react';
import { Roommate, ExpenseRecord, ExpenseCategory } from '../types';
import { calculateNetDebts } from '../utils/debtCalculator';
import { Language, i18n, formatExpenseCategory } from '../utils/i18n';
import {
  Receipt,
  Plus,
  CheckCircle,
  Clock,
  Search,
  Share2,
  Trash2,
  Zap,
  Wifi,
  Package,
  Wrench,
  HelpCircle,
  Home,
  Check,
} from 'lucide-react';

interface ExpensesTabProps {
  roommates: Roommate[];
  expenses: ExpenseRecord[];
  currentUserId: string;
  lang: Language;
  onOpenAddExpense: () => void;
  onSettleSplit: (expenseId: string, roommateId: string) => void;
  onDeleteExpense: (expenseId: string) => void;
  onSettleAllBetween: (fromId: string, toId: string) => void;
}

const CATEGORY_ICONS: Record<
  ExpenseCategory,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  rent: { icon: Home, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  electricity: { icon: Zap, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  water_gas: { icon: Zap, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  internet: { icon: Wifi, color: 'bg-sky-50 text-sky-700 border-sky-200' },
  supplies: { icon: Package, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  maintenance: { icon: Wrench, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  other: { icon: HelpCircle, color: 'bg-stone-50 text-stone-700 border-stone-200' },
};

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  roommates,
  expenses,
  currentUserId,
  lang,
  onOpenAddExpense,
  onSettleSplit,
  onDeleteExpense,
  onSettleAllBetween,
}) => {
  const t = i18n[lang];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unsettled' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedTip, setCopiedTip] = useState(false);

  // Calculate Net Debts
  const { simplifiedDebts, totalUserOwes, totalOwedToUser } = calculateNetDebts(
    expenses,
    roommates
  );

  const myDebt = totalUserOwes(currentUserId);
  const myCredit = totalOwedToUser(currentUserId);

  // Filtered expenses
  const filteredExpenses = expenses.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStatus === 'unsettled' && item.isFullySettled) return false;
    if (selectedStatus === 'settled' && !item.isFullySettled) return false;
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.note?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Generate group copy summary
  const copyWeChatSummary = () => {
    let text = lang === 'en'
      ? `[Room 1802 Shared Expense Settlement Summary]\nDate: ${new Date().toLocaleDateString('en-US')}\n\nSmart Debt Clearing Transfers:\n`
      : `【望京嘉园1802室 · 合租生活账单结算汇总】\n📅 结算生成时间：${new Date().toLocaleDateString('zh-CN')}\n\n💡 最简还款结账方案（请核对并转账）：\n`;

    if (simplifiedDebts.length === 0) {
      text += lang === 'en'
        ? `All balances are fully settled! No pending payments. ✨\n`
        : `全屋账目已全部平账，暂无待付账单！✨\n`;
    } else {
      simplifiedDebts.forEach((debt) => {
        const from = roommates.find((r) => r.id === debt.fromId)?.name;
        const to = roommates.find((r) => r.id === debt.toId)?.name;
        text += lang === 'en'
          ? `👉 ${from} pays ${to}: ¥${debt.amount.toFixed(2)}\n`
          : `👉 ${from} 应转给 ${to}：¥${debt.amount.toFixed(2)}\n`;
      });
    }

    text += lang === 'en'
      ? `\nThank you roommates! Once transferred, please click "Mark Paid" in the app.`
      : `\n感谢各位室友支持，大家核对无误后请在管家系统中点击“标记已结清”~`;

    navigator.clipboard.writeText(text);
    setCopiedTip(true);
    setTimeout(() => setCopiedTip(false), 2500);
  };

  const categoriesList: ExpenseCategory[] = [
    'rent',
    'electricity',
    'water_gas',
    'internet',
    'supplies',
    'maintenance',
    'other',
  ];

  return (
    <div className="space-y-6">
      {/* Top summary card */}
      <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-stone-700">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#2C2218] dark:text-[#F5F5F4]">{t.sharedExpenseHub}</h2>
              <span className="text-xs bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 px-2 py-0.5 rounded-full border border-[#E8E1D5] dark:border-stone-700 font-medium">
                {t.sharedExpenseSub}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#796B5B] dark:text-stone-400 mt-1">
              {t.sharedExpenseDesc}
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              id="copy-summary-btn"
              onClick={copyWeChatSummary}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-200 text-xs sm:text-sm font-medium transition-colors"
            >
              {copiedTip ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{t.copiedWechatBill}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400" />
                  <span>{t.exportWechatBill}</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="new-expense-btn"
              onClick={onOpenAddExpense}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addExpenseButton}</span>
            </button>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl p-4 border border-[#E8E1D5] dark:border-stone-700">
            <span className="text-xs text-[#796B5B] dark:text-stone-400 font-medium">{t.myCurrentBalanceStatus}</span>
            <div className="mt-1 flex items-baseline space-x-2">
              {myDebt > 0 ? (
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {t.toPay} ¥{myDebt.toFixed(2)}
                </div>
              ) : myCredit > 0 ? (
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {t.toReceive} ¥{myCredit.toFixed(2)}
                </div>
              ) : (
                <div className="text-2xl font-bold text-[#2C2218] dark:text-stone-100">{t.allSettledZero}</div>
              )}
            </div>
            <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">
              {myDebt > 0 ? t.needToTransferRoommates : myCredit > 0 ? t.roommatesOweYou : t.noUnsettledDebts}
            </p>
          </div>

          <div className="bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl p-4 border border-[#E8E1D5] dark:border-stone-700">
            <span className="text-xs text-[#796B5B] dark:text-stone-400 font-medium">{t.totalUnsettledHouseDebt}</span>
            <div className="mt-1 text-2xl font-bold text-[#2C2218] dark:text-stone-100">
              ¥
              {simplifiedDebts.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">
              {simplifiedDebts.length} {t.totalDebtsRelation}
            </p>
          </div>

          <div className="bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl p-4 border border-[#E8E1D5] dark:border-stone-700">
            <span className="text-xs text-[#796B5B] dark:text-stone-400 font-medium">{t.recordedExpensesThisMonth}</span>
            <div className="mt-1 text-2xl font-bold text-[#2C2218] dark:text-stone-100">
              {expenses.length} <span className="text-xs font-normal text-[#796B5B] dark:text-stone-400">{t.recordsCount}</span>
            </div>
            <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">
              {t.totalSpentAmount} ¥{expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Simplified Settlement Matrix Section */}
      <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base flex items-center space-x-2">
              <span>{t.smartClearingTitle}</span>
              <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {t.smartAlgorithmOffset}
              </span>
            </h3>
            <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
              {t.smartAlgorithmDesc}
            </p>
          </div>
        </div>

        {simplifiedDebts.length === 0 ? (
          <div className="py-8 text-center bg-[#FAF7F2] dark:bg-stone-800/40 rounded-xl border border-dashed border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-400 text-sm">
            {t.noPendingDebtsCelebration}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {simplifiedDebts.map((debt, idx) => {
              const from = roommates.find((r) => r.id === debt.fromId);
              const to = roommates.find((r) => r.id === debt.toId);
              const isRelevantToMe = debt.fromId === currentUserId || debt.toId === currentUserId;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    isRelevantToMe
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-2xs'
                      : 'bg-[#FAF7F2] dark:bg-stone-800/60 border-[#E8E1D5] dark:border-stone-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center -space-x-2">
                      <img
                        src={from?.avatar}
                        alt={from?.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-stone-800"
                      />
                      <img
                        src={to?.avatar}
                        alt={to?.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-stone-800"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#2C2218] dark:text-stone-100">
                        <span>{from?.name}</span>
                        {debt.fromId === currentUserId && (
                          <span className="ml-1 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/40 px-1 rounded">{t.you}</span>
                        )}
                        <span className="text-[#A89F91] dark:text-stone-400 mx-1.5 font-normal">{t.shouldPayTo}</span>
                        <span>{to?.name}</span>
                        {debt.toId === currentUserId && (
                          <span className="ml-1 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/40 px-1 rounded">{t.you}</span>
                        )}
                      </div>
                      <div className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
                        {from?.roomName.split(' ')[0]} ➡️ {to?.roomName.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-base sm:text-lg font-bold text-[#8B5E3C] dark:text-amber-400">
                      ¥{debt.amount.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      id={`settle-between-${debt.fromId}-${debt.toId}`}
                      onClick={() => onSettleAllBetween(debt.fromId, debt.toId)}
                      className="px-3 py-1.5 rounded-lg bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      {t.markPaidButton}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bill List Filter & Controls */}
      <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base">{t.expenseDetailsList}</h3>

          {/* Search bar & filter tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchExpensePlaceholder}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 text-xs bg-[#FAF7F2] dark:bg-stone-800 text-[#2C2218] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#8B5E3C] w-44 sm:w-56"
              />
            </div>

            {/* Status toggle */}
            <div className="flex rounded-xl bg-[#FAF7F2] dark:bg-stone-800 p-0.5 text-xs font-medium text-[#796B5B] dark:text-stone-300 border border-[#E8E1D5] dark:border-stone-700">
              <button
                type="button"
                onClick={() => setSelectedStatus('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedStatus === 'all' ? 'bg-white dark:bg-stone-700 text-[#2C2218] dark:text-stone-100 shadow-2xs font-semibold' : ''
                }`}
              >
                {t.allStatus}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('unsettled')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedStatus === 'unsettled' ? 'bg-white dark:bg-stone-700 text-[#2C2218] dark:text-stone-100 shadow-2xs font-semibold' : ''
                }`}
              >
                {t.unsettledStatus}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('settled')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedStatus === 'settled' ? 'bg-white dark:bg-stone-700 text-[#2C2218] dark:text-stone-100 shadow-2xs font-semibold' : ''
                }`}
              >
                {t.settledStatus}
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-white dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#FAF7F2] dark:hover:bg-stone-700'
            }`}
          >
            {t.allCategories}
          </button>
          {categoriesList.map((catKey) => (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                selectedCategory === catKey
                  ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                  : 'bg-white dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#FAF7F2] dark:hover:bg-stone-700'
              }`}
            >
              {formatExpenseCategory(catKey, lang)}
            </button>
          ))}
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-stone-400 dark:text-stone-500 text-sm">
            {t.noExpensesFound}
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {filteredExpenses.map((expense) => {
              const payer = roommates.find((r) => r.id === expense.payerId);
              const categoryMeta = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.other;
              const CatIcon = categoryMeta.icon;
              const categoryLabel = formatExpenseCategory(expense.category, lang);

              return (
                <div
                  key={expense.id}
                  className="p-4 rounded-xl border border-[#E8E1D5] dark:border-stone-700 hover:border-[#D4C3A3] dark:hover:border-stone-600 transition-all bg-[#FAF7F2]/50 dark:bg-stone-800/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 shrink-0 text-[#8B5E3C] dark:text-amber-400">
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-[#2C2218] dark:text-stone-100 text-sm sm:text-base">
                            {expense.title}
                          </h4>
                          <span
                            className={`text-[11px] px-2 py-0.2 rounded-full border font-medium ${categoryMeta.color} dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300`}
                          >
                            {categoryLabel}
                          </span>
                          {expense.isFullySettled ? (
                            <span className="text-[11px] px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>{t.fullySettledBadge}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-medium flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{t.hasUnsettledBadge}</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-[#796B5B] dark:text-stone-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            {t.paidByPrefix} <strong className="text-[#2C2218] dark:text-stone-200">{payer?.name}</strong> {t.paidBySuffix}
                          </span>
                          <span>·</span>
                          <span>{t.expenseDate}{expense.date}</span>
                          <span>·</span>
                          <span>
                            {t.splitMethodLabel}
                            {expense.splitMethod === 'equal'
                              ? t.splitEqual4
                              : expense.splitMethod === 'by_area'
                              ? t.splitByArea
                              : t.splitCustom}
                          </span>
                        </div>

                        {expense.note && (
                          <p className="text-xs text-[#796B5B] dark:text-stone-300 bg-white/70 dark:bg-stone-800/80 p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 mt-2">
                            📝 {expense.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E1D5] dark:border-stone-700">
                      <div className="text-lg sm:text-xl font-bold text-[#8B5E3C] dark:text-amber-400">
                        ¥{expense.amount.toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(expense.id)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded-md transition-colors"
                        title={t.deleteExpenseTooltip}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Roommates split participant pills */}
                  <div className="mt-3 pt-3 border-t border-[#E8E1D5] dark:border-stone-700">
                    <div className="text-[11px] font-medium text-[#796B5B] dark:text-stone-400 mb-2">
                      {t.splitStatusPerRoommate}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {expense.splits.map((split) => {
                        const r = roommates.find((x) => x.id === split.roommateId);
                        const isPayer = split.roommateId === expense.payerId;

                        return (
                          <div
                            key={split.roommateId}
                            className={`flex items-center space-x-2 py-1 px-2.5 rounded-lg text-xs border ${
                              split.isPaid
                                ? 'bg-[#FAF7F2] dark:bg-stone-800 border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-300'
                                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                            }`}
                          >
                            <img
                              src={r?.avatar}
                              alt={r?.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span className="font-medium">
                              {r?.name}
                              {isPayer && ` (${t.payerTag})`}:
                            </span>
                            <span className="font-semibold">¥{split.amount.toFixed(2)}</span>

                            {split.isPaid ? (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                                <Check className="w-3 h-3 mr-0.5" /> {t.paid}
                              </span>
                            ) : (
                              <button
                                type="button"
                                id={`settle-split-${expense.id}-${split.roommateId}`}
                                onClick={() => onSettleSplit(expense.id, split.roommateId)}
                                className="text-[10px] bg-[#8B5E3C] hover:bg-[#724A2D] text-white px-1.5 py-0.5 rounded font-medium ml-1"
                              >
                                {t.markPaidButton}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
