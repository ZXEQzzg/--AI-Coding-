import React, { useState } from 'react';
import { Roommate, RuleProposal } from '../types';
import { Language, i18n } from '../utils/i18n';
import { X, Sparkles } from 'lucide-react';

interface NewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommates: Roommate[];
  currentUserId: string;
  lang: Language;
  onAddProposal: (proposal: Omit<RuleProposal, 'id' | 'createdAt' | 'votesFor' | 'votesAgainst' | 'status'>) => void;
}

export const NewProposalModal: React.FC<NewProposalModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  lang,
  onAddProposal,
}) => {
  if (!isOpen) return null;

  const t = i18n[lang];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('生活便利');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAddProposal({
      creatorId: currentUserId,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#292524] rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E8E1D5] dark:border-stone-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] dark:border-stone-700">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 text-[#8B5E3C] dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-[#2C2218] dark:text-[#F5F5F4]">{t.newProposalModalTitle}</h3>
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
              {t.proposalTitleLabel}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.proposalTitlePlaceholder}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
              {t.proposalCategoryLabel}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
            >
              <option value="作息习惯">{lang === 'zh' ? '作息习惯' : 'Daily Schedule & Quiet Hours'}</option>
              <option value="公共卫生">{lang === 'zh' ? '公共卫生' : 'Common Area Hygiene'}</option>
              <option value="访客与社交">{lang === 'zh' ? '访客与社交' : 'Visitors & Socializing'}</option>
              <option value="生活便利">{lang === 'zh' ? '生活便利与设施' : 'Facilities & Convenience'}</option>
              <option value="节能环保">{lang === 'zh' ? '节能环保与安全' : 'Energy & House Safety'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
              {t.proposalDescLabel}
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.proposalDescPlaceholder}
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
              id="submit-proposal-btn"
              className="px-5 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold shadow-xs"
            >
              {t.submitProposalBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
