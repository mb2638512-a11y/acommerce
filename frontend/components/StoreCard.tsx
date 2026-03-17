import React from 'react';
import { Store } from '../types';
import { ShoppingBag, ArrowRight, ExternalLink } from 'lucide-react';

interface StoreCardProps {
  store: Store;
  onManage: (id: string) => void;
  onVisit: (id: string) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onManage, onVisit }) => {
  const planTier = store.planTier || store.settings?.subscription?.tier || 'STARTER';
  const planStyles: Record<string, string> = {
    STARTER: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
    PRO: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    PREMIUM: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    ENTERPRISE: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3.5 rounded-xl bg-${store.themeColor}-100 dark:bg-opacity-20 text-${store.themeColor}-600 dark:text-${store.themeColor}-400 shadow-sm`}>
          <ShoppingBag size={24} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${planStyles[planTier] || planStyles.STARTER}`}>
            {planTier}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Active
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{store.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 h-10 leading-relaxed">
        {store.description || 'Start selling your products to the world.'}
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onManage(store.id)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
        >
          Manage
        </button>
        <button
          onClick={() => onVisit(store.id)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600 transition-colors"
        >
          Visit <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
};
