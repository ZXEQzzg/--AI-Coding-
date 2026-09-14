export interface Roommate {
  id: string;
  name: string;
  avatar: string;
  roomName: string;
  roomArea: number; // in sq meters
  rentBase: number; // monthly rent in RMB
  deposit: number; // deposit paid
  phone: string;
  emergencyContact: string;
  role: 'admin' | 'member';
  joinedDate: string;
  jobOrMajor: string; // e.g., "前端开发 / 24届校招", "交互设计 / 24届校招"
}

export type ExpenseCategory = 
  | 'rent' // 房屋租金
  | 'electricity' // 电费
  | 'water_gas' // 水费/燃气费
  | 'internet' // 宽带网络
  | 'supplies' // 公共物资
  | 'maintenance' // 维修耗材
  | 'other'; // 其他支出

export type SplitMethod = 'equal' | 'by_area' | 'custom_shares' | 'exact_amounts';

export interface SplitShare {
  roommateId: string;
  amount: number;
  isPaid: boolean;
  settledAt?: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  payerId: string;
  date: string;
  splitMethod: SplitMethod;
  splits: SplitShare[];
  note?: string;
  receiptImage?: string;
  isFullySettled: boolean;
  createdAt: string;
}

export interface SimplifiedDebt {
  fromId: string;
  toId: string;
  amount: number;
}

export interface CleaningDuty {
  id: string;
  area: 'kitchen' | 'bathroom' | 'living_room' | 'balcony_trash';
  areaName: string;
  assigneeId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  status: 'pending' | 'completed' | 'swapped';
  completedAt?: string;
  completedNotes?: string;
  checklist: { item: string; done: boolean }[];
  swapRequest?: {
    fromId: string;
    toId: string;
    reason: string;
    targetDutyId?: string;
    status: 'pending' | 'accepted' | 'declined';
  };
}

export type StockLevel = 'plenty' | 'low' | 'empty';

export interface SharedItem {
  id: string;
  name: string;
  category: 'cleaning' | 'daily' | 'kitchen' | 'bathroom';
  stockLevel: StockLevel;
  quantityDescription: string; // e.g. "余 2 卷", "剩 1/4 瓶"
  lastPurchasedBy: string;
  lastPurchasedDate: string;
  estimatedPrice: number;
  minWarningThreshold: string;
  notes?: string;
  location: string; // e.g. "水槽下方置物架"
}

export interface HouseRule {
  id: string;
  title: string;
  category: 'quiet_hours' | 'hygiene' | 'visitors' | 'energy' | 'pets_smoking' | 'general';
  description: string;
  iconName: string;
  penaltyOrNote?: string;
  agreedBy: string[]; // roommateIds
  createdAt: string;
}

export interface RuleProposal {
  id: string;
  creatorId: string;
  title: string;
  category: string;
  description: string;
  createdAt: string;
  votesFor: string[];
  votesAgainst: string[];
  status: 'voting' | 'passed' | 'rejected';
}

export interface GentleReminder {
  id: string;
  fromId?: string; // optional for anonymous
  isAnonymous: boolean;
  target: 'all' | string; // 'all' or specific roommateId
  category: 'noise' | 'cleanliness' | 'lights_ac' | 'supplies' | 'praise';
  message: string;
  createdAt: string;
  likes: string[];
  resolved: boolean;
}

export interface MessagePost {
  id: string;
  authorId?: string; // undefined if anonymous
  isAnonymous: boolean;
  category: 'chat' | 'reminder' | 'praise' | 'borrow' | 'notice';
  content: string;
  createdAt: string;
  likes: string[];
  isResolved?: boolean;
  tags?: string[];
  replies?: {
    id: string;
    authorId: string;
    content: string;
    createdAt: string;
  }[];
}

export interface RoomProfile {
  id: string;
  name: string;
  area: number; // sq.m
  monthlyRent: number;
  deposit: number;
  occupantId?: string;
  orientation: string; // e.g. '朝南大窗', '静谧朝北'
  features: string[]; // e.g. ['独立卫生间', '落地大窗', '实木衣柜']
  status: 'occupied' | 'vacant';
}

export interface HouseInfo {
  houseName: string;
  community: string;
  unit: string;
  layout: string;
  leaseStartDate: string;
  leaseEndDate: string;
  landlordName: string;
  landlordPhone: string;
  propertyManagerPhone: string;
  wifiSsid: string;
  wifiPassword: string;
  gasMeterNumber: string;
  electricMeterNumber: string;
  totalMonthlyRent: number;
  announcement: {
    title: string;
    content: string;
    publishedBy: string;
    updatedAt: string;
    isPinned: boolean;
  };
}

export interface AuditLog {
  id: string;
  operatorId: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'expense' | 'duty' | 'supply' | 'pact' | 'admin' | 'room' | 'message';
}
