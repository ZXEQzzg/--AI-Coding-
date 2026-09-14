import React, { useState } from 'react';
import { Roommate, ExpenseRecord, ExpenseCategory } from '../types';
import { calculateNetDebts } from '../utils/debtCalculator';
import {
  Receipt,
  Plus,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Share2,
  Trash2,
  DollarSign,
  ArrowRight,
  Sparkles,
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
  onOpenAddExpense: () => void;
  onSettleSplit: (expenseId: string, roommateId: string) => void;
  onDeleteExpense: (expenseId: string) => void;
  onSettleAllBetween: (fromId: string, toId: string) => void;
}

const CATEGORY_MAP: Record<
  ExpenseCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  rent: { label: '房屋租金', icon: Home, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  electricity: { label: '公区电费', icon: Zap, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  water_gas: { label: '水费燃气', icon: Zap, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  internet: { label: '合租宽带', icon: Wifi, color: 'bg-sky-50 text-sky-700 border-sky-200' },
  supplies: { label: '公共物资', icon: Package, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  maintenance: { label: '维修五金', icon: Wrench, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  other: { label: '其他支出', icon: HelpCircle, color: 'bg-stone-50 text-stone-700 border-stone-200' },
};

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  roommates,
  expenses,
  currentUserId,
  onOpenAddExpense,
  onSettleSplit,
  onDeleteExpense,
  onSettleAllBetween,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unsettled' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedTip, setCopiedTip] = useState(false);

  const currentUser = roommates.find((r) => r.id === currentUserId) || roommates[0];

  // Calculate Net Debts
  const { balances, simplifiedDebts, totalUserOwes, totalOwedToUser } = calculateNetDebts(
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

  // Generate WeChat group copy summary
  const copyWeChatSummary = () => {
    let text = `【望京嘉园1802室 · 合租生活账单结算汇总】\n`;
    text += `📅 结算生成时间：${new Date().toLocaleDateString('zh-CN')}\n\n`;
    text += `💡 最简还款结账方案（请核对并转账）：\n`;
    if (simplifiedDebts.length === 0) {
      text += `全屋账目已全部平账，暂无待付账单！✨\n`;
    } else {
      simplifiedDebts.forEach((debt) => {
        const from = roommates.find((r) => r.id === debt.fromId)?.name;
        const to = roommates.find((r) => r.id === debt.toId)?.name;
        text += `👉 ${from} 应转给 ${to}：¥${debt.amount.toFixed(2)}\n`;
      });
    }
    text += `\n感谢各位室友支持，大家核对无误后请在管家系统中点击“标记已结清”~`;

    navigator.clipboard.writeText(text);
    setCopiedTip(true);
    setTimeout(() => setCopiedTip(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top summary card */}
      <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-stone-700">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#2C2218] dark:text-[#F5F5F4]">公共费用 AA 分摊中心</h2>
              <span className="text-xs bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 px-2 py-0.5 rounded-full border border-[#E8E1D5] dark:border-stone-700 font-medium">
                透明记账 · 极简平账
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#796B5B] dark:text-stone-400 mt-1">
              房租、水电燃气、宽带、保洁物资自动计算分摊，告别算账尴尬
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              id="copy-summary-btn"
              onClick={copyWeChatSummary}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-200 text-xs sm:text-sm font-medium transition-colors"
              title="复制结构化对账文本，方便粘贴至室友微信群"
            >
              {copiedTip ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">已复制对账文本！</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400" />
                  <span>群对账文本导出</span>
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
              <span>记一笔支出</span>
            </button>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl p-4 border border-[#E8E1D5] dark:border-stone-700">
            <span className="text-xs text-[#796B5B] dark:text-stone-400 font-medium">我的当前结余状态</span>
            <div className="mt-1 flex items-baseline space-x-2">
              {myDebt > 0 ? (
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  待支付 ¥{myDebt.toFixed(2)}
                </div>
              ) : myCredit > 0 ? (
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  待收款 ¥{myCredit.toFixed(2)}
                </div>
              ) : (
                <div className="text-2xl font-bold text-[#2C2218] dark:text-stone-100">已全额结清 ¥0.0</div>
              )}
            </div>
            <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">
              {myDebt > 0 ? '需转给对应垫付的室友' : myCredit > 0 ? '室友尚有分摊款待付给你' : '无未结清欠款'}
            </p>
          </div>

          <div className="bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl p-4 border border-[#E8E1D5] dark:border-stone-700">
            <span className="text-xs text-[#796B5B] dark:text-stone-400 font-medium">全屋未结清总款项</span>
            <div className="mt-1 text-2xl font-bold text-[#2C2218] dark:text-stone-100">
              ¥
              {simplifiedDebts.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">
              共 {simplifiedDebts.length} 笔室友间待结清关系
            </p>
          </div>

          <div className="bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl p-4 border border-[#E8E1D5] dark:border-stone-700">
            <span className="text-xs text-[#796B5B] dark:text-stone-400 font-medium">本月已录入开销单数</span>
            <div className="mt-1 text-2xl font-bold text-[#2C2218] dark:text-stone-100">
              {expenses.length} <span className="text-xs font-normal text-[#796B5B] dark:text-stone-400">笔记录</span>
            </div>
            <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">
              总支出额 ¥{expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Simplified Settlement Matrix Section */}
      <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base flex items-center space-x-2">
              <span>室友最简还款清算台</span>
              <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                算法智能冲抵
              </span>
            </h3>
            <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
              自动抵消相互垫付的差额，点击“一键标记还清”即可同步扣销关联账单
            </p>
          </div>
        </div>

        {simplifiedDebts.length === 0 ? (
          <div className="py-8 text-center bg-[#FAF7F2] dark:bg-stone-800/40 rounded-xl border border-dashed border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-400 text-sm">
            ✨ 当前全屋账目清晰，没有任何未结清欠款！
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
                          <span className="ml-1 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/40 px-1 rounded">你</span>
                        )}
                        <span className="text-[#A89F91] dark:text-stone-400 mx-1.5 font-normal">应转付</span>
                        <span>{to?.name}</span>
                        {debt.toId === currentUserId && (
                          <span className="ml-1 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/40 px-1 rounded">你</span>
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
                      title="标记双方结账转账已完成"
                    >
                      标记已结清
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
          <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base">明细账单列表</h3>

          {/* Search bar & filter tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索账单名称或备注..."
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
                全部
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('unsettled')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedStatus === 'unsettled' ? 'bg-white dark:bg-stone-700 text-[#2C2218] dark:text-stone-100 shadow-2xs font-semibold' : ''
                }`}
              >
                待结清
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('settled')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedStatus === 'settled' ? 'bg-white dark:bg-stone-700 text-[#2C2218] dark:text-stone-100 shadow-2xs font-semibold' : ''
                }`}
              >
                已结平
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
            全部类型
          </button>
          {Object.entries(CATEGORY_MAP).map(([catKey, catMeta]) => (
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
              {catMeta.label}
            </button>
          ))}
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-stone-400 dark:text-stone-500 text-sm">
            没有找到符合条件的开支记录
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {filteredExpenses.map((expense) => {
              const payer = roommates.find((r) => r.id === expense.payerId);
              const categoryMeta = CATEGORY_MAP[expense.category] || CATEGORY_MAP.other;
              const CatIcon = categoryMeta.icon;

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
                            {categoryMeta.label}
                          </span>
                          {expense.isFullySettled ? (
                            <span className="text-[11px] px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>已全平</span>
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-medium flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>有待结</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-[#796B5B] dark:text-stone-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            由 <strong className="text-[#2C2218] dark:text-stone-200">{payer?.name}</strong> 垫付
                          </span>
                          <span>·</span>
                          <span>消费日期：{expense.date}</span>
                          <span>·</span>
                          <span>
                            分摊方式：
                            {expense.splitMethod === 'equal'
                              ? '4人均摊'
                              : expense.splitMethod === 'by_area'
                              ? '按房间面积分摊'
                              : '指定成员分摊'}
                          </span>
                        </div>

                        {expense.note && (
                          <p className="text-xs text-[#796B5B] dark:text-stone-300 bg-white/70 dark:bg-stone-800/80 p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 mt-2">
                            📝 备注：{expense.note}
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
                        title="删除该笔账单"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Roommates split participant pills */}
                  <div className="mt-3 pt-3 border-t border-[#E8E1D5] dark:border-stone-700">
                    <div className="text-[11px] font-medium text-[#796B5B] dark:text-stone-400 mb-2">
                      各室友分摊状态（点击未付按钮可直接标记已结清）：
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
                              {isPayer && ' (垫付者)'}:
                            </span>
                            <span className="font-semibold">¥{split.amount.toFixed(2)}</span>

                            {split.isPaid ? (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                                <Check className="w-3 h-3 mr-0.5" /> 已付
                              </span>
                            ) : (
                              <button
                                type="button"
                                id={`settle-split-${expense.id}-${split.roommateId}`}
                                onClick={() => onSettleSplit(expense.id, split.roommateId)}
                                className="text-[10px] bg-[#8B5E3C] hover:bg-[#724A2D] text-white px-1.5 py-0.5 rounded font-medium ml-1"
                              >
                                标记付清
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
