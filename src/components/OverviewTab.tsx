import React from 'react';
import {
  Roommate,
  ExpenseRecord,
  CleaningDuty,
  SharedItem,
  HouseInfo,
  RuleProposal,
  GentleReminder,
} from '../types';
import { calculateNetDebts } from '../utils/debtCalculator';
import { Language, i18n, formatPublisherRole } from '../utils/i18n';
import {
  Sparkles,
  Receipt,
  AlertTriangle,
  Package,
  Megaphone,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  MessageSquareHeart,
  ChevronRight,
} from 'lucide-react';

interface OverviewTabProps {
  houseInfo: HouseInfo;
  roommates: Roommate[];
  currentUserId: string;
  expenses: ExpenseRecord[];
  duties: CleaningDuty[];
  supplies: SharedItem[];
  proposals: RuleProposal[];
  reminders: GentleReminder[];
  lang: Language;
  onNavigateTab: (tab: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddSupply: () => void;
  onOpenNewProposal: () => void;
  onOpenPostReminder: () => void;
  onToggleDutyItem: (dutyId: string, itemIdx: number) => void;
  onCompleteDuty: (dutyId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  houseInfo,
  roommates,
  currentUserId,
  expenses,
  duties,
  supplies,
  proposals,
  reminders,
  lang,
  onNavigateTab,
  onOpenAddExpense,
  onOpenAddSupply,
  onOpenNewProposal,
  onOpenPostReminder,
  onToggleDutyItem,
  onCompleteDuty,
}) => {
  const t = i18n[lang];

  // Calculate debts
  const { totalUserOwes, totalOwedToUser, simplifiedDebts } = calculateNetDebts(
    expenses,
    roommates
  );
  const myDebtToPay = totalUserOwes(currentUserId);
  const myCreditOwedToMe = totalOwedToUser(currentUserId);

  // Today's date YYYY-MM-DD
  const todayStr = '2026-09-12';
  const todayDuties = duties.filter((d) => d.date === todayStr);
  const myDutyToday = todayDuties.find((d) => d.assigneeId === currentUserId);

  // Urgent supplies
  const lowOrEmptySupplies = supplies.filter(
    (s) => s.stockLevel === 'empty' || s.stockLevel === 'low'
  );

  // Active voting proposals
  const activeProposals = proposals.filter((p) => p.status === 'voting');

  // Latest pinned reminder
  const latestReminder = reminders[0];

  return (
    <div className="space-y-6">
      {/* Top Banner: House Announcement */}
      {houseInfo.announcement.isPinned && (
        <div className="bg-[#8B5E3C] dark:bg-[#24201D] text-white dark:text-stone-100 rounded-2xl p-4 sm:p-5 shadow-sm border border-[#724A2D] dark:border-stone-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-white/15 dark:bg-stone-700 text-amber-200 dark:text-amber-300 mt-0.5 shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-amber-200 dark:text-amber-300 uppercase tracking-wider">
                    {t.pinnedAnnouncement}
                  </span>
                  <span className="text-xs text-[#E8DDCB] dark:text-stone-400">
                    · {formatPublisherRole(houseInfo.announcement.publishedBy, lang)}
                  </span>
                </div>
                {/* User-generated title and content are preserved as original */}
                <h3 className="text-sm sm:text-base font-semibold text-white dark:text-stone-100 mt-1">
                  {houseInfo.announcement.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#FAF7F2] dark:text-stone-300 mt-1 leading-relaxed">
                  {houseInfo.announcement.content}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('admin')}
              className="text-xs text-[#E8DDCB] hover:text-white dark:text-stone-400 dark:hover:text-white shrink-0 flex items-center space-x-1"
            >
              <span>{t.manageDetails}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Finances */}
        <div
          onClick={() => onNavigateTab('expenses')}
          className="bg-white dark:bg-[#292524] rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-700 shadow-xs hover:border-[#D4C3A3] dark:hover:border-stone-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#796B5B] dark:text-stone-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">
              {t.myBalance}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 flex items-center justify-center text-[#8B5E3C] dark:text-amber-400 group-hover:bg-[#8B5E3C] group-hover:text-white transition-colors">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            {myDebtToPay > 0 ? (
              <div>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  -¥{myDebtToPay.toFixed(1)}
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0" />
                  {t.iHavePendingDebt}
                </p>
              </div>
            ) : myCreditOwedToMe > 0 ? (
              <div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  +¥{myCreditOwedToMe.toFixed(1)}
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  {t.roommatesOweMe}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-[#2C2218] dark:text-stone-100">¥0.0</div>
                <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">{t.balanceAllClear}</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E1D5] dark:border-stone-700 flex items-center justify-between text-xs text-[#796B5B] dark:text-stone-400 group-hover:text-[#2C2218] dark:group-hover:text-stone-200">
            <span>{t.viewAAAndSettle}</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Today's Cleaning Duty */}
        <div
          onClick={() => onNavigateTab('cleaning')}
          className="bg-white dark:bg-[#292524] rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-700 shadow-xs hover:border-[#D4C3A3] dark:hover:border-stone-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#796B5B] dark:text-stone-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">
              {t.todayCleaningTitle}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 flex items-center justify-center text-[#8B5E3C] dark:text-amber-400 group-hover:bg-[#8B5E3C] group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            {myDutyToday ? (
              <div>
                <div className="text-base font-bold text-[#2C2218] dark:text-stone-100 flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#8B5E3C] text-white text-xs">
                    {t.todayYourTurn}
                  </span>
                  <span className="truncate">{myDutyToday.areaName}</span>
                </div>
                <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">
                  {myDutyToday.status === 'completed' ? t.dutyCompletedCheckin : t.dutyPendingCheckin}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-base font-bold text-[#2C2218] dark:text-stone-100">
                  {todayDuties[0]
                    ? `${roommates.find((r) => r.id === todayDuties[0].assigneeId)?.name || t.memberBadge} ${t.dutyAssignedTo}`
                    : t.noDutyToday}
                </div>
                <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">
                  {t.dutyResponsibleFor}{todayDuties.map((d) => d.areaName).join('、') || t.allRestDay}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E1D5] dark:border-stone-700 flex items-center justify-between text-xs text-[#796B5B] dark:text-stone-400 group-hover:text-[#2C2218] dark:group-hover:text-stone-200">
            <span>{t.dutyRosterAndSwap}</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Urgent Supplies */}
        <div
          onClick={() => onNavigateTab('supplies')}
          className="bg-white dark:bg-[#292524] rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-700 shadow-xs hover:border-[#D4C3A3] dark:hover:border-stone-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#796B5B] dark:text-stone-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">
              {t.suppliesStockTitle}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 flex items-center justify-center text-[#8B5E3C] dark:text-amber-400 group-hover:bg-[#8B5E3C] group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#2C2218] dark:text-stone-100">
              {lowOrEmptySupplies.length}{' '}
              <span className="text-xs font-normal text-[#796B5B] dark:text-stone-400">{t.itemsNeedRestock}</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1 truncate">
              {lowOrEmptySupplies.length > 0
                ? lowOrEmptySupplies.map((s) => s.name.split(' ')[0]).join('、')
                : t.suppliesAdequate}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E1D5] dark:border-stone-700 flex items-center justify-between text-xs text-[#796B5B] dark:text-stone-400 group-hover:text-[#2C2218] dark:group-hover:text-stone-200">
            <span>{t.registerAndSplit}</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: House Rules & Proposals */}
        <div
          onClick={() => onNavigateTab('pacts')}
          className="bg-white dark:bg-[#292524] rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-700 shadow-xs hover:border-[#D4C3A3] dark:hover:border-stone-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#796B5B] dark:text-stone-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">
              {t.pactsAndDiscussion}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 flex items-center justify-center text-[#8B5E3C] dark:text-amber-400 group-hover:bg-[#8B5E3C] group-hover:text-white transition-colors">
              <MessageSquareHeart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#2C2218] dark:text-stone-100">
              {activeProposals.length}{' '}
              <span className="text-xs font-normal text-[#796B5B] dark:text-stone-400">{t.proposalsVotingCount}</span>
            </div>
            <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1 truncate">
              {activeProposals.length > 0
                ? activeProposals[0].title
                : t.pactsConsensus}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E1D5] dark:border-stone-700 flex items-center justify-between text-xs text-[#796B5B] dark:text-stone-400 group-hover:text-[#2C2218] dark:group-hover:text-stone-200">
            <span>{t.viewPactsAndNotes}</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's Duty & Debt Settlement Quick View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Cleaning Duty Action Board */}
          <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#8B5E3C] dark:bg-amber-400" />
                <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base">{t.todayDutyCheckinTitle}</h3>
                <span className="text-xs text-[#796B5B] dark:text-stone-400 font-normal">
                  {t.todayDateHeader}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('cleaning')}
                className="text-xs text-[#8B5E3C] dark:text-amber-400 hover:underline font-medium flex items-center space-x-1"
              >
                <span>{t.fullRoster}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {todayDuties.map((duty) => {
                const assignee = roommates.find((r) => r.id === duty.assigneeId);
                const isMe = duty.assigneeId === currentUserId;
                const completedItems = duty.checklist.filter((c) => c.done).length;
                const totalItems = duty.checklist.length;

                return (
                  <div
                    key={duty.id}
                    className={`rounded-xl p-4 border transition-all ${
                      duty.status === 'completed'
                        ? 'bg-[#FAF7F2] dark:bg-stone-800/40 border-[#E8E1D5] dark:border-stone-700'
                        : isMe
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                        : 'bg-white dark:bg-[#292524] border-[#E8E1D5] dark:border-stone-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={assignee?.avatar}
                          alt={assignee?.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-[#D4C3A3] dark:ring-stone-600"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-[#2C2218] dark:text-stone-100 text-sm">
                              {duty.areaName}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border border-[#E8E1D5] dark:border-stone-700">
                              {t.dutyPerson}{assignee?.name} {isMe && `(${t.you})`}
                            </span>
                          </div>
                          <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
                            {t.completionRate}{completedItems}/{totalItems} {t.items}
                          </p>
                        </div>
                      </div>

                      {duty.status === 'completed' ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.checkedIn} ({duty.completedAt?.split(' ')[1] || t.morning})</span>
                        </span>
                      ) : isMe ? (
                        <button
                          type="button"
                          id={`complete-duty-${duty.id}`}
                          onClick={() => onCompleteDuty(duty.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold shadow-xs"
                        >
                          {t.markAllCompleted}
                        </button>
                      ) : (
                        <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                          {t.waitingForAssignee}
                        </span>
                      )}
                    </div>

                    {/* Check items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#E8E1D5] dark:border-stone-700">
                      {duty.checklist.map((item, idx) => (
                        <label
                          key={idx}
                          className="flex items-center space-x-2 text-xs text-[#2C2218] dark:text-stone-300 hover:text-[#8B5E3C] dark:hover:text-amber-400 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => onToggleDutyItem(duty.id, idx)}
                            className="rounded border-[#D4C3A3] text-[#8B5E3C] focus:ring-[#8B5E3C] w-4 h-4 cursor-pointer"
                          />
                          <span className={item.done ? 'line-through text-stone-400 dark:text-stone-500' : ''}>
                            {item.item}
                          </span>
                        </label>
                      ))}
                    </div>

                    {duty.completedNotes && (
                      <div className="mt-3 text-xs text-[#796B5B] dark:text-stone-300 bg-[#FAF7F2] dark:bg-stone-800/70 p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700">
                        {t.notePrefix}{duty.completedNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Debt Settlement Matrix / 最简还款台 */}
          <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base">
                  {t.clearingTableTitle}
                </h3>
                <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
                  {t.clearingTableDesc}
                </p>
              </div>
              <button
                type="button"
                id="add-expense-btn"
                onClick={onOpenAddExpense}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.addExpenseAA}</span>
              </button>
            </div>

            {simplifiedDebts.length === 0 ? (
              <div className="text-center py-8 text-stone-400 dark:text-stone-500 text-sm">
                {t.allExpensesCleared}
              </div>
            ) : (
              <div className="space-y-2.5">
                {simplifiedDebts.map((debt, index) => {
                  const fromUser = roommates.find((r) => r.id === debt.fromId);
                  const toUser = roommates.find((r) => r.id === debt.toId);

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        debt.fromId === currentUserId
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                          : 'bg-[#FAF7F2] dark:bg-stone-800/60 border-[#E8E1D5] dark:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center -space-x-2">
                          <img
                            src={fromUser?.avatar}
                            alt={fromUser?.name}
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-stone-800"
                          />
                          <img
                            src={toUser?.avatar}
                            alt={toUser?.name}
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-stone-800"
                          />
                        </div>
                        <div className="text-xs sm:text-sm">
                          <span className="font-semibold text-[#2C2218] dark:text-stone-100">
                            {fromUser?.name} {debt.fromId === currentUserId && `(${t.you})`}
                          </span>
                          <span className="text-[#A89F91] dark:text-stone-400 mx-1.5">{t.shouldPayTo}</span>
                          <span className="font-semibold text-[#2C2218] dark:text-stone-100">
                            {toUser?.name} {debt.toId === currentUserId && `(${t.you})`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-sm sm:text-base font-bold text-[#8B5E3C] dark:text-amber-400">
                          ¥{debt.amount.toFixed(1)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigateTab('expenses')}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-stone-800 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-200"
                        >
                          {t.settlementDetails}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Quick Actions, Urgent Supplies & Friendly Post-its */}
        <div className="space-y-6">
          {/* Quick Action Shortcuts */}
          <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
            <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-sm mb-3">{t.quickActionTitle}</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onOpenAddExpense}
                className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/70 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 text-left transition-colors group"
              >
                <Receipt className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-semibold text-[#2C2218] dark:text-stone-100">{t.recordSharedExpense}</div>
                <div className="text-[11px] text-[#796B5B] dark:text-stone-400">{t.expenseHint}</div>
              </button>

              <button
                type="button"
                onClick={onOpenAddSupply}
                className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/70 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 text-left transition-colors group"
              >
                <Package className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-semibold text-[#2C2218] dark:text-stone-100">{t.recordSupplyRestock}</div>
                <div className="text-[11px] text-[#796B5B] dark:text-stone-400">{t.supplyHint}</div>
              </button>

              <button
                type="button"
                onClick={onOpenNewProposal}
                className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/70 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 text-left transition-colors group"
              >
                <Sparkles className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-semibold text-[#2C2218] dark:text-stone-100">{t.proposeNewRule}</div>
                <div className="text-[11px] text-[#796B5B] dark:text-stone-400">{t.ruleHint}</div>
              </button>

              <button
                type="button"
                onClick={onOpenPostReminder}
                className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/70 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 text-left transition-colors group"
              >
                <MessageSquareHeart className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-semibold text-[#2C2218] dark:text-stone-100">{t.postGentleNote}</div>
                <div className="text-[11px] text-[#796B5B] dark:text-stone-400">{t.noteHint}</div>
              </button>
            </div>
          </div>

          {/* Urgent Supplies List */}
          <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-sm flex items-center space-x-1.5">
                <span>{t.suppliesWarningTitle}</span>
                <span className="text-[11px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-300/40">
                  {lowOrEmptySupplies.length} {t.urgentCount}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('supplies')}
                className="text-xs text-[#8B5E3C] dark:text-amber-400 hover:underline"
              >
                {t.allSupplies}
              </button>
            </div>

            <div className="space-y-2.5">
              {lowOrEmptySupplies.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-800/50 flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.stockLevel === 'empty' ? 'bg-red-500' : 'bg-amber-500'
                        }`}
                      />
                      <span className="text-xs font-semibold text-[#2C2218] dark:text-stone-100">
                        {item.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#796B5B] dark:text-stone-400 mt-1">
                      {item.quantityDescription}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('supplies')}
                    className="text-[11px] px-2 py-1 bg-white dark:bg-stone-800 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 rounded-md border border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-200 shrink-0"
                  >
                    {t.goRestock}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gentle Post-it Note Highlight */}
          {latestReminder && (
            <div className="bg-amber-50/70 dark:bg-[#2F2922] rounded-2xl p-4 border border-amber-200/80 dark:border-amber-900/50 shadow-xs">
              <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 mb-2">
                <span className="font-semibold flex items-center space-x-1">
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                  <span>{t.gentleNoteTitle}</span>
                </span>
                <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                  {latestReminder.isAnonymous ? t.anonymousAuthor : t.realnameAuthor}
                </span>
              </div>
              <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed italic">
                “{latestReminder.message}”
              </p>
              <div className="mt-3 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-[11px] text-[#796B5B] dark:text-stone-400">
                <span>{latestReminder.createdAt}</span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('pacts')}
                  className="text-amber-800 dark:text-amber-400 hover:underline font-medium"
                >
                  {t.goNoteWall}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
