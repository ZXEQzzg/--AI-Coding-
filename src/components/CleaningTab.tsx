import React, { useState } from 'react';
import { Roommate, CleaningDuty } from '../types';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Flame,
  Award,
  Plus,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface CleaningTabProps {
  roommates: Roommate[];
  duties: CleaningDuty[];
  currentUserId: string;
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
  onToggleDutyItem,
  onCompleteDuty,
  onRequestSwap,
  onRespondSwap,
  onGenerateWeeklyRoster,
}) => {
  const [selectedDutyForNotes, setSelectedDutyForNotes] = useState<string | null>(null);
  const [dutyNotesText, setDutyNotesText] = useState<string>('');

  const todayStr = '2026-09-12';
  const currentUser = roommates.find((r) => r.id === currentUserId) || roommates[0];

  // Group duties by date / upcoming
  const todayDuties = duties.filter((d) => d.date === todayStr);
  const upcomingDuties = duties.filter((d) => d.date > todayStr);
  const pastDuties = duties.filter((d) => d.date < todayStr);

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
              <h2 className="text-xl font-bold text-[#2C2218] dark:text-[#F5F5F4]">公共区域清洁轮值排班</h2>
              <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
                公平轮换 · 责任到人
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#796B5B] dark:text-stone-400 mt-1">
              每周公区深度保洁自动按室友轮替，支持临时有事无感换班
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
              <span>轮转下周排班</span>
            </button>
          </div>
        </div>

        {/* Cleanliness Honor / Scoreboard */}
        <div className="pt-4">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#796B5B] dark:text-stone-300 mb-3">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>合租卫生恪守与打卡荣誉榜</span>
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
                      <span className="text-[10px] text-[#796B5B] dark:text-stone-400 font-normal">(你)</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#796B5B] dark:text-stone-400">
                    打卡率 <strong className="text-emerald-700 dark:text-emerald-400">{rate}%</strong> ({completed}次)
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
                          值日换班申请
                        </span>
                        <span className="text-xs text-amber-700 dark:text-amber-400">
                          {from?.name} ➡️ 请求与 {to?.name} 对调
                        </span>
                      </div>
                      <p className="text-xs text-[#2C2218] dark:text-stone-200 mt-1">
                        原值日：<strong>{duty.date} ({duty.dayOfWeek}) · {duty.areaName}</strong>
                      </p>
                      <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
                        换班原因：“{req.reason}”
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
                        <span>同意对调</span>
                      </button>
                      <button
                        type="button"
                        id={`decline-swap-${duty.id}`}
                        onClick={() => onRespondSwap(duty.id, false)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-300 text-xs font-medium hover:bg-[#FAF7F2] dark:hover:bg-stone-700 flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>婉拒</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/40 px-2.5 py-1 rounded-full shrink-0">
                      等待 {to?.name} 确认中
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
              今日保洁执行 ({todayStr} 周六)
            </h3>
          </div>
          <span className="text-xs text-[#796B5B] dark:text-stone-400">
            {todayDuties.filter((d) => d.status === 'completed').length} / {todayDuties.length} 项已打卡
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
                          {duty.areaName}
                        </span>
                        {isMe && (
                          <span className="text-[11px] bg-[#8B5E3C] text-white px-2 py-0.2 rounded-full font-medium">
                            你值班
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
                        值日人：{assignee?.name} ({assignee?.roomName.split(' ')[0]})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {duty.status === 'completed' ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>已完成打卡</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRequestSwap(duty.id)}
                        className="p-1.5 text-[#796B5B] dark:text-stone-400 hover:text-[#2C2218] dark:hover:text-stone-200 hover:bg-[#FAF7F2] dark:hover:bg-stone-700 rounded-lg text-xs flex items-center space-x-1"
                        title="临时有事，申请与室友对调"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span className="text-[11px]">申请换班</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Checklist items */}
                <div className="space-y-2 pt-2 border-t border-[#E8E1D5] dark:border-stone-700">
                  <div className="text-[11px] font-medium text-[#796B5B] dark:text-stone-400">
                    保洁打卡细项（{completedCount}/{duty.checklist.length}）：
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
                      {selectedDutyForNotes === duty.id ? '取消备注' : '+ 添加保洁备注说明'}
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
                      确认已搞定打卡
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
                      placeholder="例：垃圾已扔下楼、洗手台已用消毒湿巾擦干净..."
                      className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-[#8B5E3C]"
                    />
                  </div>
                )}

                {duty.completedNotes && (
                  <div className="mt-3 text-xs text-[#796B5B] dark:text-stone-300 bg-[#FAF7F2] dark:bg-stone-800/80 p-2.5 rounded-lg border border-[#E8E1D5] dark:border-stone-700">
                    💬 打卡附言：{duty.completedNotes}
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
          排班轮替日程（近期安排与历史记录）
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-400 font-medium">
                <th className="py-2.5 px-3">日期与星期</th>
                <th className="py-2.5 px-3">负责区域</th>
                <th className="py-2.5 px-3">排班值日生</th>
                <th className="py-2.5 px-3">完成状态</th>
                <th className="py-2.5 px-3 text-right">操作</th>
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
                        <span className="text-[#796B5B] dark:text-stone-400">({duty.dayOfWeek})</span>
                        {isToday && (
                          <span className="bg-[#8B5E3C] text-white text-[10px] px-1.5 py-0.2 rounded font-medium">
                            今日
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#2C2218] dark:text-stone-200">{duty.areaName}</span>
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
                            你
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {duty.status === 'completed' ? (
                        <span className="inline-flex items-center text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> 已完成
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[#796B5B] dark:text-stone-400 bg-[#FAF7F2] dark:bg-stone-800 px-2 py-0.5 rounded-full text-[11px] border border-[#E8E1D5] dark:border-stone-700">
                          <Clock className="w-3 h-3 mr-1 text-[#A89F91] dark:text-stone-500" /> 待值日
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
                          申请换班
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
