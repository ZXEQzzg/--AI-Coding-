import React, { useState } from 'react';
import { Roommate, CleaningDuty } from '../types';
import { X, ArrowRightLeft } from 'lucide-react';

interface SwapDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  duty: CleaningDuty | null;
  roommates: Roommate[];
  currentUserId: string;
  onSubmitSwap: (dutyId: string, toId: string, reason: string) => void;
}

export const SwapDutyModal: React.FC<SwapDutyModalProps> = ({
  isOpen,
  onClose,
  duty,
  roommates,
  currentUserId,
  onSubmitSwap,
}) => {
  if (!isOpen || !duty) return null;

  const otherRoommates = roommates.filter((r) => r.id !== currentUserId);
  const [targetId, setTargetId] = useState(otherRoommates[0]?.id || '');
  const [reason, setReason] = useState('临时需要加班/出差，想和你的值日排班对调一下~');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || !duty) return;

    onSubmitSwap(duty.id, targetId, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-stone-100 text-stone-900">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900">申请清洁值日换班</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 bg-stone-50 rounded-xl text-xs text-stone-700 border border-stone-200">
          <strong>当前值日任务：</strong> {duty.date} ({duty.dayOfWeek}) · {duty.areaName}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              向哪位室友申请对调？
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
            >
              {otherRoommates.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.roomName.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              换班说明事由
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="说明换班原因..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
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
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
            >
              发送换班申请
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
