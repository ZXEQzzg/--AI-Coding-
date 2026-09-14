import React, { useState } from 'react';
import { Roommate, HouseRule, RuleProposal, GentleReminder } from '../types';
import { Language, i18n } from '../utils/i18n';
import {
  FileCheck2,
  Moon,
  Users,
  Utensils,
  Zap,
  Sparkles,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageSquareHeart,
  Heart,
  CheckCircle2,
  Smile,
  ShieldCheck,
} from 'lucide-react';

interface PactTabProps {
  roommates: Roommate[];
  pacts: HouseRule[];
  proposals: RuleProposal[];
  reminders: GentleReminder[];
  currentUserId: string;
  lang: Language;
  onOpenNewProposal: () => void;
  onOpenPostReminder: () => void;
  onVoteProposal: (proposalId: string, agree: boolean) => void;
  onTogglePactAgreement: (pactId: string) => void;
  onLikeReminder: (reminderId: string) => void;
  onResolveReminder: (reminderId: string) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Moon,
  Users,
  Utensils,
  Zap,
  Sparkles,
  FileCheck2,
};

export const PactTab: React.FC<PactTabProps> = ({
  roommates,
  pacts,
  proposals,
  reminders,
  currentUserId,
  lang,
  onOpenNewProposal,
  onOpenPostReminder,
  onVoteProposal,
  onTogglePactAgreement,
  onLikeReminder,
  onResolveReminder,
}) => {
  const t = i18n[lang];
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'proposals' | 'reminders'>('rules');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E1D5] dark:border-stone-700">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#2C2218] dark:text-[#F5F5F4]">{t.pactsTabTitle}</h2>
              <span className="text-xs bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 px-2.5 py-0.5 rounded-full border border-[#E8E1D5] dark:border-stone-700 font-medium">
                {t.pactsTabSub}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#796B5B] dark:text-stone-400 mt-1">
              {t.pactsTabDesc}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="open-post-reminder-btn"
              onClick={onOpenPostReminder}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-200 text-xs sm:text-sm font-medium transition-colors"
            >
              <MessageSquareHeart className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400" />
              <span>{t.writeWarmNote}</span>
            </button>

            <button
              type="button"
              id="open-proposal-btn"
              onClick={onOpenNewProposal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.initiateNewProposal}</span>
            </button>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex flex-wrap gap-2 pt-4">
          <button
            type="button"
            onClick={() => setActiveSubTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              activeSubTab === 'rules'
                ? 'bg-[#8B5E3C] text-white'
                : 'bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.effectiveRules} ({pacts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('proposals')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              activeSubTab === 'proposals'
                ? 'bg-[#8B5E3C] text-white'
                : 'bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.proposalsInVoting} ({proposals.filter((p) => p.status === 'voting').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('reminders')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              activeSubTab === 'reminders'
                ? 'bg-[#8B5E3C] text-white'
                : 'bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700'
            }`}
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>{t.gentleNotesBoard} ({reminders.length})</span>
          </button>
        </div>
      </div>

      {/* SubTab 1: Official House Rules */}
      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          {pacts.map((pact) => {
            const Icon = ICON_MAP[pact.iconName] || FileCheck2;
            const hasSigned = pact.agreedBy.includes(currentUserId);
            const signRate = Math.round((pact.agreedBy.length / roommates.length) * 100);

            return (
              <div
                key={pact.id}
                className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs hover:border-[#D4C3A3] dark:hover:border-stone-600 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 text-[#8B5E3C] dark:text-amber-400 shrink-0 mt-0.5 border border-[#E8E1D5] dark:border-stone-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[#2C2218] dark:text-stone-100 text-base">
                          {pact.title}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium">
                          {t.consensusReached} ({signRate}%)
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#2C2218] dark:text-stone-200 mt-2 leading-relaxed">
                        {pact.description}
                      </p>
                      {pact.penaltyOrNote && (
                        <p className="text-xs text-[#796B5B] dark:text-stone-300 bg-[#FAF7F2] dark:bg-stone-800/80 p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 mt-3">
                          💬 {t.originBackground}{pact.penaltyOrNote}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTogglePactAgreement(pact.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center space-x-1 ${
                      hasSigned
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                        : 'bg-[#8B5E3C] hover:bg-[#724A2D] text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{hasSigned ? t.signedAgreed : t.signSupportNow}</span>
                  </button>
                </div>

                {/* Signees avatar list */}
                <div className="mt-4 pt-3 border-t border-[#E8E1D5] dark:border-stone-700 flex flex-wrap items-center justify-between gap-2 text-xs text-[#796B5B] dark:text-stone-400">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#A89F91] dark:text-stone-500">{t.signedRoommates}</span>
                    <div className="flex items-center space-x-1.5">
                      {roommates.map((r) => {
                        const signed = pact.agreedBy.includes(r.id);
                        return (
                          <span
                            key={r.id}
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] border ${
                              signed
                                ? 'bg-[#FAF7F2] dark:bg-stone-800 text-[#2C2218] dark:text-stone-200 border-[#E8E1D5] dark:border-stone-700'
                                : 'bg-white dark:bg-stone-900 text-stone-400 border-[#E8E1D5]/60 dark:border-stone-800'
                            }`}
                          >
                            <img
                              src={r.avatar}
                              alt={r.name}
                              className="w-3.5 h-3.5 rounded-full object-cover"
                            />
                            <span>{r.name}</span>
                            {signed && <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#A89F91] dark:text-stone-500">
                    {t.effectiveDate}{pact.createdAt}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SubTab 2: Proposals in voting */}
      {activeSubTab === 'proposals' && (
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="bg-white dark:bg-[#292524] rounded-2xl p-12 text-center border border-[#E8E1D5] dark:border-stone-700 text-stone-400 dark:text-stone-500 text-sm">
              {t.noProposalsVoting}
            </div>
          ) : (
            proposals.map((prop) => {
              const creator = roommates.find((r) => r.id === prop.creatorId);
              const myVotedFor = prop.votesFor.includes(currentUserId);
              const myVotedAgainst = prop.votesAgainst.includes(currentUserId);

              return (
                <div
                  key={prop.id}
                  className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
                          {t.democraticVoting}
                        </span>
                        <span className="text-xs text-[#796B5B] dark:text-stone-400 font-medium">
                          {t.categoryLabel}{prop.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#2C2218] dark:text-stone-100 text-base mt-1.5">
                        {prop.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#2C2218] dark:text-stone-200 mt-2 leading-relaxed">
                        {prop.description}
                      </p>
                      <div className="text-xs text-[#796B5B] dark:text-stone-400 mt-2">
                        {t.initiatedByPrefix}{creator?.name} · {t.initiatedTimePrefix}{prop.createdAt}
                      </div>
                    </div>
                  </div>

                  {/* Voting stats and actions */}
                  <div className="mt-4 pt-4 border-t border-[#E8E1D5] dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span>
                          {t.supportLabel}<strong>{prop.votesFor.length}</strong> {t.votesUnit} (
                          {prop.votesFor
                            .map((id) => roommates.find((r) => r.id === id)?.name)
                            .join('、')}
                          )
                        </span>
                      </div>
                      {prop.votesAgainst.length > 0 && (
                        <div className="flex items-center space-x-1.5 text-[#796B5B] dark:text-stone-400">
                          <ThumbsDown className="w-4 h-4" />
                          <span>{t.opposeLabel}{prop.votesAgainst.length} {t.votesUnit}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => onVoteProposal(prop.id, true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                          myVotedFor
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-200 hover:bg-emerald-50 hover:text-emerald-700 border border-[#E8E1D5] dark:border-stone-700'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{myVotedFor ? t.votedAgree : t.voteAgree}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onVoteProposal(prop.id, false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                          myVotedAgainst
                            ? 'bg-stone-800 dark:bg-stone-700 text-white'
                            : 'bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-200 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{myVotedAgainst ? t.votedAgainst : t.voteAgainst}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SubTab 3: Gentle Non-violent Post-it Note Board */}
      {activeSubTab === 'reminders' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start space-x-2.5">
            <Smile className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>{t.whyGentleWallTitle}</strong>
              <p className="text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                {t.whyGentleWallDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((rem) => {
              const fromUser = rem.fromId ? roommates.find((r) => r.id === rem.fromId) : null;
              const hasLiked = rem.likes.includes(currentUserId);

              const categoryBadge = rem.category === 'praise'
                ? (lang === 'en' ? '💖 Praise & Thanks' : '💖 室友夸夸与感谢')
                : rem.category === 'noise'
                ? (lang === 'en' ? '🌙 Rest & Noise' : '🌙 作息关照')
                : rem.category === 'supplies'
                ? (lang === 'en' ? '📦 Supplies Request' : '📦 物资求助')
                : (lang === 'en' ? '✨ Living Details' : '✨ 生活细节');

              return (
                <div
                  key={rem.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    rem.category === 'praise'
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : rem.resolved
                      ? 'bg-[#FAF7F2] dark:bg-stone-800/50 border-[#E8E1D5] dark:border-stone-700 opacity-70'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            rem.category === 'praise'
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {categoryBadge}
                        </span>
                        <span className="text-stone-400">·</span>
                        <span className="text-[#796B5B] dark:text-stone-400 font-medium">
                          {rem.isAnonymous ? t.anonymousRoommate : fromUser?.name}
                        </span>
                      </div>

                      {rem.resolved ? (
                        <span className="text-[11px] text-[#796B5B] dark:text-stone-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{t.resolvedNoteBadge}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onResolveReminder(rem.id)}
                          className="text-[11px] text-[#8B5E3C] dark:text-amber-400 hover:underline"
                        >
                          {t.markResolvedButton}
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#2C2218] dark:text-stone-200 leading-relaxed mt-2 font-medium">
                      “{rem.message}”
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8E1D5] dark:border-stone-700 flex items-center justify-between text-xs text-[#796B5B] dark:text-stone-400">
                    <span>{rem.createdAt}</span>

                    <button
                      type="button"
                      onClick={() => onLikeReminder(rem.id)}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                        hasLiked
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : 'bg-white dark:bg-stone-800 text-[#796B5B] dark:text-stone-200 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#FAF7F2] dark:hover:bg-stone-700'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{t.heartReaction} ({rem.likes.length})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
