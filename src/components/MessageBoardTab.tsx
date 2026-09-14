import React, { useState } from 'react';
import { Roommate, MessagePost } from '../types';
import { Language, i18n } from '../utils/i18n';
import {
  MessageSquare,
  Heart,
  Plus,
  Send,
  Sparkles,
  Coffee,
  AlertCircle,
  Award,
  Wrench,
  Clock,
  CheckCircle2,
  Lock,
  MessageCircle,
  Share2,
} from 'lucide-react';

interface MessageBoardTabProps {
  messages: MessagePost[];
  roommates: Roommate[];
  currentUserId: string;
  lang: Language;
  onAddMessage: (newMsg: Omit<MessagePost, 'id' | 'createdAt' | 'likes'>) => void;
  onLikeMessage: (id: string) => void;
  onToggleResolveMessage: (id: string) => void;
  onAddReply: (messageId: string, content: string) => void;
}

export const MessageBoardTab: React.FC<MessageBoardTabProps> = ({
  messages,
  roommates,
  currentUserId,
  lang,
  onAddMessage,
  onLikeMessage,
  onToggleResolveMessage,
  onAddReply,
}) => {
  const t = i18n[lang];
  const currentUser = roommates.find((r) => r.id === currentUserId) || roommates[0];

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isComposing, setIsComposing] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MessagePost['category']>('chat');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  // Reply state
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const categories = [
    { id: 'all', label: t.allMessages, icon: MessageSquare },
    { id: 'chat', label: t.categoryChat, icon: Coffee, color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    { id: 'reminder', label: t.categoryReminder, icon: AlertCircle, color: 'text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700' },
    { id: 'praise', label: t.categoryPraise, icon: Award, color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
    { id: 'borrow', label: t.categoryBorrow, icon: Wrench, color: 'text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-stone-800 border-amber-200 dark:border-stone-700' },
    { id: 'notice', label: t.categoryNotice, icon: Clock, color: 'text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  ];

  const filteredMessages = messages.filter((m) => {
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const tags = tagsInput
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    onAddMessage({
      authorId: isAnonymous ? undefined : currentUserId,
      isAnonymous,
      category,
      content: content.trim(),
      tags: tags.length > 0 ? tags : undefined,
    });

    setContent('');
    setTagsInput('');
    setIsComposing(false);
  };

  const handleSendReply = (messageId: string) => {
    if (!replyText.trim()) return;
    onAddReply(messageId, replyText.trim());
    setReplyText('');
    setActiveReplyId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#F7F3EB] to-[#EFE8DC] dark:from-[#292524] dark:to-[#1C1917] p-6 rounded-2xl border border-[#E8E1D5] dark:border-stone-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[#8B5E3C] text-white shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-[#2C2218] dark:text-[#F5F5F4] tracking-tight">
              {t.messageBoardTitle}
            </h2>
          </div>
          <p className="text-sm text-[#796B5B] dark:text-stone-400 mt-1 max-w-2xl">
            {t.messageBoardDesc}
          </p>
        </div>

        <button
          type="button"
          id="open-compose-message-btn"
          onClick={() => setIsComposing(!isComposing)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white font-medium text-sm transition-all shadow-sm active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>{t.postNewMessage}</span>
        </button>
      </div>

      {/* Message Composer Card */}
      {isComposing && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#292524] p-5 rounded-2xl border-2 border-[#D4C3A3] dark:border-stone-600 shadow-md space-y-4 animate-in fade-in-50 duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#E8E1D5] dark:border-stone-700 pb-3">
            <h3 className="text-sm font-bold text-[#2C2218] dark:text-[#F5F5F4] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400" />
              <span>{t.postNewMessage}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsComposing(false)}
              className="text-xs text-[#796B5B] hover:text-[#2C2218] dark:text-stone-400 dark:hover:text-stone-200"
            >
              {t.cancel}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#796B5B] dark:text-stone-400 mb-1.5">
              {t.filterMsgCategory}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['chat', 'reminder', 'praise', 'borrow', 'notice'] as const).map((catKey) => {
                const isSelected = category === catKey;
                const labelMap = {
                  chat: t.categoryChat,
                  reminder: t.categoryReminder,
                  praise: t.categoryPraise,
                  borrow: t.categoryBorrow,
                  notice: t.categoryNotice,
                };
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-colors ${
                      isSelected
                        ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-xs'
                        : 'bg-[#FDFBF7] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#F7F3EB]'
                    }`}
                  >
                    {labelMap[catKey]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Share your daily thoughts, borrow needs, or warm praise with roommates...'
                  : '写下你想和室友分享的生活留言、借物需求、或者温馨夸夸...'
              }
              className="w-full rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FDFBF7] dark:bg-stone-900 px-3.5 py-2.5 text-sm text-[#2C2218] dark:text-stone-100 placeholder-[#A89F91] focus:border-[#8B5E3C] focus:outline-hidden focus:ring-1 focus:ring-[#8B5E3C]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center space-x-2 cursor-pointer text-xs text-[#796B5B] dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-[#D4C3A3] text-[#8B5E3C] focus:ring-[#8B5E3C]"
                />
                <span className="font-medium">{t.anonymous}</span>
              </label>

              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder={lang === 'en' ? 'Tags (space or comma separated)' : '标签（如: 拼饭, 螺丝刀 空格分隔）'}
                className="text-xs bg-[#FDFBF7] dark:bg-stone-900 border border-[#E8E1D5] dark:border-stone-700 rounded-lg px-2.5 py-1 text-[#2C2218] dark:text-stone-200 placeholder-[#A89F91] w-48"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center space-x-1.5 px-5 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.confirm}</span>
            </button>
          </div>
        </form>
      )}

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = filterCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-xs'
                  : 'bg-white dark:bg-[#292524] text-[#796B5B] dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#F7F3EB] dark:hover:bg-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Message Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMessages.map((msg) => {
          const author = msg.isAnonymous
            ? null
            : roommates.find((r) => r.id === msg.authorId);
          const hasLiked = msg.likes.includes(currentUserId);
          const isResolved = Boolean(msg.isResolved);

          return (
            <div
              key={msg.id}
              className={`bg-white dark:bg-[#292524] rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isResolved
                  ? 'border-[#E8E1D5] dark:border-stone-700 opacity-90'
                  : 'border-[#E8E1D5] dark:border-stone-700 shadow-sm hover:border-[#D4C3A3] dark:hover:border-stone-600'
              }`}
            >
              <div>
                {/* Card Top Meta */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    {msg.isAnonymous ? (
                      <div className="w-8 h-8 rounded-full bg-[#EFE8DC] dark:bg-stone-700 text-[#8B5E3C] dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : (
                      <img
                        src={author?.avatar}
                        alt={author?.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-[#E8E1D5] dark:ring-stone-600"
                      />
                    )}
                    <div>
                      <div className="text-xs font-bold text-[#2C2218] dark:text-[#F5F5F4] flex items-center space-x-1.5">
                        <span>{msg.isAnonymous ? t.anonymous : author?.name}</span>
                        {!msg.isAnonymous && author && (
                          <span className="text-[10px] text-[#796B5B] dark:text-stone-400 font-normal">
                            {author.roomName.split(' ')[0]}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#A89F91] dark:text-stone-500">
                        {msg.createdAt}
                      </div>
                    </div>
                  </div>

                  {/* Badge & Resolved */}
                  <div className="flex items-center space-x-1.5">
                    {isResolved && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t.resolvedTag}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Content (User inputted text remains original language) */}
                <p className="text-sm text-[#2C2218] dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* Tags */}
                {msg.tags && msg.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {msg.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F7F3EB] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border border-[#E8E1D5] dark:border-stone-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#F7F3EB] dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    {/* Like button */}
                    <button
                      type="button"
                      onClick={() => onLikeMessage(msg.id)}
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                        hasLiked
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                          : 'text-[#796B5B] dark:text-stone-400 hover:bg-[#F7F3EB] dark:hover:bg-stone-800'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          hasLiked ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                      <span>{msg.likes.length}</span>
                    </button>

                    {/* Reply toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveReplyId(activeReplyId === msg.id ? null : msg.id)
                      }
                      className="inline-flex items-center space-x-1.5 text-[#796B5B] dark:text-stone-400 hover:text-[#2C2218] dark:hover:text-stone-200 px-2 py-1 rounded-lg hover:bg-[#F7F3EB] dark:hover:bg-stone-800 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>
                        {(msg.replies?.length || 0)} {t.reply}
                      </span>
                    </button>
                  </div>

                  {/* Toggle resolve button */}
                  {(msg.category === 'reminder' || msg.category === 'borrow') && (
                    <button
                      type="button"
                      onClick={() => onToggleResolveMessage(msg.id)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                        isResolved
                          ? 'text-[#796B5B] border-[#E8E1D5] dark:border-stone-700'
                          : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {isResolved ? (lang === 'en' ? 'Undo Resolved' : '撤销已解决') : t.markResolved}
                    </button>
                  )}
                </div>

                {/* Existing Replies */}
                {msg.replies && msg.replies.length > 0 && (
                  <div className="bg-[#FAF7F2] dark:bg-stone-800/60 rounded-xl p-2.5 space-y-2 text-xs border border-[#E8E1D5] dark:border-stone-700">
                    {msg.replies.map((rep) => {
                      const repAuthor = roommates.find((r) => r.id === rep.authorId);
                      return (
                        <div key={rep.id} className="flex items-start space-x-2">
                          <img
                            src={repAuthor?.avatar}
                            alt={repAuthor?.name}
                            className="w-5 h-5 rounded-full object-cover mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-[#2C2218] dark:text-stone-200">
                                {repAuthor?.name}
                              </span>
                              <span className="text-[10px] text-[#A89F91] dark:text-stone-500">
                                {rep.createdAt}
                              </span>
                            </div>
                            <p className="text-[#554A3E] dark:text-stone-300 mt-0.5">
                              {rep.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply Input */}
                {activeReplyId === msg.id && (
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={lang === 'en' ? 'Reply to this message...' : '回复这条留言...'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendReply(msg.id);
                        }
                      }}
                      className="flex-1 text-xs bg-[#FAF7F2] dark:bg-stone-900 border border-[#E8E1D5] dark:border-stone-700 rounded-xl px-3 py-1.5 text-[#2C2218] dark:text-stone-100 placeholder-[#A89F91] focus:outline-hidden focus:border-[#8B5E3C]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendReply(msg.id)}
                      className="px-3 py-1.5 bg-[#8B5E3C] hover:bg-[#724A2D] text-white rounded-xl text-xs font-semibold"
                    >
                      {t.confirm}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
