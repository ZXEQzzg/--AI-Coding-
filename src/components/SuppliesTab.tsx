import React, { useState } from 'react';
import { Roommate, SharedItem, StockLevel } from '../types';
import { Language, i18n, formatSupplyCategory } from '../utils/i18n';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  ShoppingCart,
  BellRing,
  MapPin,
  Search,
  Check,
  Trash2,
} from 'lucide-react';

interface SuppliesTabProps {
  roommates: Roommate[];
  supplies: SharedItem[];
  currentUserId: string;
  lang: Language;
  onOpenAddSupply: () => void;
  onUpdateStockLevel: (itemId: string, level: StockLevel, desc: string) => void;
  onInitiateRestock: (item: SharedItem) => void;
  onDeleteSupply: (itemId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  bathroom: 'bg-blue-50 text-blue-700 border-blue-200',
  cleaning: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  daily: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  kitchen: 'bg-amber-50 text-amber-700 border-amber-200',
};

export const SuppliesTab: React.FC<SuppliesTabProps> = ({
  roommates,
  supplies,
  lang,
  onOpenAddSupply,
  onUpdateStockLevel,
  onInitiateRestock,
  onDeleteSupply,
}) => {
  const t = i18n[lang];
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [reminderSentId, setReminderSentId] = useState<string | null>(null);

  const filteredSupplies = supplies.filter((s) => {
    if (filterCategory !== 'all' && s.category !== filterCategory) return false;
    if (filterStock !== 'all' && s.stockLevel !== filterStock) return false;
    if (
      search &&
      !s.name.toLowerCase().includes(search.toLowerCase()) &&
      !s.notes?.toLowerCase().includes(search.toLowerCase()) &&
      !s.location.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const emptyCount = supplies.filter((s) => s.stockLevel === 'empty').length;
  const lowCount = supplies.filter((s) => s.stockLevel === 'low').length;

  const handleSendReminder = (item: SharedItem) => {
    const text = lang === 'en'
      ? `[Shared Supply Reminder] Hi roommates, our shared item "${item.name}" is currently ${
          item.stockLevel === 'empty' ? 'completely out of stock' : 'running low (' + item.quantityDescription + ')'
        }. Location: ${item.location}. Whoever goes shopping please help restock and log it for AA split!`
      : `【合租公共物资提醒】室友们好，我们合租屋的「${item.name}」目前${
          item.stockLevel === 'empty' ? '已全部耗尽' : '储备告急（' + item.quantityDescription + '）'
        }。存放位置：${item.location}。近期去超市或网购的室友顺便帮忙补货，买完直接录入AA分摊哦~`;

    navigator.clipboard.writeText(text);
    setReminderSentId(item.id);
    setTimeout(() => setReminderSentId(null), 2500);
  };

  const categoriesList = ['bathroom', 'cleaning', 'daily', 'kitchen'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E1D5] dark:border-stone-700">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#2C2218] dark:text-[#F5F5F4]">{t.suppliesTabTitle}</h2>
              <span className="text-xs bg-[#FAF7F2] dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 px-2.5 py-0.5 rounded-full border border-[#E8E1D5] dark:border-stone-700 font-medium">
                {t.suppliesTabSub}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#796B5B] dark:text-stone-400 mt-1">
              {t.suppliesTabDesc}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="add-supply-btn"
              onClick={onOpenAddSupply}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.registerNewItem}</span>
            </button>
          </div>
        </div>

        {/* Stock Level Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">{t.outOfStockBadge}</span>
              <div className="text-2xl font-bold text-rose-800 dark:text-rose-200 mt-0.5">
                {emptyCount} <span className="text-xs font-normal">{t.itemUnit}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-700 dark:text-rose-300">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">{t.lowStockBadge}</span>
              <div className="text-2xl font-bold text-amber-800 dark:text-amber-200 mt-0.5">
                {lowCount} <span className="text-xs font-normal">{t.itemUnit}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">{t.plentyStockBadge}</span>
              <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">
                {supplies.length - emptyCount - lowCount} <span className="text-xs font-normal">{t.itemUnit}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#292524] rounded-2xl p-5 sm:p-6 border border-[#E8E1D5] dark:border-stone-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchSupplyPlaceholder}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 text-xs bg-[#FAF7F2] dark:bg-stone-800 text-[#2C2218] dark:text-stone-100 focus:bg-white dark:focus:bg-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#8B5E3C] w-52 sm:w-64"
              />
            </div>

            {/* Stock status filter */}
            <div className="flex rounded-xl bg-[#FAF7F2] dark:bg-stone-800 p-0.5 text-xs font-medium text-[#796B5B] dark:text-stone-300 border border-[#E8E1D5] dark:border-stone-700">
              <button
                type="button"
                onClick={() => setFilterStock('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterStock === 'all' ? 'bg-white dark:bg-stone-700 text-[#2C2218] dark:text-stone-100 shadow-2xs font-semibold' : ''
                }`}
              >
                {t.allStatus}
              </button>
              <button
                type="button"
                onClick={() => setFilterStock('empty')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterStock === 'empty' ? 'bg-white dark:bg-stone-700 text-[#2C2218] dark:text-stone-100 shadow-2xs font-semibold' : ''
                }`}
              >
                {t.filterEmpty}
              </button>
              <button
                type="button"
                onClick={() => setFilterStock('low')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterStock === 'low' ? 'bg-white dark:bg-stone-700 text-[#2C2218] dark:text-stone-100 shadow-2xs font-semibold' : ''
                }`}
              >
                {t.filterLow}
              </button>
              <button
                type="button"
                onClick={() => setFilterStock('plenty')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterStock === 'plenty' ? 'bg-white dark:bg-stone-700 text-[#2C2218] dark:text-stone-100 shadow-2xs font-semibold' : ''
                }`}
              >
                {t.filterPlenty}
              </button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                filterCategory === 'all'
                  ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                  : 'bg-white dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#FAF7F2] dark:hover:bg-stone-700'
              }`}
            >
              {t.allCategories}
            </button>
            {categoriesList.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilterCategory(k)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  filterCategory === k
                    ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                    : 'bg-white dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#FAF7F2] dark:hover:bg-stone-700'
                }`}
              >
                {formatSupplyCategory(k, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {filteredSupplies.length === 0 ? (
          <div className="py-12 text-center text-stone-400 dark:text-stone-500 text-sm">
            {t.noSuppliesFound}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {filteredSupplies.map((item) => {
              const purchaser = roommates.find((r) => r.id === item.lastPurchasedBy);
              const colorClass = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.daily;
              const catLabel = formatSupplyCategory(item.category, lang);

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    item.stockLevel === 'empty'
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                      : item.stockLevel === 'low'
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                      : 'bg-[#FAF7F2]/60 dark:bg-stone-800/40 border-[#E8E1D5] dark:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.2 rounded-full border ${colorClass} dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300`}
                        >
                          {catLabel}
                        </span>
                        {item.stockLevel === 'empty' && (
                          <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            🚨 {t.outOfStockAlert}
                          </span>
                        )}
                        {item.stockLevel === 'low' && (
                          <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            ⚠️ {t.runningLowAlert}
                          </span>
                        )}
                        {item.stockLevel === 'plenty' && (
                          <span className="text-[11px] font-medium px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            ✓ {t.plentyAlert}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-[#2C2218] dark:text-stone-100 text-sm sm:text-base mt-1.5">
                        {item.name}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteSupply(item.id)}
                      className="text-stone-300 dark:text-stone-600 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                      title={t.deleteSupplyTooltip}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Stock quantity description */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-[#E8E1D5] dark:border-stone-700 text-xs">
                    <div className="flex items-center justify-between text-[#796B5B] dark:text-stone-400">
                      <span>{t.estimatedRemaining}</span>
                      <span className="font-semibold text-[#2C2218] dark:text-stone-200">{item.quantityDescription}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#796B5B] dark:text-stone-400 mt-1">
                      <span>{t.storageLocation}</span>
                      <span className="text-[#2C2218] dark:text-stone-300 flex items-center">
                        <MapPin className="w-3 h-3 text-[#8B5E3C] dark:text-amber-400 mr-1" />
                        {item.location}
                      </span>
                    </div>
                  </div>

                  {/* Roommate Purchase History */}
                  <div className="mt-2.5 text-xs text-[#796B5B] dark:text-stone-400 flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center space-x-1.5">
                      <span>{t.lastPurchasedBy}</span>
                      <img
                        src={purchaser?.avatar}
                        alt={purchaser?.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <strong className="text-[#2C2218] dark:text-stone-200">{purchaser?.name}</strong>
                    </div>
                    <span>
                      {t.purchaseDate}{item.lastPurchasedDate} ({t.refPrice} ¥{item.estimatedPrice})
                    </span>
                  </div>

                  {item.notes && (
                    <div className="mt-2 text-[11px] text-[#796B5B] dark:text-stone-400 bg-[#FAF7F2] dark:bg-stone-800/80 p-1.5 rounded-md border border-[#E8E1D5] dark:border-stone-700">
                      💡 {t.purchaseTip}{item.notes}
                    </div>
                  )}

                  {/* Interactive Quick Status Toggle & Restock Actions */}
                  <div className="mt-4 pt-3 border-t border-[#E8E1D5] dark:border-stone-700 flex flex-wrap items-center justify-between gap-2">
                    {/* Change status pills */}
                    <div className="flex items-center space-x-1">
                      <span className="text-[11px] text-[#796B5B] dark:text-stone-400 mr-1">{t.updateStock}</span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStockLevel(item.id, 'plenty', lang === 'en' ? 'Well stocked' : '剩余充足')
                        }
                        className={`text-[10px] px-2 py-1 rounded-md border ${
                          item.stockLevel === 'plenty'
                            ? 'bg-emerald-700 text-white border-emerald-700 font-medium'
                            : 'bg-white dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#FAF7F2] dark:hover:bg-stone-700'
                        }`}
                      >
                        {t.statusPlenty}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStockLevel(item.id, 'low', lang === 'en' ? 'Running low' : '仅剩最后少量')
                        }
                        className={`text-[10px] px-2 py-1 rounded-md border ${
                          item.stockLevel === 'low'
                            ? 'bg-amber-600 text-white border-amber-600 font-medium'
                            : 'bg-white dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#FAF7F2] dark:hover:bg-stone-700'
                        }`}
                      >
                        {t.statusLow}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStockLevel(item.id, 'empty', lang === 'en' ? 'Completely empty' : '已全部用光')
                        }
                        className={`text-[10px] px-2 py-1 rounded-md border ${
                          item.stockLevel === 'empty'
                            ? 'bg-rose-600 text-white border-rose-600 font-medium'
                            : 'bg-white dark:bg-stone-800 text-[#796B5B] dark:text-stone-300 border-[#E8E1D5] dark:border-stone-700 hover:bg-[#FAF7F2] dark:hover:bg-stone-700'
                        }`}
                      >
                        {t.statusEmpty}
                      </button>
                    </div>

                    {/* Restock & Remind actions */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleSendReminder(item)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-[#E8E1D5] dark:border-stone-700 hover:bg-[#FAF7F2] dark:hover:bg-stone-700 text-[#796B5B] dark:text-stone-200 font-medium flex items-center space-x-1"
                        title={t.remindRoommateTooltip}
                      >
                        {reminderSentId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">{t.reminderCopied}</span>
                          </>
                        ) : (
                          <>
                            <BellRing className="w-3.5 h-3.5 text-[#8B5E3C] dark:text-amber-400" />
                            <span className="text-[11px]">{t.remindRoommate}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        id={`restock-${item.id}`}
                        onClick={() => onInitiateRestock(item)}
                        className="px-3 py-1 text-xs rounded-lg bg-[#8B5E3C] hover:bg-[#724A2D] text-white font-semibold flex items-center space-x-1 shadow-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{t.boughtAndRecord}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
