import React from 'react';
import { Roommate, HouseInfo } from '../types';
import { Language, i18n } from '../utils/i18n';
import {
  Home,
  Receipt,
  Sparkles,
  Package,
  ShieldCheck,
  FileCheck2,
  ChevronDown,
  Building,
  MessageSquare,
  Sun,
  Moon,
  Globe,
  Shield,
} from 'lucide-react';

interface HeaderProps {
  houseInfo: HouseInfo;
  roommates: Roommate[];
  currentUserId: string;
  onSelectUser: (userId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingDutiesCount: number;
  urgentSuppliesCount: number;
  unsettledDebtsCount: number;
  messagesCount?: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  houseInfo,
  roommates,
  currentUserId,
  onSelectUser,
  activeTab,
  setActiveTab,
  urgentSuppliesCount,
  unsettledDebtsCount,
  messagesCount = 0,
  isDarkMode,
  onToggleDarkMode,
  lang,
  onToggleLang,
}) => {
  const t = i18n[lang];
  const currentUser = roommates.find((r) => r.id === currentUserId) || roommates[0];
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'overview', label: t.todayBoard, icon: Home },
    {
      id: 'expenses',
      label: t.expensesAA,
      icon: Receipt,
      badge: unsettledDebtsCount > 0 ? unsettledDebtsCount : null,
    },
    { id: 'cleaning', label: t.cleaningDuty, icon: Sparkles },
    {
      id: 'supplies',
      label: t.supplies,
      icon: Package,
      badge: urgentSuppliesCount > 0 ? t.urgentBadge : null,
      badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
    },
    { id: 'pacts', label: t.housePacts, icon: FileCheck2 },
    {
      id: 'messages',
      label: t.messageBoard,
      icon: MessageSquare,
      badge: messagesCount > 0 ? messagesCount : null,
    },
    { id: 'admin', label: t.adminConsole, icon: ShieldCheck, isAdmin: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-md border-b border-[#E8E1D5] dark:border-stone-800 transition-colors">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & House info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5E3C] text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-[#8B5E3C]/20">
              <Building className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-[#2C2218] dark:text-[#F5F5F4] tracking-tight">
                  {t.appTitle}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F7F3EB] dark:bg-stone-800 text-[#8B5E3C] dark:text-amber-400 border border-[#E8E1D5] dark:border-stone-700">
                  {t.youthEdition}
                </span>
              </div>
              <p className="text-xs text-[#796B5B] dark:text-stone-400 font-medium truncate max-w-[180px] sm:max-w-xs">
                {houseInfo.community} · {houseInfo.unit}
              </p>
            </div>
          </div>

          {/* Right utility toolbar: Theme + Language + User Perspective */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* 附加2: 日/夜转换功能 (Top Right) */}
            <button
              type="button"
              id="theme-toggle-button"
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-300 transition-all shadow-2xs active:scale-95"
              title={isDarkMode ? t.lightMode : t.darkMode}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-[#8B5E3C] animate-in spin-in-180 duration-200" />
              )}
            </button>

            {/* 附加3: 中英文切换 (只切换系统文字) */}
            <button
              type="button"
              id="language-toggle-button"
              onClick={onToggleLang}
              className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 text-xs font-bold text-[#8B5E3C] dark:text-amber-400 flex items-center space-x-1 transition-all shadow-2xs active:scale-95"
              title="切换系统语言 Switch system language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'zh' ? 'EN' : '中'}</span>
            </button>

            {/* Perspective Switcher */}
            <div className="relative">
              <button
                type="button"
                id="user-switch-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 py-1.5 px-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 hover:bg-[#F4EFE6] dark:hover:bg-stone-700 border border-[#E8E1D5] dark:border-stone-700 transition-colors text-left"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-[#D4C3A3]"
                />
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-[#2C2218] dark:text-[#F5F5F4] flex items-center space-x-1">
                    <span>{currentUser.name}</span>
                    {currentUser.role === 'admin' && (
                      <span className="text-[10px] bg-[#8B5E3C] text-white px-1 rounded-sm font-semibold">
                        {t.adminBadge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#796B5B] dark:text-stone-400 truncate max-w-[100px]">
                    {currentUser.roomName.split(' ')[0]}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-[#796B5B] dark:text-stone-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#292524] rounded-2xl shadow-xl border border-[#E8E1D5] dark:border-stone-700 py-2 z-30 divide-y divide-[#F7F3EB] dark:divide-stone-800">
                    <div className="px-3 py-2 text-xs font-medium text-[#796B5B] dark:text-stone-400">
                      {t.switchPerspective}
                    </div>
                    <div className="py-1">
                      {roommates.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          id={`switch-user-${r.id}`}
                          onClick={() => {
                            onSelectUser(r.id);
                            setUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-left hover:bg-[#FAF7F2] dark:hover:bg-stone-800 transition-colors ${
                            r.id === currentUserId
                              ? 'bg-[#F7F3EB] dark:bg-stone-800 font-semibold'
                              : ''
                          }`}
                        >
                          <img
                            src={r.avatar}
                            alt={r.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#E8E1D5]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <span className="text-[#2C2218] dark:text-stone-100">{r.name}</span>
                              {r.role === 'admin' ? (
                                <span className="inline-flex items-center text-[10px] bg-[#8B5E3C] text-white px-1.5 py-0.2 rounded-full font-semibold">
                                  {t.adminBadge}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#796B5B] dark:text-stone-400 bg-[#F7F3EB] dark:bg-stone-700 px-1 rounded-sm">
                                  {t.memberBadge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#796B5B] dark:text-stone-400 truncate">
                              {r.roomName} · {r.jobOrMajor.split(' · ')[0]}
                            </p>
                          </div>
                          {r.id === currentUserId && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="px-3 py-2 bg-[#FAF7F2] dark:bg-stone-800/50">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('admin');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-1.5 text-xs text-[#8B5E3C] dark:text-amber-400 hover:text-[#724A2D] font-bold py-1"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{t.enterAdminConsole}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-2 -mb-px border-t border-[#E8E1D5] dark:border-stone-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#8B5E3C] text-white shadow-xs font-semibold'
                    : 'text-[#796B5B] dark:text-stone-300 hover:text-[#2C2218] dark:hover:text-white hover:bg-[#F7F3EB] dark:hover:bg-stone-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8B5E3C] dark:text-amber-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                      item.badgeColor ||
                      (isActive ? 'bg-white/25 text-white' : 'bg-[#EFE8DC] dark:bg-stone-700 text-[#8B5E3C] dark:text-amber-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
