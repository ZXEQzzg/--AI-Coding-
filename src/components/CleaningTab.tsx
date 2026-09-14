import React, { useState } from 'react';
import { Roommate, CleaningDuty } from '../types';
import { Language, i18n } from '../utils/i18n';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Award,
  Check,
  X,
} from 'lucide-react';

interface CleaningTabProps {
  roommates: Roommate[];
  duties: CleaningDuty[];
  currentUserId: string;
  lang: Language;
  onToggleDutyItem: (dutyId: string, itemIdx: number) => void;
  onCompleteDuty: (dutyId: string, notes?: string) => void;
  onRequestSwap: (dutyId: string) => void;
  onRespondSwap: (dutyId: string, accept: boolean) => void;
  onGenerateWeeklyRoster: () => void;
}

export const CleaningTab: React.FC<CleaningTabProps> = ({
  roommates,
  duties,
  currentUserId,
  lang,
  onToggleDutyItem,
  onCompleteDuty,
  onRequestSwap,
  onRespondSwap,
  onGenerateWeeklyRoster,
}) => {
  const t = i18n[lang];
  const [selectedDutyForNotes, setSelectedDutyForNotes] = useState<string | null>(null);
  const [dutyNotesText, setDutyNotesText] = useState<string>('');

  const todayStr = '2026-09-12';
  const todayDuties = duties.filter((d) => d.date === todayStr);

  const formatAreaName = (area: string) => {
    if (lang === 'zh') return area;
    const map: Record<string, string> = {
      '厨房与餐厅': 'Kitchen & Dining',
      '公共卫生间': 'Shared Bathroom',
      '客厅与玄关': 'Living Room & Entryway',
      '生活阳台与垃圾角': 'Balcony & Waste Corner',
      '厨房': 'Kitchen',
      '公卫': 'Bathroom',
      '客厅': 'Living Room',
      '阳台': 'Balcony',
    };
    return map[area] || area;
  };

  const formatDayOfWeek = (day: string) => {
    if (lang === 'zh') return day;
    const map: Record<string, string> = {
      '周一': 'Mon',
      '周二': 'Tue',
      '周三': 'Wed',
      '周四': 'Thu',
      '周五': 'Fri',
      '周六': 'Sat',
      '周日': 'Sun',
    };
    return map[day] || day;
  };

  // Calculate clean scores for roommates
  const stats = roommates.map((r) => {
    const assigned = duties.filter((d) => d.assigneeId === r.id);
    const completed = assigned.filter((d) => d.status === 'completed');
    const rate = assigned.length > 0 ? Math.round((completed.length / assigned.length) * 100) : 100;
    return {
      roommate: r,
      total: assigned.length,
      completed: completed.length,
      rate,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Strategy */}
      <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E1D5] dark:border-stone-700">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#2C2218] dark:text-[#F5F5F4]">{t.cleaningTabMainTitle}</h2>
              <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
                {t.fairRotationBadge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#796B5B] dark:text-stone-400 mt-1">
              {t.cleaningTabSubtitle}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="generate-roster-btn"
              onClick={onGenerateWeeklyRoster}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-200 text-xs sm:text-sm font-medium transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400" />
              <span>{t.rotateNextWeek}</span>
            </button>
          </div>
        </div>

        {/* Cleanliness Honor / Scoreboard */}
        <div className="pt-4">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#796B5B] dark:text-stone-300 mb-3">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{t.cleaningHonorTitle}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(({ roommate, completed, rate }) => (
              <div
                key={roommate.id}
                className="bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl p-3 border border-[#E8E1D5] dark:border-stone-700 flex items-center space-x-3"
              >
                <img
                  src={roommate.avatar}
                  alt={roommate.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-[#D4C3A3] dark:ring-stone-600"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2C2218] dark:text-stone-100 flex items-center space-x-1">
                    <span>{roommate.name}</span>
                    {roommate.id === currentUserId && (
                      <span className="text-[10px] text-[#796B5B] dark:text-stone-400 font-normal">({t.you})</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#796B5B] dark:text-stone-400">
                    {t.checkinRate} <strong className="text-emerald-700 dark:text-emerald-400">{rate}%</strong> ({completed} {t.times})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Swap Requests Alert (if any) */}
      {duties.some((d) => d.swapRequest && d.swapRequest.status === 'pending') && (
        <div className="space-y-2">
          {duties
            .filter((d) => d.swapRequest && d.swapRequest.status === 'pending')
            .map((duty) => {
              const req = duty.swapRequest!;
              const from = roommates.find((r) => r.id === req.fromId);
              const to = roommates.find((r) => r.id === req.toId);
              const isTargetMe = req.toId === currentUserId;

              return (
                <div
                  key={duty.id}
                  className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-xl mt-0.5">
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                          {t.swapDutyAlert}
                        </span>
                        <span className="text-xs text-amber-700 dark:text-amber-400">
                          {from?.name} ➡️ {t.requestSwapWith} {to?.name} {t.swapAction}
                        </span>
                      </div>
                      <p className="text-xs text-[#2C2218] dark:text-stone-200 mt-1">
                        {t.originalDuty}<strong>{duty.date} ({formatDayOfWeek(duty.dayOfWeek)}) · {formatAreaName(duty.areaName)}</strong>
                      </p>
                      <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
                        {t.swapReason}“{req.reason}”
                      </p>
                    </div>
                  </div>

                  {isTargetMe ? (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        id={`accept-swap-${duty.id}`}
                        onClick={() => onRespondSwap(duty.id, true)}
                        className="px-3 py-1.5 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.agreeSwap}</span>
                      </button>
                      <button
                        type="button"
                        id={`decline-swap-${duty.id}`}
                        onClick={() => onRespondSwap(duty.id, false)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-300 text-xs font-medium hover:bg-[#FAF7F2] dark:hover:bg-stone-700 flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{t.declineSwap}</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/40 px-2.5 py-1 rounded-full shrink-0">
                      {lang === 'en' ? `Waiting for ${to?.name} to confirm` : `等待 ${to?.name} 确认中`}
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Today's Duties Focus */}
      <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5E3C] dark:bg-amber-400" />
            <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base">
              {t.todayCleaningExecution} ({todayStr} {lang === 'en' ? 'Sat' : '周六'})
            </h3>
          </div>
          <span className="text-xs text-[#796B5B] dark:text-stone-400">
            {todayDuties.filter((d) => d.status === 'completed').length} / {todayDuties.length} {t.itemsCheckedIn}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayDuties.map((duty) => {
            const assignee = roommates.find((r) => r.id === duty.assigneeId);
            const isMe = duty.assigneeId === currentUserId;
            const completedCount = duty.checklist.filter((c) => c.done).length;

            return (
              <div
                key={duty.id}
                className={`p-5 rounded-xl border transition-all ${
                  duty.status === 'completed'
                    ? 'bg-[#FAF7F2]/60 dark:bg-stone-800/40 border-[#E8E1D5] dark:border-stone-700'
                    : isMe
                    ? 'bg-[#FAF7F2] dark:bg-stone-800/80 border-[#8B5E3C]/40 dark:border-amber-700/60'
                    : 'bg-white dark:bg-stone-800/50 border-[#E8E1D5] dark:border-stone-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={assignee?.avatar}
                      alt={assignee?.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E8E1D5] dark:ring-stone-700"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#2C2218] dark:text-stone-100 text-sm">
                          {formatAreaName(duty.areaName)}
                        </span>
                        {isMe && (
                          <span className="text-[11px] bg-[#8B5E3C] text-white px-2 py-0.2 rounded-full font-medium">
                            {t.youOnDuty}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
                        {t.dutyPersonLabel}{assignee?.name} ({assignee?.roomName.split(' ')[0]})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {duty.status === 'completed' ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.checkinDoneBadge}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRequestSwap(duty.id)}
                        className="p-1.5 text-[#796B5B] dark:text-stone-400 hover:text-[#2C2218] dark:hover:text-stone-200 hover:bg-[#FAF7F2] dark:hover:bg-stone-700 rounded-lg text-xs flex items-center space-x-1"
                        title={t.swapTooltip}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span className="text-[11px]">{t.applySwapButton}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Checklist items */}
                <div className="space-y-2 pt-2 border-t border-[#E8E1D5] dark:border-stone-700">
                  <div className="text-[11px] font-medium text-[#796B5B] dark:text-stone-400">
                    {t.cleaningChecklistSub}（{completedCount}/{duty.checklist.length}）：
                  </div>
                  {duty.checklist.map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start space-x-2.5 text-xs text-[#2C2218] dark:text-stone-200 hover:text-[#8B5E3C] cursor-pointer select-none py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => onToggleDutyItem(duty.id, idx)}
                        className="mt-0.5 rounded border-[#D4C3A3] dark:border-stone-600 text-[#8B5E3C] focus:ring-[#8B5E3C] w-4 h-4 cursor-pointer"
                      />
                      <span className={item.done ? 'line-through text-[#A89F91] dark:text-stone-500' : ''}>
                        {item.item}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Action button */}
                {duty.status !== 'completed' && (
                  <div className="mt-4 pt-3 border-t border-[#E8E1D5] dark:border-stone-700 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDutyForNotes(
                          selectedDutyForNotes === duty.id ? null : duty.id
                        );
                      }}
                      className="text-xs text-[#796B5B] dark:text-stone-400 hover:text-[#2C2218] dark:hover:text-stone-200 underline"
                    >
                      {selectedDutyForNotes === duty.id ? t.cancelNote : t.addCleaningNote}
                    </button>

                    <button
                      type="button"
                      id={`btn-complete-${duty.id}`}
                      onClick={() => {
                        onCompleteDuty(duty.id, dutyNotesText);
                        setSelectedDutyForNotes(null);
                        setDutyNotesText('');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold shadow-xs"
                    >
                      {t.confirmDoneCheckin}
                    </button>
                  </div>
                )}

                {/* Note input field if toggled */}
                {selectedDutyForNotes === duty.id && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={dutyNotesText}
                      onChange={(e) => setDutyNotesText(e.target.value)}
                      placeholder={t.notePlaceholder}
                      className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#8B5E3C]"
                    />
                  </div>
                )}

                {duty.completedNotes && (
                  <div className="mt-3 text-xs text-[#796B5B] dark:text-stone-300 bg-[#FAF7F2] dark:bg-stone-800/80 p-2.5 rounded-lg border border-[#E8E1D5] dark:border-stone-700">
                    {t.checkinPostscript}{duty.completedNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming & History Roster Table */}
      <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
        <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base mb-4">
          {t.rosterScheduleTitle}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-400 font-medium">
                <th className="py-2.5 px-3">{t.dateAndWeekday}</th>
                <th className="py-2.5 px-3">{t.areaCol}</th>
                <th className="py-2.5 px-3">{t.assigneeCol}</th>
                <th className="py-2.5 px-3">{t.statusCol}</th>
                <th className="py-2.5 px-3 text-right">{t.actionCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D5]/60 dark:divide-stone-700">
              {duties.map((duty) => {
                const assignee = roommates.find((r) => r.id === duty.assigneeId);
                const isToday = duty.date === todayStr;

                return (
                  <tr
                    key={duty.id}
                    className={`hover:bg-[#FAF7F2]/80 dark:hover:bg-stone-800/60 transition-colors ${
                      isToday ? 'bg-amber-50/40 dark:bg-amber-950/20 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[#2C2218] dark:text-stone-100 font-semibold">{duty.date}</span>
                        <span className="text-[#796B5B] dark:text-stone-400">({formatDayOfWeek(duty.dayOfWeek)})</span>
                        {isToday && (
                          <span className="bg-[#8B5E3C] text-white text-[10px] px-1.5 py-0.2 rounded font-medium">
                            {t.todayBadge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#2C2218] dark:text-stone-200">{formatAreaName(duty.areaName)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <img
                          src={assignee?.avatar}
                          alt={assignee?.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-[#2C2218] dark:text-stone-200">{assignee?.name}</span>
                        {duty.assigneeId === currentUserId && (
                          <span className="text-[10px] text-[#796B5B] dark:text-stone-400 bg-[#FAF7F2] dark:bg-stone-800 px-1 rounded border border-[#E8E1D5] dark:border-stone-700">
                            {t.you}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {duty.status === 'completed' ? (
                        <span className="inline-flex items-center text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> {t.doneBadge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[#796B5B] dark:text-stone-400 bg-[#FAF7F2] dark:bg-stone-800 px-2 py-0.5 rounded-full text-[11px] border border-[#E8E1D5] dark:border-stone-700">
                          <Clock className="w-3 h-3 mr-1 text-[#A89F91] dark:text-stone-500" /> {t.pendingDutyBadge}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {duty.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => onRequestSwap(duty.id)}
                          className="text-[#8B5E3C] dark:text-amber-400 hover:text-[#724A2D] dark:hover:text-amber-300 font-medium text-xs hover:underline"
                        >
                          {t.applySwapButton}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
