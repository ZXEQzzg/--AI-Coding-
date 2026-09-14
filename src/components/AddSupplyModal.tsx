import React, { useState } from 'react';
import { Roommate, SharedItem, StockLevel } from '../types';
import { Language, i18n, formatSupplyCategory } from '../utils/i18n';
import { X, Package } from 'lucide-react';

interface AddSupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommates: Roommate[];
  currentUserId: string;
  lang: Language;
  onAddSupply: (item: Omit<SharedItem, 'id'>) => void;
}

export const AddSupplyModal: React.FC<AddSupplyModalProps> = ({
  isOpen,
  onClose,
  roommates,
  currentUserId,
  lang,
  onAddSupply,
}) => {
  if (!isOpen) return null;

  const t = i18n[lang];

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'cleaning' | 'daily' | 'kitchen' | 'bathroom'>('daily');
  const [stockLevel, setStockLevel] = useState<StockLevel>('plenty');
  const [quantityDescription, setQuantityDescription] = useState('余 1 大瓶');
  const [estimatedPrice, setEstimatedPrice] = useState('25');
  const [location, setLocation] = useState('玄关公共置物架');
  const [minWarningThreshold, setMinWarningThreshold] = useState('少于 1/4');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddSupply({
      name: name.trim(),
      category,
      stockLevel,
      quantityDescription: quantityDescription.trim() || '余量正常',
      lastPurchasedBy: currentUserId,
      lastPurchasedDate: '2026-09-12',
      estimatedPrice: parseFloat(estimatedPrice) || 20,
      minWarningThreshold: minWarningThreshold.trim() || '少于 1 个',
      location: location.trim() || '公共置物区',
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#292524] rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E8E1D5] dark:border-stone-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] dark:border-stone-700">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 text-[#8B5E3C] dark:text-amber-400">
              <Package className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-[#2C2218] dark:text-[#F5F5F4]">{t.addSupplyModalTitle}</h3>
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
              {t.supplyNameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.supplyNamePlaceholder}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                {t.supplyCategoryLabel}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
              >
                <option value="daily">{formatSupplyCategory('daily', lang)}</option>
                <option value="bathroom">{formatSupplyCategory('bathroom', lang)}</option>
                <option value="kitchen">{formatSupplyCategory('kitchen', lang)}</option>
                <option value="cleaning">{formatSupplyCategory('cleaning', lang)}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                {t.stockStatusLabel}
              </label>
              <select
                value={stockLevel}
                onChange={(e) => setStockLevel(e.target.value as StockLevel)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
              >
                <option value="plenty">{t.stockLevelPlenty}</option>
                <option value="low">{t.stockLevelLow}</option>
                <option value="empty">{t.stockLevelEmpty}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                {t.quantityRemainingLabel}
              </label>
              <input
                type="text"
                value={quantityDescription}
                onChange={(e) => setQuantityDescription(e.target.value)}
                placeholder="例：剩 2 卷、余半瓶..."
                className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
                {t.estimatedPriceLabel}
              </label>
              <input
                type="number"
                step="0.1"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="25.0"
                className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
              {t.storageLocationLabel}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例：次卧洗手间镜柜下层、水槽下方置物篮..."
              className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D5] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 text-[#2C2218] dark:text-stone-100 focus:outline-hidden focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#796B5B] dark:text-stone-300 mb-1">
              {t.notesOptionalLabel}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例：尽量买无香款，大家不易过敏..."
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
              id="submit-supply-btn"
              className="px-5 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#724A2D] text-white text-xs font-semibold shadow-xs"
            >
              {t.saveSupplyBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
