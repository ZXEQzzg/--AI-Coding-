import React, { useState } from 'react';
import { Roommate, GentleReminder } from '../types';
import { X, MessageSquareHeart, Smile, Heart } from 'lucide-react';

interface PostReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommates: Roommate[];
  currentUserId: string;
  onAddReminder: (reminder: Omit<GentleReminder, 'id' | 'createdAt' | 'likes' | 'resolved'>) => void;
}

export const PostReminderModal: React.FC<PostReminderModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  onAddReminder,
}) => {
  if (!isOpen) return null;

  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'noise' | 'cleanliness' | 'lights_ac' | 'supplies' | 'praise'>('praise');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const presets = [
    { cat: 'praise', label: '感谢某位室友把冰箱整理得超级整齐！大家合租太暖心啦~' },
    { cat: 'noise', label: '最近在准备毕业答辩，早上大家出门带门时请稍微轻一点手哦，感恩！' },
    { cat: 'cleanliness', label: '浴室洗澡后顺手用刮板刮干地面水渍，下一位室友进卫生间就不会滑倒啦~' },
    { cat: 'supplies', label: '厨房垃圾袋好像只剩最后两个啦，近期去超市的室友帮忙顺带一包~' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-800">
              <MessageSquareHeart className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900">贴一张温和生活便签</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 p-3 bg-stone-50 rounded-xl text-xs text-stone-600 leading-relaxed border border-stone-100">
          💡 <strong>非暴力沟通小技巧：</strong> 表达观察与期待，避免指责与批评，让合租氛围更融洽温暖。
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              便签类型
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
            >
              <option value="praise">💖 室友夸夸与温暖感谢</option>
              <option value="noise">🌙 作息静音提醒</option>
              <option value="cleanliness">✨ 公共卫生关照</option>
              <option value="supplies">📦 物资采买协助</option>
              <option value="lights_ac">❄️ 空调灯光用电随手关</option>
            </select>
          </div>

          {/* Quick preset chips */}
          <div>
            <div className="text-[11px] text-stone-400 mb-1">快速参考模板：</div>
            <div className="space-y-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMessage(p.label);
                    setCategory(p.cat as any);
                  }}
                  className="w-full text-left text-[11px] p-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-100 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              便签内容 *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="写下你想向室友表达的温和建议或夸奖..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 text-xs text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-500 w-4 h-4 cursor-pointer"
              />
              <span>匿名发表（避免直面尴尬）</span>
            </label>
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
              id="submit-reminder-btn"
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
            >
              贴上便签墙
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
