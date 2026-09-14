import React, { useState } from 'react';
import { Roommate, GentleReminder } from '../types';
import { Language, i18n } from '../utils/i18n';
import { X, MessageSquareHeart } from 'lucide-react';

interface PostReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommates: Roommate[];
  currentUserId: string;
  lang: Language;
  onAddReminder: (reminder: Omit<GentleReminder, 'id' | 'createdAt' | 'likes' | 'resolved'>) => void;
}

export const PostReminderModal: React.FC<PostReminderModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  lang,
  onAddReminder,
}) => {
  if (!isOpen) return null;

  const t = i18n[lang];

  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'noise' | 'cleanliness' | 'lights_ac' | 'supplies' | 'praise'>('praise');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const presets = [
    {
      cat: 'praise',
      label: lang === 'zh'
        ? '感谢某位室友把冰箱整理得超级整齐！大家合租太暖心啦~'
        : 'Huge thanks to whoever organized the fridge today! Living together feels so wholesome~',
    },
    {
      cat: 'noise',
      label: lang === 'zh'
        ? '最近在准备毕业答辩，早上大家出门带门时请稍微轻一点手哦，感恩！'
        : 'Preparing for my defense recently. Please close the door gently when heading out early morning, thank you!',
    },
    {
      cat: 'cleanliness',
      label: lang === 'zh'
        ? '浴室洗澡后顺手用刮板刮干地面水渍，下一位室友进卫生间就不会滑倒啦~'
        : 'Please squeegee the shower floor after bathing to keep the bathroom dry and safe for the next person~',
    },
    {
      cat: 'supplies',
      label: lang === 'zh'
        ? '厨房垃圾袋好像只剩最后两个啦，近期去超市的室友帮忙顺带一包~'
        : 'Only 2 trash bags left in the kitchen, whoever goes to the market next please help grab a pack~',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onAddReminder({
      fromId: isAnonymous ? undefined : currentUserId,
      isAnonymous,
      target: 'all',
      category,
      message: message.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#292524] rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E8E1D5] dark:border-stone-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] dark:border-stone-700">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 text-[#8B5E3C] dark:text-amber-400">
              <MessageSquareHeart className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-[#2C2218] dark:text-[#F5F5F4]">{t.postReminderModalTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#796B5B] dark:text-stone-400 hover:text-[#2C2218] dark:hover:text-stone-100 hover:bg-[#FAF7F2] dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 p-3 bg-[#FAF7F2] dark:bg-stone-900 rounded-xl text-xs text-[#5C4D3C] dark:text-stone-300 leading-relaxed border border-[#E8E1D5] dark:border-stone-800">
          💡 <strong className="text-[#2C2218] dark:text-[#F5F5F4]">{t.nvcTipTitle}:</strong> {t.nvcTipDesc}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
              {t.reminderTypeLabel}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
            >
              <option value="praise">{lang === 'zh' ? '💖 室友夸夸与温暖感谢' : '💖 Roommate Compliment & Appreciation'}</option>
              <option value="noise">{lang === 'zh' ? '🌙 作息静音提醒' : '🌙 Quiet Hours & Rest Reminder'}</option>
              <option value="cleanliness">{lang === 'zh' ? '✨ 公共卫生关照' : '✨ Common Area Tidiness'}</option>
              <option value="supplies">{lang === 'zh' ? '📦 物资采买协助' : '📦 Shared Supplies Restock'}</option>
              <option value="lights_ac">{lang === 'zh' ? '❄️ 空调灯光用电随手关' : '❄️ Turn Off AC & Lights'}</option>
            </select>
          </div>

          {/* Quick preset chips */}
          <div>
            <div className="text-[11px] text-[#A89F91] dark:text-stone-400 mb-1">{t.quickPresetsLabel}:</div>
            <div className="space-y-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMessage(p.label);
                    setCategory(p.cat as any);
                  }}
                  className="w-full text-left text-[11px] p-2 rounded-lg bg-[#FAF7F2] dark:bg-stone-900 hover:bg-[#F4EFE6] dark:hover:bg-stone-800 text-[#5C4D3C] dark:text-stone-300 border border-[#E8E1D5] dark:border-stone-800 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
              {t.reminderContentLabel}
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.reminderContentPlaceholder}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 text-xs text-[#5C4D3C] dark:text-stone-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-[#E8E1D5] dark:border-stone-700 text-[#8B5E3C] focus:ring-[#8B5E3C] w-4 h-4 cursor-pointer"
              />
              <span>{t.anonymousPostLabel}</span>
            </label>
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
              id="submit-reminder-btn"
              className="px-5 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold shadow-xs"
            >
              {t.postStickyNoteBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
