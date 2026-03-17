import React, { useState } from 'react';
import { Store, PlanTier } from '../types';
import { 
    ChevronDown, 
    Plus, 
    Settings, 
    Activity, 
    AlertCircle,
    Store as StoreIcon,
    ArrowRight,
    Search
} from 'lucide-react';

interface StoreSwitcherProps {
    stores: Store[];
    activeStoreId: string;
    onSelect: (id: string) => void;
    onCreateNew: () => void;
}

const getTierColor = (tier: PlanTier) => {
    switch (tier) {
        case 'ENTERPRISE': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
        case 'PREMIUM': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        case 'PRO': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
};

export const StoreSwitcher: React.FC<StoreSwitcherProps> = ({ 
    stores, 
    activeStoreId, 
    onSelect,
    onCreateNew 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const activeStore = stores.find(s => s.id === activeStoreId) || stores[0];
    
    const filteredStores = stores.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!activeStore) return null;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm group"
            >
                <div className={`w-8 h-8 rounded-xl bg-${activeStore.themeColor || 'indigo'}-500 flex items-center justify-center text-white shadow-lg shadow-${activeStore.themeColor || 'indigo'}-500/20`}>
                    <StoreIcon size={16} />
                </div>
                <div className="text-left hidden md:block">
                    <p className="text-sm font-black dark:text-white leading-tight">{activeStore.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{activeStore.slug}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 group-hover:text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-gray-950 border border-gray-100 dark:border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="p-4 border-b border-gray-50 dark:border-white/5 relative">
                        <input 
                            autoFocus
                            placeholder="Find your store..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search size={14} className="absolute left-7 top-7 text-gray-400" />
                    </div>

                    <div className="max-h-80 overflow-y-auto no-scrollbar p-2">
                        {filteredStores.map(store => {
                            const tier = (store.settings as any)?.subscription?.tier || 'STARTER';
                            return (
                                <button 
                                    key={store.id}
                                    onClick={() => {
                                        onSelect(store.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeStoreId === store.id ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20' : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-${store.themeColor || 'indigo'}-500 flex items-center justify-center text-white flex-shrink-0`}>
                                        <StoreIcon size={18} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm font-black ${activeStoreId === store.id ? 'text-indigo-600 dark:text-indigo-400' : 'dark:text-white'}`}>{store.name}</p>
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-black tracking-widest ${getTierColor(tier)}`}>
                                                {tier}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-bold">{store.slug}</p>
                                    </div>
                                    {activeStoreId === store.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-2 border-t border-gray-50 dark:border-white/5">
                        <button 
                            onClick={() => {
                                onCreateNew();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 p-3 text-sm font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-2xl transition-all"
                        >
                            <Plus size={16} /> Create Another Store
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
