import React, { useState, useEffect } from 'react';
import { Store, Product } from '../types';

import { useQuery } from '@tanstack/react-query';
import api from '../src/lib/api';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, ShoppingBag, Star, TrendingUp, Filter, ArrowRight,
    Store as StoreIcon, Heart, Menu, X, Tag, Zap, Award, Globe
} from 'lucide-react';
import { ThemeToggle } from '../context/ThemeContext';

interface AggregatedProduct extends Product {
    storeId: string;
    storeName: string;
    storeTheme: string;
    salesCount: number;
}

const Marketplace: React.FC = () => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'price_low' | 'price_high'>('trending');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- Queries ---
    const { data: searchHistory = [], refetch: refetchHistory } = useQuery({
        queryKey: ['searchHistory'],
        queryFn: async () => {
            try {
                const res = await api.get<{ id: string, query: string }[]>('/search');
                return res.data;
            } catch (e) {
                return [];
            }
        },
        enabled: !!localStorage.getItem('token')
    });

    const { data: stores = [] } = useQuery({
        queryKey: ['stores'],
        queryFn: async () => {
            const res = await api.get<Store[]>('/stores');
            return res.data;
        }
    });

    const saveSearchMutation = async (query: string) => {
        if (!query.trim() || !localStorage.getItem('token')) return;
        try {
            await api.post('/search', { query: query.trim() });
            refetchHistory();
        } catch (e) {
            console.error('Failed to save search', e);
        }
    };

    const allProducts = React.useMemo(() => {
        let products: AggregatedProduct[] = [];
        stores.filter(s => !s.settings?.maintenanceMode).forEach(store => {
            const storeProducts = (store.products || [])
                .filter(p => p.status === 'ACTIVE')
                .map(p => ({
                    ...p,
                    storeId: store.id,
                    storeName: store.name,
                    storeTheme: store.themeColor || 'indigo',
                    salesCount: (p as any).salesCount || 0
                }));
            products = [...products, ...storeProducts];
        });
        return products;
    }, [stores]);

    const filteredProducts = React.useMemo(() => {
        let temp = [...allProducts];

        // Search
        if (search) {
            const lower = search.toLowerCase();
            temp = temp.filter(p =>
                p.name.toLowerCase().includes(lower) ||
                p.description.toLowerCase().includes(lower) ||
                p.storeName.toLowerCase().includes(lower)
            );
        }

        // Category
        if (category !== 'All') {
            temp = temp.filter(p => p.category === category);
        }

        // Sort
        switch (sortBy) {
            case 'trending':
                temp.sort((a, b) => b.salesCount - a.salesCount);
                break;
            case 'newest':
                temp.sort((a, b) => b.createdAt - a.createdAt);
                break;
            case 'price_low':
                temp.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                temp.sort((a, b) => b.price - a.price);
                break;
        }

        return temp;
    }, [search, category, sortBy, allProducts]);

    const categories = ['All', ...Array.from(new Set(allProducts.map(p => p.category))).filter(Boolean)];
    const topStores = [...stores].sort((a, b) => b.orders.length - a.orders.length).slice(0, 4);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] right-[10%] w-[50vw] h-[50vw] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[10%] left-[5%] w-[40vw] h-[40vw] bg-purple-500/5 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-3 font-black text-2xl tracking-tighter cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <ShoppingBag className="text-white" size={20} />
                        </div>
                        <span className="font-heading bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Marketplace</span>
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="flex-1 max-w-2xl relative hidden md:block group/search">
                        <div className="relative">
                            <input
                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-transparent focus:border-indigo-500/30 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-semibold tracking-tight"
                                placeholder="Search experiences, collections, and creators..."
                                value={search}
                                onFocus={() => setShowHistory(true)}
                                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveSearchMutation(search)}
                            />
                            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" size={18} />
                        </div>

                        {/* Search History Dropdown */}
                        {showHistory && searchHistory.length > 0 && !search && (
                            <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <p className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recent Explorations</p>
                                {searchHistory.map((h) => (
                                    <button
                                        key={h.id}
                                        onClick={() => { setSearch(h.query); setShowHistory(false); }}
                                        className="w-full text-left px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between group transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <TrendingUp size={14} className="text-slate-300 group-hover:text-indigo-500" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{h.query}</span>
                                        </div>
                                        <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-500" />
                                    </button>
                                ))}
                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                    <button
                                        onClick={async () => {
                                            await api.delete('/search');
                                            refetchHistory();
                                        }}
                                        className="w-full text-center py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        Purge Exploration History
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button onClick={() => navigate('/login')} className="hidden sm:flex px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-indigo-500/10 mb-0">Sign In</button>
                    </div>
                </div>
            </nav>

            <main className="pt-28 pb-24 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Categories and Sort */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16">
                        <div className="flex flex-wrap items-center gap-3 bg-white/50 dark:bg-white/5 p-1.5 rounded-full border border-slate-200 dark:border-white/5 backdrop-blur-md">
                            {categories.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${category === c ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        <div className="relative group self-end">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 py-3 pl-6 pr-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] cursor-pointer outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                            >
                                <option value="trending">Featured & Trending</option>
                                <option value="newest">Latest Arrivals</option>
                                <option value="price_low">Price Intensity: Low</option>
                                <option value="price_high">Price Intensity: High</option>
                            </select>
                            <Filter className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-40 glass-card rounded-[3rem] border-dashed">
                            <ShoppingBag size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-6 animate-bounce" />
                            <h3 className="text-2xl font-black mb-2 font-heading tracking-tight">Void Detected.</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No results found for your current filters.</p>
                            <button onClick={() => { setSearch(''); setCategory('All'); }} className="mt-8 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform">Reset Search</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => navigate(`/store/${product.storeId}/product/${product.id}`)}
                                    className="group cursor-pointer flex flex-col h-full perspective-1000"
                                >
                                    <div className="relative aspect-[1/1] overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 mb-6 border border-slate-100 dark:border-white/5 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />

                                        {/* Status Tags */}
                                        <div className="absolute top-5 left-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-3 group-hover:translate-x-0 duration-500">
                                            {product.salesCount > 5 && (
                                                <span className="px-4 py-1.5 bg-black/80 dark:bg-white/90 text-white dark:text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-xl">
                                                    <Zap size={10} className="fill-current" /> Hot Release
                                                </span>
                                            )}
                                        </div>

                                        {/* Dynamic gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <div className="absolute bottom-6 inset-x-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                            <button className="w-full py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                                                Explore Asset <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col px-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase">{product.name}</h3>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-[8px] font-black text-white dark:text-slate-900">
                                                    {product.storeName.charAt(0)}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors">{product.storeName}</span>
                                            </div>
                                            <div className="text-lg font-black font-heading text-indigo-600 dark:text-indigo-400">
                                                ${product.price}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Marketplace;