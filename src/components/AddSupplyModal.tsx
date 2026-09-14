import React, { useState } from 'react';
import { Roommate, SharedItem, StockLevel } from '../types';
import { X, Package } from 'lucide-react';

interface AddSupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  roommates: Roommate[];
  currentUserId: string;
  onAddSupply: (item: Omit<SharedItem, 'id'>) => void;
}

export const AddSupplyModal: React.FC<AddSupplyModalProps> = ({
  isOpen,
  onClose,
  roommates,
  currentUserId,
  onAddSupply,
}) => {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-stone-100 text-stone-900">
              <Package className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900">登记公共物资物品</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              物品名称及规格 *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：心相印4层卫生卷纸、洗洁精替换装..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                物品品类
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
              >
                <option value="daily">生活日用</option>
                <option value="bathroom">卫浴消耗</option>
                <option value="kitchen">厨房耗材</option>
                <option value="cleaning">清洁工具配件</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                当前储量状态
              </label>
              <select
                value={stockLevel}
                onChange={(e) => setStockLevel(e.target.value as StockLevel)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
              >
                <option value="plenty">充足 (绿色)</option>
                <option value="low">告急 (橙黄色预警)</option>
                <option value="empty">已断货 (红色警报)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                当前剩余描述
              </label>
              <input
                type="text"
                value={quantityDescription}
                onChange={(e) => setQuantityDescription(e.target.value)}
                placeholder="例：剩 2 卷、余半瓶..."
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                参考采购价格 (元)
              </label>
              <input
                type="number"
                step="0.1"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="25.0"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              全屋公共存放位置
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例：次卧洗手间镜柜下层、水槽下方置物篮..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              选购推荐或特别提醒（选填）
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例：尽量买无香款，大家不易过敏..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-600 hover:bg-stone-50"
            >
              取消
            </button>
            <button
              type="submit"
              id="submit-supply-btn"
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
            >
              保存物资
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
