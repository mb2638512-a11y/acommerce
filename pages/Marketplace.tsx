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

export const Marketplace: React.FC = () => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'price_low' | 'price_high'>('trending');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigate = useNavigate();

    // --- Queries ---
    const { data: stores = [] } = useQuery({
        queryKey: ['publicStores'],
        queryFn: async () => {
            const res = await api.get<Store[]>('/stores');
            return res.data;
        }
    });

    const allProducts = React.useMemo(() => {
        let products: AggregatedProduct[] = [];
        stores.filter(s => !s.settings.maintenanceMode).forEach(store => {
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
                temp.sort((a, b) => b.createdAt - a.createdAt); // Types might be issue if createdAt is string
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans transition-colors duration-300">
            {/* Navbar */}
            <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-1.5 rounded-lg">
                            <ShoppingBag className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tight hidden sm:block">ACommerce <span className="text-indigo-600 dark:text-indigo-400">Market</span></span>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl relative hidden md:block">
                        <input
                            className="w-full pl-12 pr-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                            placeholder="Search for products, brands, and more..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-4 top-2.5 text-gray-400" size={18} />
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button onClick={() => navigate('/login')} className="hidden sm:block px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-colors">Sign In</button>
                    </div>
                </div>
                {/* Mobile Search */}
                <div className="md:hidden px-4 pb-3">
                    <div className="relative">
                        <input
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none text-sm"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                </div>
            </nav>

            <main className="pb-20">
                {/* Hero Section */}
                {!search && category === 'All' && (
                    <div className="bg-gray-900 dark:bg-black text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"></div>
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"></div>
                        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
                            <div className="max-w-2xl animate-slide-up">
                                <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">Global Marketplace</span>
                                <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
                                    Discover Unique <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Products & Stores</span>
                                </h1>
                                <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-lg">
                                    Explore a curated collection of independent sellers, handcrafted goods, and digital assets. Support small businesses and find something special.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => { setCategory('All'); window.scrollTo({ top: 800, behavior: 'smooth' }) }} className="px-8 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform shadow-xl shadow-white/10 flex items-center gap-2">
                                        Start Exploring <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">

                    {/* Featured Stores */}
                    {!search && category === 'All' && (
                        <section className="animate-fade-in">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2"><Award className="text-yellow-500" /> Top Rated Sellers</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Independent stores loved by customers</p>
                                </div>
                                <button className="text-indigo-600 font-bold text-sm hover:underline">View All</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {topStores.map(store => (
                                    <div key={store.id} onClick={() => navigate(`/store/${store.id}`)} className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-xl bg-${store.themeColor}-100 dark:bg-${store.themeColor}-900/30 flex items-center justify-center text-${store.themeColor}-600 dark:text-${store.themeColor}-400 font-bold text-xl`}>
                                                {store.name.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-lg truncate group-hover:text-indigo-500 transition-colors">{store.name}</h3>
                                                <p className="text-xs text-gray-500 flex items-center gap-1"><Globe size={10} /> {store.slug}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mb-4">
                                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-bold text-gray-600 dark:text-gray-400">{store.products.length} Products</span>
                                            <span className="flex items-center gap-1 font-bold text-yellow-500"><Star size={12} fill="currentColor" /> 4.9</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 h-16">
                                            {store.products.slice(0, 3).map(p => (
                                                <img key={p.id} src={p.imageUrl} className="w-full h-full object-cover rounded-lg bg-gray-100 dark:bg-gray-800" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Main Product Feed */}
                    <section id="products">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sticky top-16 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-sm z-30 py-4">
                            <div>
                                <h2 className="text-3xl font-bold flex items-center gap-2">
                                    {search ? `Results for "${search}"` : 'Discover Products'}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">{filteredProducts.length} items found</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                {/* Categories */}
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[200px] md:max-w-md">
                                    {categories.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCategory(c)}
                                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${category === c ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                                <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
                                {/* Sort */}
                                <div className="relative group">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-8 rounded-lg font-bold text-sm cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="trending">Trending Now</option>
                                        <option value="newest">New Arrivals</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="price_high">Price: High to Low</option>
                                    </select>
                                    <Filter className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-500">No products found</h3>
                                <p className="text-gray-400">Try adjusting your filters or search terms.</p>
                                <button onClick={() => { setSearch(''); setCategory('All'); }} className="mt-4 text-indigo-600 font-bold hover:underline">Clear all filters</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => navigate(`/store/${product.storeId}/product/${product.id}`)}
                                        className="group cursor-pointer flex flex-col h-full"
                                    >
                                        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900 mb-4">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                {product.salesCount > 5 && (
                                                    <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide rounded shadow-md flex items-center gap-1 w-fit">
                                                        <TrendingUp size={10} /> Hot
                                                    </span>
                                                )}
                                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                    <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wide rounded shadow-md w-fit">
                                                        Sale
                                                    </span>
                                                )}
                                            </div>
                                            {/* Quick Actions */}
                                            <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <button className="w-full py-3 bg-white dark:bg-black text-black dark:text-white font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-900">
                                                    View Details <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                                <span className="font-bold">${product.price}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-1 mb-2">{product.category}</p>

                                            <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                <div className={`w-5 h-5 rounded-full bg-${product.storeTheme}-500 flex items-center justify-center text-[8px] text-white font-bold`}>
                                                    {product.storeName.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{product.storeName}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};