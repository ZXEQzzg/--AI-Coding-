import React, { useState, useEffect } from 'react';
import {
  Roommate,
  ExpenseRecord,
  CleaningDuty,
  SharedItem,
  HouseRule,
  RuleProposal,
  GentleReminder,
  HouseInfo,
  AuditLog,
  RoomProfile,
  MessagePost,
  ExpenseCategory,
  StockLevel,
} from './types';
import { StorageService } from './utils/storage';
import { calculateNetDebts } from './utils/debtCalculator';
import { Language, i18n } from './utils/i18n';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { ExpensesTab } from './components/ExpensesTab';
import { CleaningTab } from './components/CleaningTab';
import { SuppliesTab } from './components/SuppliesTab';
import { PactTab } from './components/PactTab';
import { MessageBoardTab } from './components/MessageBoardTab';
import { AdminTab } from './components/AdminTab';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddSupplyModal } from './components/AddSupplyModal';
import { NewProposalModal } from './components/NewProposalModal';
import { SwapDutyModal } from './components/SwapDutyModal';
import { PostReminderModal } from './components/PostReminderModal';

export default function App() {
  // Primary state loaded from storage
  const [roommates, setRoommates] = useState<Roommate[]>(StorageService.getRoommates());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(StorageService.getExpenses());
  const [duties, setDuties] = useState<CleaningDuty[]>(StorageService.getDuties());
  const [supplies, setSupplies] = useState<SharedItem[]>(StorageService.getSupplies());
  const [pacts, setPacts] = useState<HouseRule[]>(StorageService.getPacts());
  const [proposals, setProposals] = useState<RuleProposal[]>(StorageService.getProposals());
  const [reminders, setReminders] = useState<GentleReminder[]>(StorageService.getReminders());
  const [houseInfo, setHouseInfo] = useState<HouseInfo>(StorageService.getHouseInfo());
  const [rooms, setRooms] = useState<RoomProfile[]>(StorageService.getRooms());
  const [messages, setMessages] = useState<MessagePost[]>(StorageService.getMessages());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(StorageService.getAuditLogs());

  // UI state: Tab, User perspective
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentUserId, setCurrentUserId] = useState<string>(StorageService.getCurrentUserId());

  // 附加2: 日/夜模式 (Dark/Light mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('coliving_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // 附加3: 用户模式中英文切换 (只切换系统文字不切换留言评论，用户输入仍为原语言)
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('coliving_lang');
      return saved === 'en' ? 'en' : 'zh';
    } catch {
      return 'zh';
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('coliving_theme', isDarkMode ? 'dark' : 'light');
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'zh' ? 'en' : 'zh';
      try {
        localStorage.setItem('coliving_lang', next);
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expensePrefill, setExpensePrefill] = useState<{
    title?: string;
    amount?: number;
    category?: ExpenseCategory;
    note?: string;
  } | undefined>(undefined);

  const [isAddSupplyOpen, setIsAddSupplyOpen] = useState(false);
  const [isNewProposalOpen, setIsNewProposalOpen] = useState(false);
  const [isSwapDutyOpen, setIsSwapDutyOpen] = useState(false);
  const [selectedSwapDuty, setSelectedSwapDuty] = useState<CleaningDuty | null>(null);
  const [isPostReminderOpen, setIsPostReminderOpen] = useState(false);

  // Helper to log actions
  const logAction = (action: string, details: string, type: AuditLog['type']) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      operatorId: currentUserId,
      action,
      details,
      timestamp: new Date().toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      type,
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    StorageService.setAuditLogs(updated);
  };

  const handleSelectUser = (id: string) => {
    setCurrentUserId(id);
    StorageService.setCurrentUserId(id);
  };

  // --- Expenses actions ---
  const handleAddExpense = (
    expenseData: Omit<ExpenseRecord, 'id' | 'createdAt' | 'isFullySettled'>
  ) => {
    const isFullySettled = expenseData.splits.every((s) => s.isPaid);
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      isFullySettled,
      createdAt: '2026-09-12 12:00',
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    StorageService.setExpenses(updated);

    const payer = roommates.find((r) => r.id === expenseData.payerId)?.name || '室友';
    logAction('录入开销', `${payer} 录入了「${expenseData.title}」¥${expenseData.amount}`, 'expense');
  };

  const handleSettleSplit = (expenseId: string, roommateId: string) => {
    const updated = expenses.map((exp) => {
      if (exp.id === expenseId) {
        const updatedSplits = exp.splits.map((s) => {
          if (s.roommateId === roommateId) {
            return {
              ...s,
              isPaid: true,
              settledAt: '2026-09-12 12:30',
            };
          }
          return s;
        });
        const isFullySettled = updatedSplits.every((s) => s.isPaid);
        return {
          ...exp,
          splits: updatedSplits,
          isFullySettled,
        };
      }
      return exp;
    });
    setExpenses(updated);
    StorageService.setExpenses(updated);

    const payerName = roommates.find((r) => r.id === roommateId)?.name || '室友';
    logAction('AA结算', `${payerName} 结清了一笔分摊款项`, 'expense');
  };

  const handleSettleAllBetween = (fromId: string, toId: string) => {
    const updated = expenses.map((exp) => {
      if (exp.payerId === toId) {
        const nextSplits = exp.splits.map((s) => {
          if (s.roommateId === fromId && !s.isPaid) {
            return { ...s, isPaid: true, settledAt: '2026-09-12 12:30' };
          }
          return s;
        });
        return {
          ...exp,
          splits: nextSplits,
          isFullySettled: nextSplits.every((s) => s.isPaid),
        };
      }
      return exp;
    });
    setExpenses(updated);
    StorageService.setExpenses(updated);

    const fromName = roommates.find((r) => r.id === fromId)?.name || '室友';
    const toName = roommates.find((r) => r.id === toId)?.name || '室友';
    logAction('一键对冲平账', `${fromName} 结清了与 ${toName} 的所有往来借贷`, 'expense');
  };

  const handleDeleteExpense = (expenseId: string) => {
    const target = expenses.find((e) => e.id === expenseId);
    const updated = expenses.filter((e) => e.id !== expenseId);
    setExpenses(updated);
    StorageService.setExpenses(updated);
    logAction('删除账单', `删除了账目「${target?.title || '开销'}」`, 'expense');
  };

  // --- Cleaning actions ---
  const handleToggleDutyItem = (dutyId: string, itemIdx: number) => {
    const updated = duties.map((d) => {
      if (d.id === dutyId) {
        const nextList = [...d.checklist];
        nextList[itemIdx] = { ...nextList[itemIdx], done: !nextList[itemIdx].done };
        return { ...d, checklist: nextList };
      }
      return d;
    });
    setDuties(updated);
    StorageService.setDuties(updated);
  };

  const handleCompleteDuty = (dutyId: string, notes?: string) => {
    const updated = duties.map((d) => {
      if (d.id === dutyId) {
        return {
          ...d,
          status: 'completed' as const,
          completedAt: '2026-09-12 12:45',
          completedNotes: notes || '公区卫生保洁打卡完成',
          checklist: d.checklist.map((c) => ({ ...c, done: true })),
        };
      }
      return d;
    });
    setDuties(updated);
    StorageService.setDuties(updated);

    const targetDuty = duties.find((d) => d.id === dutyId);
    logAction('完成值日', `打卡完成了「${targetDuty?.areaName || '公区'}」保洁值日`, 'duty');
  };

  const handleOpenSwapModal = (duty: CleaningDuty) => {
    setSelectedSwapDuty(duty);
    setIsSwapDutyOpen(true);
  };

  const handleSubmitSwap = (targetDutyId: string, toId: string, reason: string) => {
    const updated = duties.map((d) => {
      if (d.id === targetDutyId) {
        return {
          ...d,
          swapRequest: {
            fromId: d.assigneeId,
            toId,
            reason,
            status: 'pending' as const,
          },
        };
      }
      return d;
    });
    setDuties(updated);
    StorageService.setDuties(updated);
    setIsSwapDutyOpen(false);
    setSelectedSwapDuty(null);

    const fromName = roommates.find((r) => r.id === currentUserId)?.name || '室友';
    const toName = roommates.find((r) => r.id === toId)?.name || '室友';
    logAction('换班申请', `${fromName} 向 ${toName} 提出了值日对调申请`, 'duty');
  };

  const handleRespondSwap = (dutyId: string, accept: boolean) => {
    const updated = duties.map((d) => {
      if (d.id === dutyId && d.swapRequest) {
        if (accept) {
          const originalAssignee = d.assigneeId;
          const newAssignee = d.swapRequest.toId;
          return {
            ...d,
            assigneeId: newAssignee,
            swapRequest: undefined,
          };
        } else {
          return {
            ...d,
            swapRequest: undefined,
          };
        }
      }
      return d;
    });
    setDuties(updated);
    StorageService.setDuties(updated);
    logAction('换班审批', accept ? '同意了值日换班' : '婉拒了值日换班', 'duty');
  };

  const handleGenerateWeeklyRoster = () => {
    const areas = [
      { area: 'kitchen' as const, name: '厨房与灶台' },
      { area: 'bathroom' as const, name: '公卫与淋浴间' },
      { area: 'living_room' as const, name: '客厅与玄关' },
      { area: 'balcony_trash' as const, name: '生活阳台与垃圾下楼' },
    ];
    const newDuties: CleaningDuty[] = [
      {
        id: `duty_gen_${Date.now()}_1`,
        area: 'kitchen',
        areaName: '厨房与灶台',
        assigneeId: roommates[0].id,
        date: '2026-09-14',
        dayOfWeek: '周一',
        status: 'pending',
        checklist: [
          { item: '清理灶台与油烟机表面油污', done: false },
          { item: '洗净水槽并清空沥水篮滤渣', done: false },
          { item: '灶台下厨余垃圾打包扎口', done: false },
        ],
      },
      {
        id: `duty_gen_${Date.now()}_2`,
        area: 'bathroom',
        areaName: '公卫与淋浴间',
        assigneeId: roommates[1].id,
        date: '2026-09-15',
        dayOfWeek: '周二',
        status: 'pending',
        checklist: [
          { item: '清理浴室地漏与洗手池毛发', done: false },
          { item: '洁厕剂刷洗马桶内外圈并消毒', done: false },
        ],
      },
      {
        id: `duty_gen_${Date.now()}_3`,
        area: 'living_room',
        areaName: '客厅与玄关',
        assigneeId: roommates[2].id,
        date: '2026-09-16',
        dayOfWeek: '周三',
        status: 'pending',
        checklist: [
          { item: '吸尘除尘并拖洗客厅地板', done: false },
          { item: '归整鞋柜与玄关快递盒', done: false },
        ],
      },
      {
        id: `duty_gen_${Date.now()}_4`,
        area: 'balcony_trash',
        areaName: '生活阳台与垃圾下楼',
        assigneeId: roommates[3].id,
        date: '2026-09-17',
        dayOfWeek: '周四',
        status: 'pending',
        checklist: [
          { item: '集中打包公区所有垃圾并投递到楼下', done: false },
          { item: '擦拭洗衣机胶圈及滤网', done: false },
        ],
      },
    ];
    const updated = [...duties, ...newDuties];
    setDuties(updated);
    StorageService.setDuties(updated);
    logAction('排班轮转', '系统智能生成了新一周轮转保洁排班', 'duty');
  };

  // --- Supplies actions ---
  const handleAddSupply = (newItem: Omit<SharedItem, 'id' | 'lastPurchasedDate'>) => {
    const newSupply: SharedItem = {
      ...newItem,
      id: `sup_${Date.now()}`,
      lastPurchasedDate: '2026-09-12',
    };
    const updated = [newSupply, ...supplies];
    setSupplies(updated);
    StorageService.setSupplies(updated);
    logAction('登记公用物资', `登记了新物资「${newSupply.name}」`, 'supply');
  };

  const handleUpdateStockLevel = (itemId: string, level: StockLevel, desc: string) => {
    const updated = supplies.map((s) => {
      if (s.id === itemId) {
        return {
          ...s,
          stockLevel: level,
          quantityDescription: desc,
        };
      }
      return s;
    });
    setSupplies(updated);
    StorageService.setSupplies(updated);
  };

  const handleInitiateRestock = (item: SharedItem) => {
    setExpensePrefill({
      title: `补货采购：${item.name}`,
      amount: item.estimatedPrice,
      category: 'supplies',
      note: `补充公共存放物资（原存放：${item.location}）`,
    });
    setIsAddExpenseOpen(true);
    const updated = supplies.map((s) => {
      if (s.id === item.id) {
        return {
          ...s,
          stockLevel: 'plenty' as const,
          quantityDescription: '已完成采购补货，存量充足',
          lastPurchasedBy: currentUserId,
          lastPurchasedDate: '2026-09-12',
        };
      }
      return s;
    });
    setSupplies(updated);
    StorageService.setSupplies(updated);
  };

  const handleDeleteSupply = (itemId: string) => {
    const updated = supplies.filter((s) => s.id !== itemId);
    setSupplies(updated);
    StorageService.setSupplies(updated);
  };

  // --- Pact & Proposal actions ---
  const handleAddProposal = (
    propData: Omit<RuleProposal, 'id' | 'createdAt' | 'votesFor' | 'votesAgainst' | 'status'>
  ) => {
    const newProp: RuleProposal = {
      ...propData,
      id: `prop_${Date.now()}`,
      createdAt: '2026-09-12 14:00',
      votesFor: [currentUserId],
      votesAgainst: [],
      status: 'voting',
    };
    const updated = [newProp, ...proposals];
    setProposals(updated);
    StorageService.setProposals(updated);
    logAction('公约提案', `发起了新公约提案「${propData.title}」`, 'pact');
  };

  const handleVoteProposal = (proposalId: string, agree: boolean) => {
    const updated = proposals.map((p) => {
      if (p.id === proposalId) {
        let nextFor = p.votesFor.filter((id) => id !== currentUserId);
        let nextAgainst = p.votesAgainst.filter((id) => id !== currentUserId);

        if (agree) {
          nextFor.push(currentUserId);
        } else {
          nextAgainst.push(currentUserId);
        }

        const passed = nextFor.length >= 3;

        return {
          ...p,
          votesFor: nextFor,
          votesAgainst: nextAgainst,
          status: passed ? ('passed' as const) : ('voting' as const),
        };
      }
      return p;
    });

    setProposals(updated);
    StorageService.setProposals(updated);

    const targetProp = updated.find((p) => p.id === proposalId);
    if (targetProp && targetProp.status === 'passed') {
      const newRule: HouseRule = {
        id: `pact_from_prop_${Date.now()}`,
        title: targetProp.title,
        category: 'general',
        description: targetProp.description,
        iconName: 'Sparkles',
        penaltyOrNote: '该条目由全员民主公投表决通过生效。',
        agreedBy: targetProp.votesFor,
        createdAt: '2026-09-12',
      };
      const updatedRules = [...pacts, newRule];
      setPacts(updatedRules);
      StorageService.setPacts(updatedRules);
      logAction('公约生效', `公约提案「${targetProp.title}」高票通过并正式生效！`, 'pact');
    }
  };

  const handleTogglePactAgreement = (pactId: string) => {
    const updated = pacts.map((p) => {
      if (p.id === pactId) {
        const has = p.agreedBy.includes(currentUserId);
        return {
          ...p,
          agreedBy: has
            ? p.agreedBy.filter((id) => id !== currentUserId)
            : [...p.agreedBy, currentUserId],
        };
      }
      return p;
    });
    setPacts(updated);
    StorageService.setPacts(updated);
  };

  // --- Reminders actions (Legacy) ---
  const handleAddReminder = (
    remData: Omit<GentleReminder, 'id' | 'createdAt' | 'likes' | 'resolved'>
  ) => {
    const newRem: GentleReminder = {
      ...remData,
      id: `rem_${Date.now()}`,
      createdAt: '2026-09-12 14:15',
      likes: [],
      resolved: false,
    };
    const updated = [newRem, ...reminders];
    setReminders(updated);
    StorageService.setReminders(updated);
    logAction('贴便签', `在非暴力沟通墙贴出了一张新生活便签`, 'pact');
  };

  const handleLikeReminder = (reminderId: string) => {
    const updated = reminders.map((r) => {
      if (r.id === reminderId) {
        const has = r.likes.includes(currentUserId);
        return {
          ...r,
          likes: has ? r.likes.filter((id) => id !== currentUserId) : [...r.likes, currentUserId],
        };
      }
      return r;
    });
    setReminders(updated);
    StorageService.setReminders(updated);
  };

  const handleResolveReminder = (reminderId: string) => {
    const updated = reminders.map((r) => {
      if (r.id === reminderId) {
        return { ...r, resolved: true };
      }
      return r;
    });
    setReminders(updated);
    StorageService.setReminders(updated);
  };

  // --- 附加1: Dedicated Message Board actions ---
  const handleAddMessage = (newMsgData: Omit<MessagePost, 'id' | 'createdAt' | 'likes'>) => {
    const newPost: MessagePost = {
      ...newMsgData,
      id: `msg_${Date.now()}`,
      createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      likes: [],
      replies: [],
    };
    const updated = [newPost, ...messages];
    setMessages(updated);
    StorageService.setMessages(updated);
    logAction('发布留言', `在室友留言板发表了一条新动态`, 'message');
  };

  const handleLikeMessage = (id: string) => {
    const updated = messages.map((m) => {
      if (m.id === id) {
        const hasLiked = m.likes.includes(currentUserId);
        return {
          ...m,
          likes: hasLiked
            ? m.likes.filter((uid) => uid !== currentUserId)
            : [...m.likes, currentUserId],
        };
      }
      return m;
    });
    setMessages(updated);
    StorageService.setMessages(updated);
  };

  const handleToggleResolveMessage = (id: string) => {
    const updated = messages.map((m) => {
      if (m.id === id) {
        return { ...m, isResolved: !m.isResolved };
      }
      return m;
    });
    setMessages(updated);
    StorageService.setMessages(updated);
  };

  const handleAddReply = (messageId: string, replyContent: string) => {
    const updated = messages.map((m) => {
      if (m.id === messageId) {
        const newReply = {
          id: `rep_${Date.now()}`,
          authorId: currentUserId,
          content: replyContent,
          createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        };
        return {
          ...m,
          replies: [...(m.replies || []), newReply],
        };
      }
      return m;
    });
    setMessages(updated);
    StorageService.setMessages(updated);
  };

  // --- Admin actions ---
  const handleUpdateHouseInfo = (info: HouseInfo) => {
    setHouseInfo(info);
    StorageService.setHouseInfo(info);
    logAction('更新房屋档案', '修改了房屋核心档案或全屋公告内容', 'admin');
  };

  const handleUpdateRoommates = (updated: Roommate[]) => {
    setRoommates(updated);
    StorageService.setRoommates(updated);
    logAction('更新成员权限', '调整了室友名册或房管权限分配', 'admin');
  };

  const handleUpdateRooms = (updatedRooms: RoomProfile[]) => {
    setRooms(updatedRooms);
    StorageService.setRooms(updatedRooms);
    logAction('更新房间配置', '修改了卧室资产或租金基准表', 'room');
  };

  const handleResetData = () => {
    StorageService.resetToInitialData();
    setRoommates(StorageService.getRoommates());
    setExpenses(StorageService.getExpenses());
    setDuties(StorageService.getDuties());
    setSupplies(StorageService.getSupplies());
    setPacts(StorageService.getPacts());
    setProposals(StorageService.getProposals());
    setReminders(StorageService.getReminders());
    setHouseInfo(StorageService.getHouseInfo());
    setRooms(StorageService.getRooms());
    setMessages(StorageService.getMessages());
    setAuditLogs(StorageService.getAuditLogs());
    setCurrentUserId('user_1');
  };

  // Calculate top badge numbers
  const urgentSuppliesCount = supplies.filter(
    (s) => s.stockLevel === 'empty' || s.stockLevel === 'low'
  ).length;
  const { simplifiedDebts } = calculateNetDebts(expenses, roommates);
  const unsettledDebtsCount = simplifiedDebts.length;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-[#2C2218] dark:text-[#F5F5F4] font-sans pb-16 transition-colors selection:bg-[#E8DDCB] dark:selection:bg-stone-700">
      {/* Header */}
      <Header
        houseInfo={houseInfo}
        roommates={roommates}
        currentUserId={currentUserId}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingDutiesCount={duties.filter((d) => d.status === 'pending').length}
        urgentSuppliesCount={urgentSuppliesCount}
        unsettledDebtsCount={unsettledDebtsCount}
        messagesCount={messages.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        lang={lang}
        onToggleLang={toggleLang}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <OverviewTab
            houseInfo={houseInfo}
            roommates={roommates}
            currentUserId={currentUserId}
            expenses={expenses}
            duties={duties}
            supplies={supplies}
            proposals={proposals}
            reminders={reminders}
            onNavigateTab={setActiveTab}
            onOpenAddExpense={() => {
              setExpensePrefill(undefined);
              setIsAddExpenseOpen(true);
            }}
            onOpenAddSupply={() => setIsAddSupplyOpen(true)}
            onOpenNewProposal={() => setIsNewProposalOpen(true)}
            onOpenPostReminder={() => setIsPostReminderOpen(true)}
            onToggleDutyItem={handleToggleDutyItem}
            onCompleteDuty={(dutyId) => handleCompleteDuty(dutyId)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            roommates={roommates}
            expenses={expenses}
            currentUserId={currentUserId}
            onOpenAddExpense={() => {
              setExpensePrefill(undefined);
              setIsAddExpenseOpen(true);
            }}
            onSettleSplit={handleSettleSplit}
            onDeleteExpense={handleDeleteExpense}
            onSettleAllBetween={handleSettleAllBetween}
          />
        )}

        {activeTab === 'cleaning' && (
          <CleaningTab
            roommates={roommates}
            duties={duties}
            currentUserId={currentUserId}
            onToggleDutyItem={handleToggleDutyItem}
            onCompleteDuty={handleCompleteDuty}
            onRequestSwap={handleOpenSwapModal}
            onRespondSwap={handleRespondSwap}
            onGenerateWeeklyRoster={handleGenerateWeeklyRoster}
          />
        )}

        {activeTab === 'supplies' && (
          <SuppliesTab
            roommates={roommates}
            supplies={supplies}
            currentUserId={currentUserId}
            onOpenAddSupply={() => setIsAddSupplyOpen(true)}
            onUpdateStockLevel={handleUpdateStockLevel}
            onInitiateRestock={handleInitiateRestock}
            onDeleteSupply={handleDeleteSupply}
          />
        )}

        {activeTab === 'pacts' && (
          <PactTab
            roommates={roommates}
            pacts={pacts}
            proposals={proposals}
            reminders={reminders}
            currentUserId={currentUserId}
            onOpenNewProposal={() => setIsNewProposalOpen(true)}
            onOpenPostReminder={() => setIsPostReminderOpen(true)}
            onVoteProposal={handleVoteProposal}
            onTogglePactAgreement={handleTogglePactAgreement}
            onLikeReminder={handleLikeReminder}
            onResolveReminder={handleResolveReminder}
          />
        )}

        {/* 附加1: 留言板功能 */}
        {activeTab === 'messages' && (
          <MessageBoardTab
            messages={messages}
            roommates={roommates}
            currentUserId={currentUserId}
            lang={lang}
            onAddMessage={handleAddMessage}
            onLikeMessage={handleLikeMessage}
            onToggleResolveMessage={handleToggleResolveMessage}
            onAddReply={handleAddReply}
          />
        )}

        {/* 问题3: 完整的房管后台 */}
        {activeTab === 'admin' && (
          <AdminTab
            houseInfo={houseInfo}
            roommates={roommates}
            rooms={rooms}
            expenses={expenses}
            duties={duties}
            supplies={supplies}
            auditLogs={auditLogs}
            currentUserId={currentUserId}
            lang={lang}
            onUpdateHouseInfo={handleUpdateHouseInfo}
            onUpdateRoommates={handleUpdateRoommates}
            onUpdateRooms={handleUpdateRooms}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setExpensePrefill(undefined);
        }}
        roommates={roommates}
        currentUserId={currentUserId}
        onAddExpense={handleAddExpense}
        prefill={expensePrefill}
      />

      <AddSupplyModal
        isOpen={isAddSupplyOpen}
        onClose={() => setIsAddSupplyOpen(false)}
        roommates={roommates}
        currentUserId={currentUserId}
        onAddSupply={handleAddSupply}
      />

      <NewProposalModal
        isOpen={isNewProposalOpen}
        onClose={() => setIsNewProposalOpen(false)}
        roommates={roommates}
        currentUserId={currentUserId}
        onAddProposal={handleAddProposal}
      />

      <SwapDutyModal
        isOpen={isSwapDutyOpen}
        onClose={() => {
          setIsSwapDutyOpen(false);
          setSelectedSwapDuty(null);
        }}
        duty={selectedSwapDuty}
        roommates={roommates}
        currentUserId={currentUserId}
        onSubmitSwap={handleSubmitSwap}
      />

      <PostReminderModal
        isOpen={isPostReminderOpen}
        onClose={() => setIsPostReminderOpen(false)}
        roommates={roommates}
        currentUserId={currentUserId}
        onAddReminder={handleAddReminder}
      />
    </div>
  );
}
