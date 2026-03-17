import React, { useState, useEffect } from 'react';
import { User, Store, StoreSettings, Product } from '../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';
import {
    Plus, LogOut, Sparkles, Loader2, ShoppingBag, LayoutGrid,
    ArrowRight, ArrowLeft, Check, Type, Palette, DollarSign, Globe,
    Facebook, Instagram, Twitter, MessageCircle, MapPin, Mail, Image as ImageIcon, Upload, User as UserIcon, Shield, Store as StoreIcon, Rocket,
    Search, Star, TrendingUp, Filter, Award, Zap, X, Coins
} from 'lucide-react';
import { generateStoreNameIdeas, generateStoreDescription } from '../services/geminiService';
import { StoreCard } from '../components/StoreCard';
import { ThemeToggle } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { canAccessAdminDashboard } from '../src/lib/adminAccess';

interface DashboardProps {
    user: User;
    onLogout: () => void;
    onNavigate: (path: string) => void;
}

const COLORS = [
    'indigo', 'blue', 'green', 'red', 'purple', 'pink', 'orange', 'yellow', 'teal', 'cyan', 'slate', 'gray'
];

const ALL_CURRENCIES = [
    { code: "USD", name: "United States Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound Sterling" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "INR", name: "Indian Rupee" },
];

interface AggregatedProduct extends Product {
    storeId: string;
    storeName: string;
    storeTheme: string;
    salesCount: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onNavigate }) => {
    const [viewMode, setViewMode] = useState<'shop' | 'sell'>(() => {
        const saved = localStorage.getItem('acommerce_mode');
        return (saved === 'sell' || saved === 'shop') ? saved : 'shop';
    });
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const { logout } = useAuth();

    // --- Marketplace State ---
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'price_low' | 'price_high'>('trending');

    // --- Seller State ---
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Wizard State ---
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '', niche: '', description: '', slug: '',
        themeColor: 'indigo', font: 'sans' as 'sans' | 'serif' | 'mono',
        borderRadius: 'md' as 'none' | 'sm' | 'md' | 'full',
        logoUrl: '', bannerUrl: '',
        currency: 'USD', taxRate: 0, shippingFee: 0, freeShippingThreshold: 100, salesGoal: 1000,
        maintenanceMode: false, announcementBar: '', supportEmail: '', businessAddress: '',
        facebook: '', instagram: '', twitter: '', whatsapp: '',
    });

    // --- Queries ---
    const { data: myStores = [], isLoading: isLoadingMyStores } = useQuery({
        queryKey: ['myStores', user.id],
        queryFn: async () => {
            const res = await api.get<Store[]>('/stores/my/all');
            return res.data;
        }
    });

    const { data: marketStores = [] } = useQuery({
        queryKey: ['publicStoresDashboard'],
        queryFn: async () => {
            const res = await api.get<Store[]>('/stores');
            return res.data;
        }
    });

    // --- Mutations ---
    const createStoreMutation = useMutation({
        mutationFn: async (newStoreData: any) => {
            const res = await api.post('/stores', newStoreData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myStores'] });
            queryClient.invalidateQueries({ queryKey: ['publicStoresDashboard'] });
            setIsModalOpen(false);
            setFormData({
                name: '', niche: '', description: '', slug: '', themeColor: 'indigo', font: 'sans', borderRadius: 'md',
                logoUrl: '', bannerUrl: '', currency: 'USD', taxRate: 0, shippingFee: 0, freeShippingThreshold: 100, salesGoal: 1000,
                maintenanceMode: false, announcementBar: '', supportEmail: '', businessAddress: '',
                facebook: '', instagram: '', twitter: '', whatsapp: '',
            });
            setStep(1);
            showToast('Store created successfully!', 'success');
        },
        onError: () => {
            showToast('Failed to create store', 'error');
        }
    });

    // --- Derived State ---
    const allProducts = React.useMemo(() => {
        let products: AggregatedProduct[] = [];
        marketStores.forEach(store => {
            const salesMap: Record<string, number> = {};
            const storeProducts = (store.products || [])
                .filter(p => p.status === 'ACTIVE')
                .map(p => ({
                    ...p,
                    storeId: store.id,
                    storeName: store.name,
                    storeTheme: store.themeColor || 'indigo',
                    salesCount: salesMap[p.id] || 0
                }));
            products = [...products, ...storeProducts];
        });
        return products;
    }, [marketStores]);

    const filteredProducts = React.useMemo(() => {
        let temp = [...allProducts];
        if (search) {
            const lower = search.toLowerCase();
            temp = temp.filter(p =>
                p.name.toLowerCase().includes(lower) ||
                p.description.toLowerCase().includes(lower) ||
                p.storeName.toLowerCase().includes(lower)
            );
        }
        if (category !== 'All') {
            temp = temp.filter(p => p.category === category);
        }
        switch (sortBy) {
            case 'trending': temp.sort((a, b) => b.salesCount - a.salesCount); break;
            case 'newest': temp.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
            case 'price_low': temp.sort((a, b) => a.price - b.price); break;
            case 'price_high': temp.sort((a, b) => b.price - a.price); break;
        }
        return temp;
    }, [search, category, sortBy, allProducts]);

    // --- Switcher Logic ---
    const handleViewModeChange = (mode: 'shop' | 'sell') => {
        setViewMode(mode);
        localStorage.setItem('acommerce_mode', mode);
    };

    // --- Wizard Logic ---
    const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleImageUpload = (field: 'logoUrl' | 'bannerUrl', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) { showToast('Image too large (max 500KB).', 'error'); return; }
            const reader = new FileReader();
            reader.onloadend = () => { updateField(field, reader.result as string); showToast('Image uploaded', 'success'); };
            reader.readAsDataURL(file);
        }
    };

    const handleAI = async (type: 'name' | 'desc') => {
        if (!formData.niche) { showToast('Enter a niche first.', 'error'); return; }
        setIsGenerating(true);
        if (type === 'name') {
            const names = await generateStoreNameIdeas(formData.niche);
            setSuggestedNames(names);
        } else {
            const desc = await generateStoreDescription(formData.name || 'My Store', formData.niche);
            updateField('description', desc);
        }
        setIsGenerating(false);
    };

    const handleCreateStore = () => {
        const settings: StoreSettings = {
            shippingFee: Number(formData.shippingFee),
            taxRate: Number(formData.taxRate),
            currency: formData.currency,
            maintenanceMode: formData.maintenanceMode,
            freeShippingThreshold: Number(formData.freeShippingThreshold),
            salesGoal: Number(formData.salesGoal),
            font: formData.font,
            borderRadius: formData.borderRadius,
            logoUrl: formData.logoUrl,
            bannerUrl: formData.bannerUrl,
            announcementBar: formData.announcementBar,
            socialLinks: { facebook: formData.facebook, instagram: formData.instagram, twitter: formData.twitter, whatsapp: formData.whatsapp }
        };

        createStoreMutation.mutate({
            name: formData.name,
            description: formData.description,
            slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
            themeColor: formData.themeColor,
            settings: settings
        });
    };

    const renderStep = () => {
        // Condensed wizard step rendering
        switch (step) {
            case 1: return (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold dark:text-white">Step 1: Identity</h3>
                    <input className="w-full p-3 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Niche" value={formData.niche} onChange={e => updateField('niche', e.target.value)} />
                    <div className="flex gap-2"><input className="flex-1 p-3 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Store Name" value={formData.name} onChange={e => updateField('name', e.target.value)} /><button onClick={() => handleAI('name')} disabled={isGenerating} className="bg-indigo-600 text-white px-4 rounded-xl font-bold">AI</button></div>
                    {suggestedNames.length > 0 && <div className="flex gap-2 flex-wrap">{suggestedNames.map(n => <button key={n} onClick={() => updateField('name', n)} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{n}</button>)}</div>}
                </div>
            );
            case 2: return (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold dark:text-white">Step 2: Branding</h3>
                    <div className="flex gap-2">{COLORS.map(c => <button key={c} onClick={() => updateField('themeColor', c)} className={`w-8 h-8 rounded-full bg-${c}-500 ${formData.themeColor === c ? 'ring-2 ring-offset-2' : ''}`}></button>)}</div>
                    <input type="file" onChange={e => handleImageUpload('logoUrl', e)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>
            );
            case 3: return (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold dark:text-white">Step 3: Finance</h3>
                    <select value={formData.currency} onChange={e => updateField('currency', e.target.value)} className="w-full p-3 rounded-xl border dark:border-gray-700 dark:bg-gray-800 dark:text-white">{ALL_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}</select>
                </div>
            );
            case 4: return <h3 className="text-xl font-bold dark:text-white">Step 4: Socials (Optional)</h3>;
            case 5: return <div className="text-center"><Check size={48} className="mx-auto text-green-500" /><h3 className="text-xl font-bold dark:text-white mt-4">Ready!</h3></div>;
            default: return null;
        }
    };

    const categories = ['All', ...Array.from(new Set(allProducts.map(p => p.category))).filter(Boolean)];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 font-sans">
            {/* Unified Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 md:gap-8">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleViewModeChange('shop')}>
                            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
                                <span className="text-white font-black text-lg">AC</span>
                            </div>
                            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white hidden md:block">ACommerce</span>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => handleViewModeChange('shop')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'shop' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                            >
                                <ShoppingBag size={14} /> Shop
                            </button>
                            <button
                                onClick={() => handleViewModeChange('sell')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'sell' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                            >
                                <StoreIcon size={14} /> Sell
                            </button>
                        </div>
                    </div>

                    {/* Search (Only in Shop Mode) */}
                    {viewMode === 'shop' && (
                        <div className="flex-1 max-w-lg relative hidden md:block">
                            <input
                                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-shadow"
                                placeholder="Search marketplace..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <div className="relative">
                            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg transition-colors">
                                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">{user.name.charAt(0)}</div>
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-fade-in">
                                    <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        <div className="mt-2 text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-center uppercase tracking-wide">
                                            Mode: {viewMode === 'shop' ? 'Shopper' : 'Seller'}
                                        </div>
                                    </div>
                                    <button onClick={() => onNavigate('/profile')} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-bold flex items-center gap-2"><UserIcon size={16} /> Profile</button>
                                    {canAccessAdminDashboard(user) && (
                                        <button onClick={() => onNavigate('/admin')} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-bold flex items-center gap-2 text-purple-600"><Shield size={16} /> Admin</button>
                                    )}
                                    <button onClick={() => { logout(); onLogout(); }} className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm font-bold flex items-center gap-2"><LogOut size={16} /> Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in pb-20">

                {/* VIEW MODE: SHOP */}
                {viewMode === 'shop' && (
                    <div className="space-y-12">
                        {/* Hero / Banner */}
                        {!search && category === 'All' && (
                            <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white min-h-[300px] flex items-center group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 z-10"></div>
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
                                <div className="relative z-20 px-8 md:px-16 max-w-2xl">
                                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">Global Marketplace</span>
                                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Explore the World of <br /> Independent Stores</h1>
                                    <div className="flex gap-4">
                                        <button onClick={() => { document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' }) }} className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg">Start Exploring <ArrowRight size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-6 sticky top-20 z-30 py-4 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-sm" id="feed">
                            <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2">
                                {categories.map(c => (
                                    <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors border ${category === c ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'}`}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-gray-400" />
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-bold outline-none cursor-pointer hover:border-indigo-500 transition-colors">
                                    <option value="trending">Trending</option>
                                    <option value="newest">Newest</option>
                                    <option value="price_low">Price: Low</option>
                                    <option value="price_high">Price: High</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => onNavigate(`/store/${product.storeId}/product/${product.id}`)}
                                        className="group cursor-pointer bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300"
                                    >
                                        <div className="aspect-[4/5] relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">SALE</span>
                                            )}
                                            <div className="absolute bottom-2 left-2 right-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <button className="w-full py-2 bg-white/90 dark:bg-black/90 backdrop-blur text-sm font-bold rounded-lg shadow-lg">View Product</button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <div className={`w-3 h-3 rounded-full bg-${product.storeTheme}-500`}></div>
                                                        <p className="text-xs text-gray-500">{product.storeName}</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white">${product.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <ShoppingBag size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No products found</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search or filters.</p>
                                <button onClick={() => { setSearch(''); setCategory('All'); }} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">Clear Filters</button>
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW MODE: SELL */}
                {viewMode === 'sell' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Stores</h2>
                                <p className="text-gray-500 dark:text-gray-400">Manage your businesses.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                            >
                                <Plus size={20} /> New Store
                            </button>
                        </div>

                        {isLoadingMyStores ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
                        ) : myStores.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500">
                                    <StoreIcon size={40} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 dark:text-white">Start Selling Today</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">You haven't created any stores yet. Launch your first online business in minutes.</p>
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30">Launch Store</button>
                                    <button onClick={() => handleViewModeChange('shop')} className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">Browse Marketplace</button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {myStores.map(store => (
                                    <StoreCard
                                        key={store.id}
                                        store={store}
                                        onManage={(id) => onNavigate(`/store/${id}/admin`)}
                                        onVisit={(id) => onNavigate(`/store/${id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </main>

            {/* Store Creation Modal (Same Wizard Logic) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-black dark:text-white">Create New Store</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1">{renderStep()}</div>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                            {step > 1 ? <button onClick={() => setStep(s => s - 1)} className="px-6 py-2 font-bold dark:text-white">Back</button> : <div></div>}
                            {step < 5 ? (
                                <button onClick={() => setStep(s => s + 1)} className="px-8 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl">Next</button>
                            ) : (
                                <button onClick={handleCreateStore} disabled={createStoreMutation.isPending} className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl">{createStoreMutation.isPending ? <Loader2 className="animate-spin" /> : 'Launch'}</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
