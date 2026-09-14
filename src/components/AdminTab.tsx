import React, { useState } from 'react';
import {
  Roommate,
  HouseInfo,
  AuditLog,
  RoomProfile,
  ExpenseRecord,
  CleaningDuty,
  SharedItem,
} from '../types';
import { Language, i18n } from '../utils/i18n';
import {
  Building,
  Shield,
  Megaphone,
  KeyRound,
  Wifi,
  Zap,
  Flame,
  Phone,
  Calendar,
  Users,
  Clock,
  Save,
  RotateCcw,
  Download,
  Check,
  Edit3,
  Copy,
  AlertCircle,
  FileText,
  BadgeCheck,
  Plus,
  Trash2,
  TrendingUp,
  PieChart,
  Home,
  Layers,
  Sparkles,
  BarChart3,
  ChevronRight,
  ShieldAlert,
  Sliders,
  DollarSign,
} from 'lucide-react';

interface AdminTabProps {
  houseInfo: HouseInfo;
  roommates: Roommate[];
  rooms: RoomProfile[];
  expenses: ExpenseRecord[];
  duties: CleaningDuty[];
  supplies: SharedItem[];
  auditLogs: AuditLog[];
  currentUserId: string;
  lang: Language;
  onUpdateHouseInfo: (info: HouseInfo) => void;
  onUpdateRoommates: (roommates: Roommate[]) => void;
  onUpdateRooms: (rooms: RoomProfile[]) => void;
  onResetData: () => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  houseInfo,
  roommates,
  rooms,
  expenses,
  duties,
  supplies,
  auditLogs,
  currentUserId,
  lang,
  onUpdateHouseInfo,
  onUpdateRoommates,
  onUpdateRooms,
  onResetData,
}) => {
  const t = i18n[lang];
  const currentUser = roommates.find((r) => r.id === currentUserId) || roommates[0];

  // Active admin sub tab
  const [adminSection, setAdminSection] = useState<
    'dashboard' | 'rooms' | 'members' | 'stats' | 'announcement' | 'audit'
  >('dashboard');

  // Announcement Form State
  const [announcementTitle, setAnnouncementTitle] = useState(houseInfo.announcement.title);
  const [announcementContent, setAnnouncementContent] = useState(houseInfo.announcement.content);
  const [announcementPinned, setAnnouncementPinned] = useState(houseInfo.announcement.isPinned);

  // New Room Form State
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomArea, setNewRoomArea] = useState(15);
  const [newRoomRent, setNewRoomRent] = useState(2000);
  const [newRoomOrientation, setNewRoomOrientation] = useState('朝南大窗');
  const [newRoomFeatures, setNewRoomFeatures] = useState('实木大床, 通顶衣柜');

  // New Member Form State
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRoom, setNewMemberRoom] = useState(rooms[0]?.name || '次卧');
  const [newMemberPhone, setNewMemberPhone] = useState('138-0000-0000');
  const [newMemberJob, setNewMemberJob] = useState('应届校招');
  const [newMemberEmergency, setNewMemberEmergency] = useState('家人 (139-0000-0000)');
  const [newMemberRent, setNewMemberRent] = useState(2000);

  // House editing
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logFilter, setLogFilter] = useState<string>('all');

  // Calculate lease days
  const endDate = new Date(houseInfo.leaseEndDate);
  const today = new Date('2026-09-12');
  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Global calculations
  const totalRent = roommates.reduce((s, r) => s + r.rentBase, 0);
  const totalExpenseAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const completedDutiesCount = duties.filter((d) => d.status === 'completed').length;
  const dutyRate = duties.length > 0 ? Math.round((completedDutiesCount / duties.length) * 100) : 100;
  const unsettledExpenses = expenses.filter((e) => !e.isFullySettled);
  const unsettledTotalDebt = unsettledExpenses.reduce((sum, exp) => {
    return sum + exp.splits.filter((s) => !s.isPaid).reduce((sp, s) => sp + s.amount, 0);
  }, 0);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHouseInfo({
      ...houseInfo,
      announcement: {
        title: announcementTitle,
        content: announcementContent,
        isPinned: announcementPinned,
        publishedBy: `${currentUser.name} (${t.adminBadge})`,
        updatedAt: '2026-09-12 12:00',
      },
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleToggleAdminRole = (targetId: string) => {
    const updated = roommates.map((r) => {
      if (r.id === targetId) {
        return {
          ...r,
          role: (r.role === 'admin' ? 'member' : 'admin') as 'admin' | 'member',
        };
      }
      return r;
    });
    onUpdateRoommates(updated);
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const newRoom: RoomProfile = {
      id: `room_${Date.now()}`,
      name: newRoomName.trim(),
      area: Number(newRoomArea) || 15,
      monthlyRent: Number(newRoomRent) || 2000,
      deposit: Number(newRoomRent) || 2000,
      orientation: newRoomOrientation.trim(),
      features: newRoomFeatures
        .split(/[,，\s]+/)
        .map((f) => f.trim())
        .filter(Boolean),
      status: 'vacant',
    };
    const updated = [...rooms, newRoom];
    onUpdateRooms(updated);
    setIsAddingRoom(false);
    setNewRoomName('');
  };

  const handleDeleteRoom = (roomId: string) => {
    const updated = rooms.filter((r) => r.id !== roomId);
    onUpdateRooms(updated);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newMember: Roommate = {
      id: `user_${Date.now()}`,
      name: newMemberName.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      roomName: newMemberRoom,
      roomArea: 15,
      rentBase: Number(newMemberRent) || 2000,
      deposit: Number(newMemberRent) || 2000,
      phone: newMemberPhone.trim(),
      emergencyContact: newMemberEmergency.trim(),
      role: 'member',
      joinedDate: '2026-09-12',
      jobOrMajor: newMemberJob.trim(),
    };
    const updated = [...roommates, newMember];
    onUpdateRoommates(updated);
    setIsAddingMember(false);
    setNewMemberName('');
  };

  const filteredLogs = auditLogs.filter((l) => {
    if (logFilter !== 'all' && l.type !== logFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Admin Top Master Header */}
      <div className="bg-gradient-to-r from-[#2C2218] via-[#3E2F22] to-[#4A3828] text-white rounded-2xl p-6 shadow-md border border-[#523F2E]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-[#8B5E3C] rounded-xl text-white mt-0.5 shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-[#F7F3EB]">
                  {t.adminTitle}
                </h2>
                <span className="text-xs bg-[#8B5E3C]/50 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full font-medium">
                  {currentUser.name} ({t.adminBadge})
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#D4C3A3] mt-1 max-w-2xl">
                {t.adminDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="export-json-btn"
              onClick={() => {
                const fullState = {
                  houseInfo,
                  roommates,
                  rooms,
                  expenses,
                  duties,
                  supplies,
                  auditLogs,
                  exportedAt: new Date().toISOString(),
                };
                const blob = new Blob([JSON.stringify(fullState, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `coliving-backup-${houseInfo.community}.json`;
                a.click();
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F7F3EB] text-xs font-medium transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportBackup}</span>
            </button>

            <button
              type="button"
              id="reset-demo-btn"
              onClick={() => {
                if (confirm('确定要重置为初始演示数据吗？所有数据将恢复默认状态。')) {
                  onResetData();
                }
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F7F3EB] text-xs font-medium transition-colors flex items-center space-x-1.5"
              title={t.resetDemo}
            >
              <RotateCcw className="w-4 h-4 text-amber-300" />
              <span>{t.resetDemo}</span>
            </button>
          </div>
        </div>

        {/* 4 Essential Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-xl border border-white/5">
            <div className="text-[#C4B5A5]">{t.totalHouseRent}</div>
            <div className="text-xl font-bold text-white mt-1">
              ¥{houseInfo.totalMonthlyRent.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-300/90 mt-0.5">
              实收已分摊: ¥{totalRent.toLocaleString()}
            </div>
          </div>
          <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-xl border border-white/5">
            <div className="text-[#C4B5A5]">{t.leaseRemaining}</div>
            <div className="text-xl font-bold text-amber-300 mt-1">
              {remainingDays} {t.daysUnit}
            </div>
            <div className="text-[10px] text-[#C4B5A5] mt-0.5">
              到期日: {houseInfo.leaseEndDate}
            </div>
          </div>
          <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-xl border border-white/5">
            <div className="text-[#C4B5A5]">{t.activeRoommates}</div>
            <div className="text-xl font-bold text-white mt-1">
              {roommates.length} {t.person}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">满员运转中</div>
          </div>
          <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-xl border border-white/5">
            <div className="text-[#C4B5A5]">{t.houseLayout}</div>
            <div className="text-base font-bold text-white mt-1 truncate">
              {houseInfo.layout}
            </div>
            <div className="text-[10px] text-[#C4B5A5] mt-0.5 truncate">{houseInfo.community}</div>
          </div>
        </div>
      </div>

      {/* Admin Module Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar p-1.5 bg-white dark:bg-[#292524] rounded-2xl border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
        {[
          { id: 'dashboard', label: t.adminTabDashboard, icon: BarChart3 },
          { id: 'rooms', label: t.adminTabRooms, icon: Home },
          { id: 'members', label: t.adminTabMembers, icon: Users },
          { id: 'stats', label: t.adminTabStats, icon: PieChart },
          { id: 'announcement', label: t.adminTabAnnouncement, icon: Megaphone },
          { id: 'audit', label: t.adminTabAudit, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminSection(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#8B5E3C] text-white shadow-xs'
                  : 'text-[#796B5B] dark:text-stone-300 hover:text-[#2C2218] hover:bg-[#F7F3EB] dark:hover:bg-stone-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: DASHBOARD (全屋仪表盘) */}
      {adminSection === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick House Credentials */}
          <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
            <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base mb-3 flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400" />
              <span>{t.quickCredentials}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Wi-Fi */}
              <div
                onClick={() => handleCopy(houseInfo.wifiPassword, 'wifi')}
                className="p-3.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-800/80 hover:bg-[#F4EFE6] cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between text-xs text-[#796B5B] dark:text-stone-400 mb-1">
                  <span className="flex items-center space-x-1 font-medium">
                    <Wifi className="w-3.5 h-3.5 text-[#8B5E3C] dark:text-amber-400" />
                    <span>{t.wifiPassword}</span>
                  </span>
                  {copiedKey === 'wifi' ? (
                    <span className="text-emerald-600 font-bold text-[11px]">{t.copied}</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200" />
                  )}
                </div>
                <div className="font-mono text-sm font-bold text-[#2C2218] dark:text-stone-100 truncate">
                  {houseInfo.wifiPassword}
                </div>
                <div className="text-[11px] text-[#A89F91] dark:text-stone-500 mt-1 truncate">
                  SSID: {houseInfo.wifiSsid}
                </div>
              </div>

              {/* Electric Meter */}
              <div
                onClick={() => handleCopy(houseInfo.electricMeterNumber, 'electric')}
                className="p-3.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-800/80 hover:bg-[#F4EFE6] cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between text-xs text-[#796B5B] dark:text-stone-400 mb-1">
                  <span className="flex items-center space-x-1 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{t.electricMeter}</span>
                  </span>
                  {copiedKey === 'electric' ? (
                    <span className="text-emerald-600 font-bold text-[11px]">{t.copied}</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200" />
                  )}
                </div>
                <div className="font-mono text-sm font-bold text-[#2C2218] dark:text-stone-100 truncate">
                  {houseInfo.electricMeterNumber}
                </div>
                <div className="text-[11px] text-[#A89F91] dark:text-stone-500 mt-1">
                  {lang === 'en' ? 'National Grid App ID' : '国网App交费号'}
                </div>
              </div>

              {/* Gas Meter */}
              <div
                onClick={() => handleCopy(houseInfo.gasMeterNumber, 'gas')}
                className="p-3.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-800/80 hover:bg-[#F4EFE6] cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between text-xs text-[#796B5B] dark:text-stone-400 mb-1">
                  <span className="flex items-center space-x-1 font-medium">
                    <Flame className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{t.gasMeter}</span>
                  </span>
                  {copiedKey === 'gas' ? (
                    <span className="text-emerald-600 font-bold text-[11px]">{t.copied}</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200" />
                  )}
                </div>
                <div className="font-mono text-sm font-bold text-[#2C2218] dark:text-stone-100 truncate">
                  {houseInfo.gasMeterNumber}
                </div>
                <div className="text-[11px] text-[#A89F91] dark:text-stone-500 mt-1">
                  {lang === 'en' ? 'Gas meter card ID' : '燃气表插卡编号'}
                </div>
              </div>

              {/* Landlord Phone */}
              <div
                onClick={() => handleCopy(houseInfo.landlordPhone, 'landlord')}
                className="p-3.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-800/80 hover:bg-[#F4EFE6] cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between text-xs text-[#796B5B] dark:text-stone-400 mb-1">
                  <span className="flex items-center space-x-1 font-medium">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.landlordContact}</span>
                  </span>
                  {copiedKey === 'landlord' ? (
                    <span className="text-emerald-600 font-bold text-[11px]">{t.copied}</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200" />
                  )}
                </div>
                <div className="font-mono text-sm font-bold text-[#2C2218] dark:text-stone-100 truncate">
                  {houseInfo.landlordPhone}
                </div>
                <div className="text-[11px] text-[#A89F91] dark:text-stone-500 mt-1 truncate">
                  {houseInfo.landlordName}
                </div>
              </div>
            </div>
          </div>

          {/* Operational Pulse Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rent Health Card */}
            <div className="bg-white dark:bg-[#292524] p-5 rounded-2xl border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#796B5B] dark:text-stone-400 uppercase tracking-wider">
                  {t.rentCoverage}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {lang === 'en' ? '100% Collected' : '100% 齐缴'}
                </span>
              </div>
              <div className="text-2xl font-bold text-[#2C2218] dark:text-[#F5F5F4]">
                ¥{totalRent.toLocaleString()}
              </div>
              <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">
                {lang === 'en'
                  ? 'All 4 rooms partitioned, reserve funds healthy'
                  : '4间房租金全部分摊完毕，押金备付金池健全'}
              </p>
            </div>

            {/* Hygiene Health Card */}
            <div className="bg-white dark:bg-[#292524] p-5 rounded-2xl border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#796B5B] dark:text-stone-400 uppercase tracking-wider">
                  {t.cleaningCompletionRate}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{dutyRate}%</span>
              </div>
              <div className="text-2xl font-bold text-[#2C2218] dark:text-[#F5F5F4]">
                {completedDutiesCount} / {duties.length} {lang === 'en' ? 'times' : '次'}
              </div>
              <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">
                {lang === 'en'
                  ? 'Common area roster fulfillment rate is optimal this week'
                  : '本周公共区域保洁打卡履行率优秀'}
              </p>
            </div>

            {/* Expense Health Card */}
            <div className="bg-white dark:bg-[#292524] p-5 rounded-2xl border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#796B5B] dark:text-stone-400 uppercase tracking-wider">
                  {t.unsettledDebtsTotal}
                </span>
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                  {unsettledExpenses.length} {lang === 'en' ? 'pending settlement' : '笔待平账'}
                </span>
              </div>
              <div className="text-2xl font-bold text-[#8B5E3C] dark:text-amber-400">
                ¥{unsettledTotalDebt.toFixed(2)}
              </div>
              <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-1">
                {lang === 'en' ? 'Total shared expenses: ' : '累计公共开销支出 '}¥{totalExpenseAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ROOM MANAGEMENT (房间管理) */}
      {adminSection === 'rooms' && (
        <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E1D5] dark:border-stone-700">
            <div>
              <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base">{t.adminTabRooms}</h3>
              <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
                {lang === 'en'
                  ? 'Manage bedroom assets, area, layout, and baseline rent ledger'
                  : '管理全屋卧室、面积、朝向配置及基准租金台账'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingRoom(!isAddingRoom)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addRoom}</span>
            </button>
          </div>

          {/* New Room Add Form */}
          {isAddingRoom && (
            <form
              onSubmit={handleAddRoom}
              className="bg-[#FAF7F2] dark:bg-stone-800/70 p-4 rounded-xl border border-[#D4C3A3] dark:border-stone-600 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                    {t.roomName}
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Bedroom D (balcony)' : '如: 次卧 D (带阳台)'}
                    className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#2C2218] dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                    {t.roomAreaCol}
                  </label>
                  <input
                    type="number"
                    required
                    value={newRoomArea}
                    onChange={(e) => setNewRoomArea(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#2C2218] dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                    {t.roomRent}
                  </label>
                  <input
                    type="number"
                    required
                    value={newRoomRent}
                    onChange={(e) => setNewRoomRent(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#2C2218] dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                    {lang === 'en' ? 'Orientation / Layout' : '朝向格局'}
                  </label>
                  <input
                    type="text"
                    value={newRoomOrientation}
                    onChange={(e) => setNewRoomOrientation(e.target.value)}
                    placeholder={lang === 'en' ? 'South-facing / Double-glazed' : '朝南/静音双层玻璃'}
                    className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#2C2218] dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                  {t.roomFeatures} ({lang === 'en' ? 'comma separated' : '逗号分隔'})
                </label>
                <input
                  type="text"
                  value={newRoomFeatures}
                  onChange={(e) => setNewRoomFeatures(e.target.value)}
                  placeholder={lang === 'en' ? 'Ensuite bath, King bed, Bay window...' : '独立卫浴, 1.8米大床, 全景飘窗...'}
                  className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#2C2218] dark:text-stone-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingRoom(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E8E1D5] dark:border-stone-700 text-xs text-[#796B5B] dark:text-stone-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold"
                >
                  {t.confirm}
                </button>
              </div>
            </form>
          )}

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rooms.map((room) => {
              const occupant = roommates.find((r) => r.id === room.occupantId);
              return (
                <div
                  key={room.id}
                  className="p-4 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-800/60 flex flex-col justify-between hover:border-[#D4C3A3] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-sm flex items-center space-x-1.5">
                        <Home className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400" />
                        <span>{room.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#8B5E3C] dark:text-amber-400">
                        ¥{room.monthlyRent}/{lang === 'en' ? 'mo' : t.yuan}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-[#796B5B] dark:text-stone-400 mb-2">
                      <span>{t.roomAreaCol}: {room.area} ㎡</span>
                      <span>·</span>
                      <span>{room.orientation}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {room.features.map((f, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-stone-900 text-[#796B5B] dark:text-stone-300 border border-[#E8E1D5] dark:border-stone-700"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8E1D5] dark:border-stone-700 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      {occupant ? (
                        <>
                          <img
                            src={occupant.avatar}
                            alt={occupant.name}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-[#D4C3A3]"
                          />
                          <span className="font-semibold text-[#2C2218] dark:text-stone-200">
                            {occupant.name} ({t.roomOccupant})
                          </span>
                        </>
                      ) : (
                        <span className="text-stone-400 italic">
                          {lang === 'en' ? 'Vacant / Unoccupied' : '暂空置未入住'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-rose-600 hover:text-rose-700 text-xs font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: MEMBERS MANAGEMENT (成员管理) */}
      {adminSection === 'members' && (
        <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E1D5] dark:border-stone-700">
            <div>
              <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base">{t.adminTabMembers}</h3>
              <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
                {lang === 'en'
                  ? 'Roommate contact info, admin role toggles, and tenant records'
                  : '室友联络方式、房管管理员角色切换与入住档案'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingMember(!isAddingMember)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addMember}</span>
            </button>
          </div>

          {/* New Member Form */}
          {isAddingMember && (
            <form
              onSubmit={handleAddMember}
              className="bg-[#FAF7F2] dark:bg-stone-800/70 p-4 rounded-xl border border-[#D4C3A3] dark:border-stone-600 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                    {t.memberName}
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder={lang === 'en' ? 'Roommate real name' : '室友真实姓名'}
                    className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#2C2218] dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                    {lang === 'en' ? 'Assigned Room' : '入住房间'}
                  </label>
                  <input
                    type="text"
                    value={newMemberRoom}
                    onChange={(e) => setNewMemberRoom(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#2C2218] dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                    {t.memberPhone}
                  </label>
                  <input
                    type="text"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#2C2218] dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                    {t.memberJob}
                  </label>
                  <input
                    type="text"
                    value={newMemberJob}
                    onChange={(e) => setNewMemberJob(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Frontend Engineer · Class of 2024' : '如: 前端工程师 · 24届校招'}
                    className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#2C2218] dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                    {t.emergencyContactCol}
                  </label>
                  <input
                    type="text"
                    value={newMemberEmergency}
                    onChange={(e) => setNewMemberEmergency(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Family (138-0000-0000)' : '如: 家人 (138-0000-0000)'}
                    className="w-full text-xs p-2 rounded-lg border border-[#E8E1D5] dark:border-stone-700 bg-white dark:bg-stone-900 text-[#2C2218] dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E8E1D5] dark:border-stone-700 text-xs text-[#796B5B] dark:text-stone-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold"
                >
                  {t.confirm}
                </button>
              </div>
            </form>
          )}

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E1D5] dark:border-stone-700 text-[#796B5B] dark:text-stone-400 font-medium">
                  <th className="py-2.5 px-3">{t.memberName}</th>
                  <th className="py-2.5 px-3">{lang === 'en' ? 'Assigned Room' : '居住房间'}</th>
                  <th className="py-2.5 px-3">{lang === 'en' ? 'Monthly Base Rent' : '月度租金基准'}</th>
                  <th className="py-2.5 px-3">{t.roomDepositCol}</th>
                  <th className="py-2.5 px-3">{t.memberJob}</th>
                  <th className="py-2.5 px-3">{t.emergencyContactCol}</th>
                  <th className="py-2.5 px-3 text-right">{t.toggleAdminRole}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F3EB] dark:divide-stone-800">
                {roommates.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF7F2] dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={r.avatar}
                          alt={r.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-[#D4C3A3]"
                        />
                        <div>
                          <div className="font-bold text-[#2C2218] dark:text-[#F5F5F4] flex items-center space-x-1">
                            <span>{r.name}</span>
                            {r.role === 'admin' ? (
                              <span className="text-[10px] bg-[#8B5E3C] text-white px-1.5 rounded-full font-semibold">
                                {t.adminBadge}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-[#EFE8DC] dark:bg-stone-700 text-[#796B5B] dark:text-stone-300 px-1.5 rounded-full">
                                {t.memberBadge}
                              </span>
                            )}
                          </div>
                          <div className="text-[#A89F91] dark:text-stone-500 text-[11px]">{r.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#2C2218] dark:text-stone-200">{r.roomName}</div>
                      <div className="text-[#796B5B] dark:text-stone-400 text-[11px]">{r.roomArea} ㎡</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#2C2218] dark:text-stone-100">
                      ¥{r.rentBase}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200 dark:border-emerald-800">
                        <BadgeCheck className="w-3 h-3 mr-1" /> {lang === 'en' ? 'Paid' : '已交'} ¥{r.deposit}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#796B5B] dark:text-stone-300">
                      {r.jobOrMajor}
                    </td>
                    <td className="py-3 px-3 text-[#796B5B] dark:text-stone-400">
                      {r.emergencyContact}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleAdminRole(r.id)}
                        className="text-[#8B5E3C] dark:text-amber-400 hover:text-[#724A2D] text-xs font-semibold hover:underline"
                      >
                        {r.role === 'admin'
                          ? (lang === 'en' ? 'Revoke Admin' : '撤销房管权限')
                          : (lang === 'en' ? 'Promote to Admin' : '提升为房管')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: GLOBAL DATA STATISTICS (全局数据统计) */}
      {adminSection === 'stats' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Expense Distribution */}
            <div className="bg-white dark:bg-[#292524] p-5 rounded-2xl border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
              <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base mb-4 flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400" />
                <span>{t.categoryDistribution}</span>
              </h3>

              <div className="space-y-3">
                {[
                  { label: lang === 'en' ? 'Broadband & Network' : '宽带网络与充值', amount: 360, color: 'bg-[#8B5E3C]' },
                  { label: lang === 'en' ? 'Summer AC & Common Power' : '夏季客厅与公区电费', amount: 360, color: 'bg-amber-600' },
                  { label: lang === 'en' ? 'Common Supplies Restock' : '公区公共物资补给', amount: 128.5, color: 'bg-stone-600' },
                  { label: lang === 'en' ? 'Hardware & Maintenance' : '维修五金备品', amount: 65, color: 'bg-emerald-600' },
                ].map((item, idx) => {
                  const percent = Math.round((item.amount / totalExpenseAmount) * 100) || 25;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#2C2218] dark:text-stone-200 font-medium">
                          {item.label}
                        </span>
                        <span className="font-bold text-[#796B5B] dark:text-stone-300">
                          ¥{item.amount} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#FAF7F2] dark:bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Duty Zone Summary */}
            <div className="bg-white dark:bg-[#292524] p-5 rounded-2xl border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
              <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base mb-4 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-[#8B5E3C] dark:text-amber-400" />
                <span>{t.dutySummary}</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: lang === 'en' ? 'Kitchen & Stove' : '厨房与灶台', count: 12, rate: '100%' },
                  { name: lang === 'en' ? 'Common Bath & Shower' : '公卫与淋浴间', count: 14, rate: '95%' },
                  { name: lang === 'en' ? 'Living Room & Entryway' : '客厅与玄关', count: 8, rate: '92%' },
                  { name: lang === 'en' ? 'Utility Balcony & Trash' : '生活阳台与垃圾', count: 10, rate: '98%' },
                ].map((zone, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E8E1D5] dark:border-stone-700"
                  >
                    <div className="text-xs text-[#796B5B] dark:text-stone-400">{zone.name}</div>
                    <div className="text-lg font-bold text-[#2C2218] dark:text-stone-100 mt-1">
                      {zone.count} {lang === 'en' ? 'settled' : '次已结'}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      {lang === 'en' ? 'Rate' : '履约率'}: {zone.rate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: ANNOUNCEMENTS (公告发布) */}
      {adminSection === 'announcement' && (
        <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base">{t.adminTabAnnouncement}</h3>
            <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
              {lang === 'en'
                ? 'Pinned announcement will appear at the top banner of all roommates home screen'
                : '置顶广播通知将展示在每位室友首页首屏，适用于安检、交租与重要通知'}
            </p>
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#796B5B] dark:text-stone-300 mb-1">
                {t.announcementTitle}
              </label>
              <input
                type="text"
                required
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder={lang === 'en' ? 'e.g. Sept 15 Gas company safety check...' : '例如: 9月15日燃气公司上门检修...'}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#796B5B] dark:text-stone-300 mb-1">
                {t.announcementContent}
              </label>
              <textarea
                rows={4}
                required
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                placeholder={lang === 'en' ? 'Detailed instructions and roommate cooperation requirements...' : '详细说明与室友配合要求...'}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pin-announcement-toggle"
                checked={announcementPinned}
                onChange={(e) => setAnnouncementPinned(e.target.checked)}
                className="rounded border-[#D4C3A3] text-[#8B5E3C] focus:ring-[#8B5E3C]"
              />
              <label htmlFor="pin-announcement-toggle" className="text-xs font-medium text-[#2C2218] dark:text-stone-300 cursor-pointer">
                {t.pinAnnouncement}
              </label>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8E1D5] dark:border-stone-700">
              {saveSuccess ? (
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center">
                  <Check className="w-4 h-4 mr-1" /> {t.announcementPublished}
                </span>
              ) : (
                <span className="text-xs text-[#A89F91] dark:text-stone-500">
                  {lang === 'en' ? 'Last published: ' : '最后发布：'}{houseInfo.announcement.updatedAt}
                </span>
              )}

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>{t.publishAnnouncement}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 6: AUDIT TRAIL (系统审计日志) */}
      {adminSection === 'audit' && (
        <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-stone-700">
            <div>
              <h3 className="font-bold text-[#2C2218] dark:text-[#F5F5F4] text-base">{t.adminTabAudit}</h3>
              <p className="text-xs text-[#796B5B] dark:text-stone-400 mt-0.5">
                {lang === 'en'
                  ? 'Full audit log of shared expenses, repayments, cleaning check-ins, and pact endorsements'
                  : '记录全屋开销记账、结清还款、值日打卡与公约背书全量操作'}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex space-x-1 text-xs">
              {['all', 'expense', 'duty', 'pact', 'admin'].map((fKey) => (
                <button
                  key={fKey}
                  onClick={() => setLogFilter(fKey)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    logFilter === fKey
                      ? 'bg-[#8B5E3C] text-white font-semibold'
                      : 'bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300'
                  }`}
                >
                  {fKey === 'all'
                    ? t.filterAll
                    : fKey === 'expense'
                    ? (lang === 'en' ? 'Expenses' : '费用')
                    : fKey === 'duty'
                    ? (lang === 'en' ? 'Cleaning' : '清洁')
                    : fKey === 'pact'
                    ? (lang === 'en' ? 'Pacts' : '公约')
                    : (lang === 'en' ? 'Admin' : '管理')}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#F7F3EB] dark:divide-stone-800 text-xs">
            {filteredLogs.map((log) => {
              const operator = roommates.find((r) => r.id === log.operatorId);
              return (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-2.5">
                    <img
                      src={operator?.avatar}
                      alt={operator?.name}
                      className="w-6 h-6 rounded-full object-cover mt-0.5"
                    />
                    <div>
                      <div className="font-semibold text-[#2C2218] dark:text-stone-200">
                        {operator?.name || (lang === 'en' ? 'Admin' : '管理员')} · {log.action}
                      </div>
                      <div className="text-[#796B5B] dark:text-stone-400 mt-0.5">{log.details}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#A89F91] dark:text-stone-500 whitespace-nowrap">
                    {log.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
