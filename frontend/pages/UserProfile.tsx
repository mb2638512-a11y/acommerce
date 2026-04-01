import React, { useMemo, useState } from 'react';
import { Order, Product, Store, PlanTier, TwoFactorSetup, TwoFactorStatus } from '../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';
import {
    User as UserIcon, Package, ArrowLeft, Mail, Calendar, Save, ShoppingBag, Store as StoreIcon,
    CreditCard, MapPin, Truck, MessageSquare, Star, Heart, Settings, LogOut, Clock, ShieldCheck,
    ChevronRight, Bell, Gift, Headphones, Wallet, Ticket, Shield, X, Key, AlertTriangle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../context/ThemeContext';

interface UserProfileProps {
    onNavigate: (p: string) => void;
}

const OrderStatusIcon: React.FC<{ icon: any, label: string, count: number, onClick: () => void }> = ({ icon: Icon, label, count, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group relative">
        <div className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm group-hover:border-indigo-500 group-hover:text-indigo-600 transition-all relative">
            <Icon size={24} />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                    {count}
                </span>
            )}
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-indigo-600">{label}</span>
    </button>
);

const ServiceCard: React.FC<{ icon: any, label: string, desc?: string, color: string, onClick?: () => void }> = ({ icon: Icon, label, desc, color, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow h-full w-full text-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-10 text-opacity-100 mb-3`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{label}</h4>
        {desc && <p className="text-[10px] text-gray-500">{desc}</p>}
    </button>
);

const ProductCard: React.FC<{ product: Product, storeName: string, onClick: () => void }> = ({ product, storeName, onClick }) => (
    <div onClick={onClick} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden cursor-pointer hover:shadow-lg transition-all group">
        <div className="aspect-[4/5] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                    -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                </span>
            )}
        </div>
        <div className="p-3">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 h-10 mb-1">{product.name}</h3>
            <div className="flex items-center gap-1 mb-2">
                <StoreIcon size={10} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 truncate">{storeName}</span>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <span className="font-bold text-lg text-indigo-600">${product.price}</span>
                    {product.compareAtPrice && (
                        <span className="text-xs text-gray-400 line-through ml-2">${product.compareAtPrice}</span>
                    )}
                </div>
                <button className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
                    <ShoppingBag size={14} />
                </button>
            </div>
        </div>
    </div>
);

export const UserProfile: React.FC<UserProfileProps> = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'processing' | 'shipped' | 'review'>('all');
    // 2FA State
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
    const [twoFactorStep, setTwoFactorStep] = useState<'setup' | 'verify' | 'enabled'>('setup');
    const [twoFactorSetupData, setTwoFactorSetupData] = useState<TwoFactorSetup | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [passwordFor2FA, setPasswordFor2FA] = useState('');

    const { showToast } = useToast();
    const navigate = useNavigate();

    // --- Queries ---
    const { data: myOrders = [] } = useQuery({
        queryKey: ['myOrders'],
        queryFn: async () => {
            const res = await api.get('/orders/my');
            return res.data;
        },
        enabled: !!user
    });

    const { data: myStores = [] } = useQuery({
        queryKey: ['myStoresProfile'],
        queryFn: async () => {
            const res = await api.get<Store[]>('/stores/my/all');
            return res.data;
        },
        enabled: !!user
    });

    // 2FA Queries and Mutations
    const { data: twoFactorStatus } = useQuery({
        queryKey: ['twoFactorStatus'],
        queryFn: async () => {
            const res = await api.get<TwoFactorStatus>('/auth/2fa/status');
            return res.data;
        },
        enabled: !!user
    });

    const setupTwoFactorMutation = useMutation({
        mutationFn: (data: { password: string }) => api.post<TwoFactorSetup>('/auth/2fa/setup', data),
        onSuccess: (data) => {
            setTwoFactorSetupData(data.data);
            setTwoFactorStep('verify');
            showToast('2FA secret generated. Please verify with your authenticator app.', 'success');
        },
        onError: (error: any) => {
            showToast(error.response?.data?.error || 'Failed to setup 2FA', 'error');
        }
    });

    const verifyTwoFactorMutation = useMutation({
        mutationFn: (data: { code: string }) => api.post('/auth/2fa/verify', data),
        onSuccess: () => {
            setTwoFactorStep('enabled');
            queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] });
            showToast('Two-factor authentication enabled successfully!', 'success');
        },
        onError: (error: any) => {
            showToast(error.response?.data?.error || 'Failed to verify 2FA', 'error');
        }
    });

    const disableTwoFactorMutation = useMutation({
        mutationFn: (data: { password: string; code?: string }) => api.post('/auth/2fa/disable', data),
        onSuccess: () => {
            setShowTwoFactorModal(false);
            setTwoFactorStep('setup');
            setTwoFactorSetupData(null);
            setPasswordFor2FA('');
            setVerificationCode('');
            queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] });
            showToast('Two-factor authentication disabled.', 'success');
        },
        onError: (error: any) => {
            showToast(error.response?.data?.error || 'Failed to disable 2FA', 'error');
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: { name: string }) => api.patch('/auth/profile', data),
        onSuccess: (data) => {
            // Assuming AuthContext handles user update, or we force reload user
            // Since AuthContext doesn't expose a 'refreshUser' yet, we might need to assume it works or reload window
            showToast('Profile updated!', 'success');
            setIsEditing(false);
            window.location.reload(); // Temporary fix to update user name in context
        }
    });

    // Mock recommendations for now
    const recommendedProducts: any[] = []; // Would need a recommendation API

    const wishlistCount = 0; // Would need a wishlist API

    const handleSaveProfile = () => {
        if (!user) return;
        updateProfileMutation.mutate({ name });
    };

    if (!user) return <div className="p-20 text-center">Please log in.</div>;

    // Filter orders
    const filteredOrders = myOrders.filter((order: any) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unpaid') return order.paymentStatus === 'PENDING';
        if (activeTab === 'processing') return order.status === 'PROCESSING' || order.status === 'PENDING';
        if (activeTab === 'shipped') return order.status === 'SHIPPED';
        if (activeTab === 'review') return order.status === 'DELIVERED';
        return true;
    });

    const pendingCount = myOrders.filter((o: any) => o.paymentStatus === 'PENDING').length;
    const processingCount = myOrders.filter((o: any) => o.status === 'PROCESSING').length;
    const shippedCount = myOrders.filter((o: any) => o.status === 'SHIPPED').length;
    const reviewCount = myOrders.filter((o: any) => o.status === 'DELIVERED').length;

    const membership = useMemo(() => {
        const order: PlanTier[] = ['STARTER', 'PRO', 'PREMIUM', 'ENTERPRISE'];
        let best: PlanTier = 'STARTER';

        for (const store of myStores) {
            const tier = store.planTier || store.settings?.subscription?.tier || 'STARTER';
            if (order.indexOf(tier) > order.indexOf(best)) best = tier;
        }

        if (best === 'ENTERPRISE') {
            return { label: 'Enterprise Member', color: 'text-purple-300' };
        }
        if (best === 'PREMIUM') {
            return { label: 'Premium Member', color: 'text-amber-300' };
        }
        if (best === 'PRO') {
            return { label: 'Pro Member', color: 'text-blue-300' };
        }
        return { label: user.role === 'admin' ? 'Admin Member' : 'Community Member', color: 'text-emerald-300' };
    }, [myStores, user.role]);

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
                {/* Header / Profile Card */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pt-12 pb-24 px-4 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-2xl font-bold shadow-lg">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <input className="p-1 px-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/70" value={name} onChange={e => setName(e.target.value)} />
                                        <button onClick={handleSaveProfile} className="bg-white text-indigo-600 p-1.5 rounded font-bold"><Save size={16} /></button>
                                    </div>
                                ) : (
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        {user.name}
                                        <button onClick={() => { setName(user.name); setIsEditing(true); }} className="opacity-70 hover:opacity-100"><Settings size={16} /></button>
                                    </h1>
                                )}
                                <p className="opacity-80 text-sm flex items-center gap-1"><Mail size={12} /> {user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-right hidden sm:flex">
                            <ThemeToggle />
                            <div>
                                <div className="text-sm opacity-80 uppercase tracking-widest font-bold mb-1">Membership</div>
                                <div className={`flex items-center gap-1 justify-end font-bold ${membership.color}`}>
                                    <Star size={16} fill="currentColor" /> {membership.label}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20 space-y-6">

                    {/* Stats Row */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex justify-between divide-x divide-gray-100 dark:divide-gray-800">
                        <div className="flex-1 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-l-xl transition-colors">
                            <div className="text-2xl font-black text-gray-900 dark:text-white">{wishlistCount}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold mt-1">Wishlist</div>
                        </div>
                        <div className="flex-1 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="text-2xl font-black text-gray-900 dark:text-white">3</div>
                            <div className="text-xs text-gray-500 uppercase font-bold mt-1">Coupons</div>
                        </div>
                        <div className="flex-1 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="text-2xl font-black text-gray-900 dark:text-white">12</div>
                            <div className="text-xs text-gray-500 uppercase font-bold mt-1">Following</div>
                        </div>
                        <div className="flex-1 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-xl transition-colors">
                            <div className="text-2xl font-black text-gray-900 dark:text-white">50</div>
                            <div className="text-xs text-gray-500 uppercase font-bold mt-1">Points</div>
                        </div>
                    </div>

                    {/* My Orders */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Orders</h2>
                            <button onClick={() => setActiveTab('all')} className="text-xs font-bold text-gray-500 flex items-center gap-1 hover:text-indigo-600">View All <ChevronRight size={14} /></button>
                        </div>

                        <div className="flex justify-between px-2">
                            <OrderStatusIcon icon={Wallet} label="Unpaid" count={pendingCount} onClick={() => setActiveTab('unpaid')} />
                            <OrderStatusIcon icon={Package} label="Processing" count={processingCount} onClick={() => setActiveTab('processing')} />
                            <OrderStatusIcon icon={Truck} label="Shipped" count={shippedCount} onClick={() => setActiveTab('shipped')} />
                            <OrderStatusIcon icon={MessageSquare} label="Review" count={reviewCount} onClick={() => setActiveTab('review')} />
                            <OrderStatusIcon icon={ShieldCheck} label="Returns" count={0} onClick={() => { }} />
                        </div>

                        {/* Order List Snippet */}
                        <div className="mt-8 space-y-4">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.slice(0, 3).map((order: any) => (
                                    <div key={order.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                        <div className="w-16 h-16 rounded-lg bg-white dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <img src={order.items[0]?.imageUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{order.store?.name}</h4>
                                                    <p className="text-xs text-gray-500">Order ID: {order.id.slice(0, 8).toUpperCase()}</p>
                                                </div>
                                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{order.status}</span>
                                            </div>
                                            <div className="mt-2 flex justify-between items-end">
                                                <p className="text-xs text-gray-500">{order.items.length} items • Total: <span className="font-bold text-gray-900 dark:text-white">${order.total.toFixed(2)}</span></p>
                                                <button className="text-xs font-bold border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">Track Order</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    No orders found in this category.
                                </div>
                            )}
                            {filteredOrders.length > 3 && <button onClick={() => { }} className="w-full py-2 text-center text-xs font-bold text-gray-500 hover:text-indigo-600">View {filteredOrders.length - 3} more orders...</button>}
                        </div>
                    </div>

                    {/* Services Grid */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">Services</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <ServiceCard icon={Ticket} label="Coupons" desc="Save more" color="bg-pink-500" />
                            <ServiceCard icon={Gift} label="Gift Cards" desc="Balance: $0" color="bg-purple-500" />
                            <ServiceCard icon={MapPin} label="Address" desc="Manage shipping" color="bg-blue-500" />
                            <ServiceCard icon={Headphones} label="Support" desc="24/7 Help" color="bg-green-500" />
                            <ServiceCard icon={Clock} label="History" desc="Recently viewed" color="bg-orange-500" />
                            <ServiceCard
                                icon={Shield}
                                label="Security"
                                desc={twoFactorStatus?.enabled ? `${twoFactorStatus.backupCodesCount} backup codes` : 'Enable 2FA'}
                                color="bg-indigo-500"
                                onClick={() => setShowTwoFactorModal(true)}
                            />
                            <ServiceCard icon={StoreIcon} label="Creator" desc="Sell on App" color="bg-gray-800" onClick={() => onNavigate('/')} />
                        </div>
                    </div>

                    {/* Log Out */}
                    <div className="pt-8 pb-12 text-center">
                        <button onClick={() => { logout(); navigate('/login'); }} className="text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-3 rounded-full mx-auto transition-colors">
                            <LogOut size={16} /> Sign Out
                        </button>
                        <p className="text-xs text-gray-400 mt-4">Version 2.4.0</p>
                    </div>

                </div>

                {/* Two-Factor Authentication Modal */}
                {showTwoFactorModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Shield size={24} className="text-indigo-600" />
                                    Two-Factor Authentication
                                </h2>
                                <button onClick={() => { setShowTwoFactorModal(false); setTwoFactorStep('setup'); setTwoFactorSetupData(null); setPasswordFor2FA(''); setVerificationCode(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                {twoFactorStatus?.enabled ? (
                                    <div className="space-y-4">
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                                            <ShieldCheck size={48} className="mx-auto text-green-500 mb-2" />
                                            <h3 className="font-bold text-green-700 dark:text-green-400">2FA is Enabled</h3>
                                            <p className="text-sm text-green-600 dark:text-green-500 mt-1">You have {twoFactorStatus.backupCodesCount} backup codes remaining.</p>
                                        </div>
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">Warning</h4>
                                                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Disabling 2FA will make your account less secure. You will no longer be able to use backup codes.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Password</label>
                                            <input type="password" value={passwordFor2FA} onChange={(e) => setPasswordFor2FA(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="Enter your password" />
                                        </div>
                                        <button onClick={() => disableTwoFactorMutation.mutate({ password: passwordFor2FA })} disabled={!passwordFor2FA || disableTwoFactorMutation.isPending} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                            {disableTwoFactorMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {twoFactorStep === 'setup' && (
                                            <>
                                                <div className="text-center mb-4">
                                                    <Shield size={48} className="mx-auto text-indigo-500 mb-2" />
                                                    <h3 className="font-bold text-gray-900 dark:text-white">Enable Two-Factor Authentication</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account by requiring a verification code in addition to your password.</p>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Password</label>
                                                    <input type="password" value={passwordFor2FA} onChange={(e) => setPasswordFor2FA(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="Enter your password to continue" />
                                                </div>
                                                <button onClick={() => setupTwoFactorMutation.mutate({ password: passwordFor2FA })} disabled={!passwordFor2FA || setupTwoFactorMutation.isPending} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                    {setupTwoFactorMutation.isPending ? 'Generating...' : 'Continue'}
                                                </button>
                                            </>
                                        )}
                                        {twoFactorStep === 'verify' && twoFactorSetupData && (
                                            <>
                                                <div className="text-center mb-4">
                                                    <Key size={48} className="mx-auto text-indigo-500 mb-2" />
                                                    <h3 className="font-bold text-gray-900 dark:text-white">Scan QR Code</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                                                </div>
                                                <div className="flex justify-center mb-4">
                                                    <img src={twoFactorSetupData.qrCode} alt="QR Code" className="w-48 h-48" />
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
                                                    <p className="text-xs text-gray-500 text-center mb-2">Or enter this secret manually:</p>
                                                    <p className="text-sm font-mono text-center text-gray-900 dark:text-white break-all">{twoFactorSetupData.secret}</p>
                                                </div>
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-4">
                                                    <div className="flex items-start gap-3">
                                                        <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">Save Your Backup Codes</h4>
                                                            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">These codes can be used to access your account if you lose your phone. Store them securely!</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                                        {twoFactorSetupData.backupCodes.map((code: string, i: number) => (
                                                            <code key={i} className="text-xs bg-white dark:bg-gray-900 p-2 rounded border border-yellow-200 dark:border-yellow-800 font-mono text-center">{code}</code>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification Code</label>
                                                    <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-center text-2xl font-mono tracking-widest" placeholder="000000" maxLength={6} />
                                                </div>
                                                <button onClick={() => verifyTwoFactorMutation.mutate({ code: verificationCode })} disabled={verificationCode.length !== 6 || verifyTwoFactorMutation.isPending} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                                    {verifyTwoFactorMutation.isPending ? 'Verifying...' : 'Verify & Enable 2FA'}
                                                </button>
                                                <button onClick={() => { setTwoFactorStep('setup'); setTwoFactorSetupData(null); setPasswordFor2FA(''); }} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
                                            </>
                                        )}
                                        {twoFactorStep === 'enabled' && (
                                            <div className="text-center py-8">
                                                <ShieldCheck size={64} className="mx-auto text-green-500 mb-4" />
                                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">2FA Enabled!</h3>
                                                <p className="text-sm text-gray-500 mt-2 mb-6">Your account is now protected with two-factor authentication.</p>
                                                <button onClick={() => { setShowTwoFactorModal(false); setTwoFactorStep('setup'); setTwoFactorSetupData(null); setPasswordFor2FA(''); setVerificationCode(''); }} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl">Done</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
