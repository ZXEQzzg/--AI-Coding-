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
} from '../types';
import {
  INITIAL_ROOMMATES,
  INITIAL_EXPENSES,
  INITIAL_DUTIES,
  INITIAL_SUPPLIES,
  INITIAL_PACTS,
  INITIAL_PROPOSALS,
  INITIAL_REMINDERS,
  INITIAL_HOUSE_INFO,
  INITIAL_AUDIT_LOGS,
  INITIAL_ROOMS,
  INITIAL_MESSAGES,
} from '../data/initialData';

const STORAGE_KEYS = {
  ROOMMATES: 'coliving_roommates_v1',
  EXPENSES: 'coliving_expenses_v1',
  DUTIES: 'coliving_duties_v1',
  SUPPLIES: 'coliving_supplies_v1',
  PACTS: 'coliving_pacts_v1',
  PROPOSALS: 'coliving_proposals_v1',
  REMINDERS: 'coliving_reminders_v1',
  HOUSE_INFO: 'coliving_house_info_v1',
  AUDIT_LOGS: 'coliving_audit_logs_v1',
  ROOMS: 'coliving_rooms_v1',
  MESSAGES: 'coliving_messages_v1',
  CURRENT_USER_ID: 'coliving_current_user_id_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

export const StorageService = {
  getRoommates: (): Roommate[] => safeGet(STORAGE_KEYS.ROOMMATES, INITIAL_ROOMMATES),
  setRoommates: (data: Roommate[]) => safeSet(STORAGE_KEYS.ROOMMATES, data),

  getExpenses: (): ExpenseRecord[] => safeGet(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES),
  setExpenses: (data: ExpenseRecord[]) => safeSet(STORAGE_KEYS.EXPENSES, data),

  getDuties: (): CleaningDuty[] => safeGet(STORAGE_KEYS.DUTIES, INITIAL_DUTIES),
  setDuties: (data: CleaningDuty[]) => safeSet(STORAGE_KEYS.DUTIES, data),

  getSupplies: (): SharedItem[] => safeGet(STORAGE_KEYS.SUPPLIES, INITIAL_SUPPLIES),
  setSupplies: (data: SharedItem[]) => safeSet(STORAGE_KEYS.SUPPLIES, data),

  getPacts: (): HouseRule[] => safeGet(STORAGE_KEYS.PACTS, INITIAL_PACTS),
  setPacts: (data: HouseRule[]) => safeSet(STORAGE_KEYS.PACTS, data),

  getProposals: (): RuleProposal[] => safeGet(STORAGE_KEYS.PROPOSALS, INITIAL_PROPOSALS),
  setProposals: (data: RuleProposal[]) => safeSet(STORAGE_KEYS.PROPOSALS, data),

  getReminders: (): GentleReminder[] => safeGet(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS),
  setReminders: (data: GentleReminder[]) => safeSet(STORAGE_KEYS.REMINDERS, data),

  getHouseInfo: (): HouseInfo => safeGet(STORAGE_KEYS.HOUSE_INFO, INITIAL_HOUSE_INFO),
  setHouseInfo: (data: HouseInfo) => safeSet(STORAGE_KEYS.HOUSE_INFO, data),

  getRooms: (): RoomProfile[] => safeGet(STORAGE_KEYS.ROOMS, INITIAL_ROOMS),
  setRooms: (data: RoomProfile[]) => safeSet(STORAGE_KEYS.ROOMS, data),

  getMessages: (): MessagePost[] => safeGet(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES),
  setMessages: (data: MessagePost[]) => safeSet(STORAGE_KEYS.MESSAGES, data),

  getAuditLogs: (): AuditLog[] => safeGet(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  setAuditLogs: (data: AuditLog[]) => safeSet(STORAGE_KEYS.AUDIT_LOGS, data),

  getCurrentUserId: (): string => safeGet(STORAGE_KEYS.CURRENT_USER_ID, 'user_1'),
  setCurrentUserId: (id: string) => safeSet(STORAGE_KEYS.CURRENT_USER_ID, id),

  resetToInitialData: () => {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error('Reset error:', e);
    }
  },
};
