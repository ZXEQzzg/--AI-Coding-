import React, { useState } from 'react';
import { Roommate, CleaningDuty } from '../types';
import { Language, i18n, formatDutyArea, formatDayOfWeek } from '../utils/i18n';
import { X, ArrowRightLeft } from 'lucide-react';

interface SwapDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  duty: CleaningDuty | null;
  roommates: Roommate[];
  currentUserId: string;
  lang: Language;
  onSubmitSwap: (dutyId: string, toId: string, reason: string) => void;
}

export const SwapDutyModal: React.FC<SwapDutyModalProps> = ({
  isOpen,
  onClose,
  duty,
  roommates,
  currentUserId,
  lang,
  onSubmitSwap,
}) => {
  if (!isOpen || !duty) return null;

  const t = i18n[lang];

  const otherRoommates = roommates.filter((r) => r.id !== currentUserId);
  const [targetId, setTargetId] = useState(otherRoommates[0]?.id || '');
  const [reason, setReason] = useState(t.defaultSwapReason);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || !duty) return;

    onSubmitSwap(duty.id, targetId, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#292524] rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E8E1D5] dark:border-stone-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] dark:border-stone-700">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 text-[#8B5E3C] dark:text-amber-400">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-[#2C2218] dark:text-[#F5F5F4]">{t.swapDutyModalTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#796B5B] dark:text-stone-400 hover:text-[#2C2218] dark:hover:text-stone-100 hover:bg-[#FAF7F2] dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 bg-[#FAF7F2] dark:bg-stone-900 rounded-xl text-xs text-[#5C4D3C] dark:text-stone-300 border border-[#E8E1D5] dark:border-stone-800">
          <strong className="text-[#2C2218] dark:text-[#F5F5F4]">{t.currentDutyLabel}</strong> {duty.date} ({formatDayOfWeek(duty.dayOfWeek, lang)}) · {formatDutyArea(duty.area, lang)}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
              {t.requestSwapTargetLabel}
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
            >
              {otherRoommates.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.roomName.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
              {t.swapReasonLabel}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.swapReasonPlaceholder}
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
              className="px-5 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold shadow-xs"
            >
              {t.sendSwapRequestBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
