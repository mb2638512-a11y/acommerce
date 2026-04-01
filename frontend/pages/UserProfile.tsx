import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Order, Product, Store, PlanTier, TwoFactorSetup, TwoFactorStatus } from '../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';
import {
    User as UserIcon, Package, Mail, Calendar, Save, ShoppingBag, Store as StoreIcon,
    CreditCard, MapPin, Truck, MessageSquare, Star, Settings, LogOut, Clock, ShieldCheck,
    ChevronRight, Bell, Gift, Headphones, Wallet, Ticket, Shield, X, Key, AlertTriangle,
    ArrowLeft, Camera, Upload, RotateCcw, FileText, Heart, Plus, Trash2, Edit3, Check,
    Phone, Globe, Lock, Eye, EyeOff, Smartphone, CreditCard as CreditCardIcon,
    BarChart3, Users, TrendingUp, Award, Zap, HelpCircle, ChevronDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../context/ThemeContext';

type ProfileSection = 'overview' | 'orders' | 'unpaid' | 'processing' | 'shipped' | 'review' | 'returns' | 'coupons' | 'giftcards' | 'addresses' | 'support' | 'history' | 'security' | 'creator';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        EXPIRED: 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500',
        USED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
            {status}
        </span>
    );
};

const EmptyState: React.FC<{ icon: React.ElementType; title: string; desc: string; action?: () => void; actionLabel?: string }> = ({ icon: Icon, title, desc, action, actionLabel }) => (
    <div className="text-center py-12">
        <Icon className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={48} />
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{desc}</p>
        {action && actionLabel && (
            <button onClick={action} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">{actionLabel}</button>
        )}
    </div>
);

export const UserProfile: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
    const { user, logout, refreshUser } = useAuth();
    const queryClient = useQueryClient();
    const [activeSection, setActiveSection] = useState<ProfileSection>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
    const [twoFactorStep, setTwoFactorStep] = useState<'setup' | 'verify' | 'enabled'>('setup');
    const [twoFactorSetupData, setTwoFactorSetupData] = useState<TwoFactorSetup | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [passwordFor2FA, setPasswordFor2FA] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
    const [bannerUrl, setBannerUrl] = useState(user?.banner || '');
    const [uploadingImage, setUploadingImage] = useState<'avatar' | 'banner' | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const { showToast } = useToast();
    const navigate = useNavigate();

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

    const { data: twoFactorStatus } = useQuery({
        queryKey: ['twoFactorStatus'],
        queryFn: async () => {
            const res = await api.get<TwoFactorStatus>('/auth/2fa/status');
            return res.data;
        },
        enabled: !!user
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: { name?: string; avatar?: string; banner?: string; bio?: string }) => api.patch('/auth/profile', data),
        onSuccess: (data) => {
            if (refreshUser && data.data) refreshUser(data.data);
            showToast('Profile updated!', 'success');
            setIsEditing(false);
        },
        onError: () => showToast('Failed to update profile', 'error')
    });

    const setupTwoFactorMutation = useMutation({
        mutationFn: (data: { password: string }) => api.post<TwoFactorSetup>('/auth/2fa/setup', data),
        onSuccess: (data) => {
            setTwoFactorSetupData(data.data);
            setTwoFactorStep('verify');
            showToast('2FA secret generated.', 'success');
        },
        onError: (error: any) => showToast(error.response?.data?.error || 'Failed to setup 2FA', 'error')
    });

    const verifyTwoFactorMutation = useMutation({
        mutationFn: (data: { code: string }) => api.post('/auth/2fa/verify', data),
        onSuccess: () => {
            setTwoFactorStep('enabled');
            queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] });
            showToast('2FA enabled!', 'success');
        },
        onError: (error: any) => showToast(error.response?.data?.error || 'Failed to verify 2FA', 'error')
    });

    const disableTwoFactorMutation = useMutation({
        mutationFn: (data: { password: string }) => api.post('/auth/2fa/disable', data),
        onSuccess: () => {
            setShowTwoFactorModal(false);
            setTwoFactorStep('setup');
            setTwoFactorSetupData(null);
            setPasswordFor2FA('');
            setVerificationCode('');
            queryClient.invalidateQueries({ queryKey: ['twoFactorStatus'] });
            showToast('2FA disabled.', 'success');
        },
        onError: (error: any) => showToast(error.response?.data?.error || 'Failed to disable 2FA', 'error')
    });

    const handleImageUpload = useCallback(async (file: File, type: 'avatar' | 'banner') => {
        setUploadingImage(type);
        try {
            // Convert image to base64 data URL for direct storage
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Data = reader.result as string;
                if (type === 'avatar') {
                    setAvatarUrl(base64Data);
                    updateProfileMutation.mutate({ avatar: base64Data });
                } else {
                    setBannerUrl(base64Data);
                    updateProfileMutation.mutate({ banner: base64Data });
                }
                showToast(`${type === 'avatar' ? 'Profile' : 'Banner'} image updated!`, 'success');
                setUploadingImage(null);
            };
            reader.onerror = () => {
                showToast('Failed to read image file', 'error');
                setUploadingImage(null);
            };
            reader.readAsDataURL(file);
        } catch {
            showToast('Failed to upload image', 'error');
            setUploadingImage(null);
        }
    }, []);

    const handleSaveProfile = () => {
        if (!user) return;
        updateProfileMutation.mutate({ name, bio });
    };

    if (!user) return <div className="p-20 text-center">Please log in.</div>;

    const filteredOrders = myOrders.filter((order: any) => {
        if (activeSection === 'all' || activeSection === 'orders') return true;
        if (activeSection === 'unpaid') return order.paymentStatus === 'PENDING';
        if (activeSection === 'processing') return order.status === 'PROCESSING' || order.status === 'PENDING';
        if (activeSection === 'shipped') return order.status === 'SHIPPED';
        if (activeSection === 'review') return order.status === 'DELIVERED';
        return true;
    });

    const pendingCount = myOrders.filter((o: any) => o.paymentStatus === 'PENDING').length;
    const processingCount = myOrders.filter((o: any) => o.status === 'PROCESSING').length;
    const shippedCount = myOrders.filter((o: any) => o.status === 'SHIPPED').length;
    const reviewCount = myOrders.filter((o: any) => o.status === 'DELIVERED').length;
    const returnsCount = myOrders.filter((o: any) => o.status === 'REFUNDED' || o.status === 'CANCELLED').length;

    const membership = useMemo(() => {
        const order: PlanTier[] = ['STARTER', 'PRO', 'PREMIUM', 'ENTERPRISE'];
        let best: PlanTier = 'STARTER';
        for (const store of myStores) {
            const tier = store.planTier || store.settings?.subscription?.tier || 'STARTER';
            if (order.indexOf(tier) > order.indexOf(best)) best = tier;
        }
        if (best === 'ENTERPRISE') return { label: 'Enterprise Member', color: 'text-purple-600 dark:text-purple-400' };
        if (best === 'PREMIUM') return { label: 'Premium Member', color: 'text-amber-600 dark:text-amber-400' };
        if (best === 'PRO') return { label: 'Pro Member', color: 'text-blue-600 dark:text-blue-400' };
        return { label: user.role === 'admin' ? 'Admin Member' : 'Community Member', color: 'text-emerald-600 dark:text-emerald-400' };
    }, [myStores, user.role]);

    const navItems: { id: ProfileSection; icon: React.ElementType; label: string; count?: number }[] = [
        { id: 'overview', icon: UserIcon, label: 'Overview' },
        { id: 'orders', icon: Package, label: 'All Orders', count: myOrders.length },
        { id: 'unpaid', icon: Wallet, label: 'Unpaid', count: pendingCount },
        { id: 'processing', icon: Clock, label: 'Processing', count: processingCount },
        { id: 'shipped', icon: Truck, label: 'Shipped', count: shippedCount },
        { id: 'review', icon: Star, label: 'To Review', count: reviewCount },
        { id: 'returns', icon: RotateCcw, label: 'Returns', count: returnsCount },
        { id: 'coupons', icon: Ticket, label: 'Coupons' },
        { id: 'giftcards', icon: Gift, label: 'Gift Cards' },
        { id: 'addresses', icon: MapPin, label: 'Addresses' },
        { id: 'support', icon: Headphones, label: 'Support' },
        { id: 'history', icon: Clock, label: 'History' },
        { id: 'security', icon: Shield, label: 'Security' },
        { id: 'creator', icon: StoreIcon, label: 'Creator' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Orders</h2>
                                <button onClick={() => setActiveSection('orders')} className="text-xs font-bold text-gray-500 flex items-center gap-1 hover:text-indigo-600">View All <ChevronRight size={14} /></button>
                            </div>
                            <div className="flex justify-between px-2">
                                {[
                                    { icon: Wallet, label: 'Unpaid', count: pendingCount, tab: 'unpaid' as ProfileSection },
                                    { icon: Package, label: 'Processing', count: processingCount, tab: 'processing' as ProfileSection },
                                    { icon: Truck, label: 'Shipped', count: shippedCount, tab: 'shipped' as ProfileSection },
                                    { icon: Star, label: 'Review', count: reviewCount, tab: 'review' as ProfileSection },
                                    { icon: RotateCcw, label: 'Returns', count: returnsCount, tab: 'returns' as ProfileSection },
                                ].map(({ icon: Icon, label, count, tab }) => (
                                    <button key={tab} onClick={() => setActiveSection(tab)} className="flex flex-col items-center gap-2 group relative">
                                        <div className="p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm group-hover:border-indigo-500 group-hover:text-indigo-600 transition-all relative">
                                            <Icon size={24} />
                                            {count > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">{count}</span>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-indigo-600">{label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-8 space-y-4">
                                {filteredOrders.length > 0 ? filteredOrders.slice(0, 3).map((order: any) => (
                                    <div key={order.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                        <div className="w-16 h-16 rounded-lg bg-white dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                            {order.items?.[0]?.imageUrl ? <img src={order.items[0].imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><Package size={20} className="text-gray-400" /></div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{order.store?.name || 'Store'}</h4>
                                                    <p className="text-xs text-gray-500">Order ID: {order.id.slice(0, 8).toUpperCase()}</p>
                                                </div>
                                                <StatusBadge status={order.status} />
                                            </div>
                                            <div className="mt-2 flex justify-between items-end">
                                                <p className="text-xs text-gray-500">{order.items?.length || 0} items • Total: <span className="font-bold text-gray-900 dark:text-white">${order.total?.toFixed(2)}</span></p>
                                                <button className="text-xs font-bold border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">Track</button>
                                            </div>
                                        </div>
                                    </div>
                                )) : <EmptyState icon={Package} title="No orders yet" desc="Start shopping to see your orders here" action={() => onNavigate('/shop')} actionLabel="Browse Products" />}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">Services</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { icon: Ticket, label: 'Coupons', desc: 'Save more', color: 'bg-pink-500', tab: 'coupons' as ProfileSection },
                                    { icon: Gift, label: 'Gift Cards', desc: 'Balance: $0', color: 'bg-purple-500', tab: 'giftcards' as ProfileSection },
                                    { icon: MapPin, label: 'Addresses', desc: 'Manage shipping', color: 'bg-blue-500', tab: 'addresses' as ProfileSection },
                                    { icon: Headphones, label: 'Support', desc: '24/7 Help', color: 'bg-green-500', tab: 'support' as ProfileSection },
                                    { icon: Clock, label: 'History', desc: 'Recently viewed', color: 'bg-orange-500', tab: 'history' as ProfileSection },
                                    { icon: Shield, label: 'Security', desc: twoFactorStatus?.enabled ? '2FA Enabled' : 'Enable 2FA', color: 'bg-indigo-500', tab: 'security' as ProfileSection },
                                    { icon: StoreIcon, label: 'Creator', desc: 'Sell on App', color: 'bg-gray-800', tab: 'creator' as ProfileSection },
                                ].map(({ icon: Icon, label, desc, color, tab }) => (
                                    <button key={tab} onClick={() => setActiveSection(tab)} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow h-full w-full text-center">
                                        <div className={`p-3 rounded-full ${color} bg-opacity-10 mb-3`}>
                                            <Icon size={24} className={color.replace('bg-', 'text-')} />
                                        </div>
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{label}</h4>
                                        <p className="text-[10px] text-gray-500">{desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'orders':
            case 'unpaid':
            case 'processing':
            case 'shipped':
            case 'review':
                return (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setActiveSection('overview')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowLeft size={20} /></button>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{activeSection === 'orders' ? 'All Orders' : activeSection}</h2>
                        </div>
                        <div className="space-y-4">
                            {filteredOrders.length > 0 ? filteredOrders.map((order: any) => (
                                <div key={order.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                    <div className="w-20 h-20 rounded-lg bg-white dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                        {order.items?.[0]?.imageUrl ? <img src={order.items[0].imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><Package size={24} className="text-gray-400" /></div>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{order.store?.name || 'Store'}</h4>
                                                <p className="text-xs text-gray-500">Order ID: {order.id.slice(0, 8).toUpperCase()}</p>
                                                <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <StatusBadge status={order.status} />
                                                <StatusBadge status={order.paymentStatus} />
                                            </div>
                                        </div>
                                        <div className="mt-2 flex justify-between items-end">
                                            <p className="text-xs text-gray-500">{order.items?.length || 0} items • <span className="font-bold text-gray-900 dark:text-white">${order.total?.toFixed(2)}</span></p>
                                            <div className="flex gap-2">
                                                <button className="text-xs font-bold border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">Track</button>
                                                {order.status === 'DELIVERED' && <button className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700">Review</button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : <EmptyState icon={Package} title={`No ${activeSection} orders`} desc="Orders will appear here" />}
                        </div>
                    </div>
                );

            case 'returns':
                return (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setActiveSection('overview')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowLeft size={20} /></button>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Returns & Refunds</h2>
                        </div>
                        {myOrders.filter((o: any) => o.status === 'REFUNDED' || o.status === 'CANCELLED').length > 0 ? (
                            <div className="space-y-4">
                                {myOrders.filter((o: any) => o.status === 'REFUNDED' || o.status === 'CANCELLED').map((order: any) => (
                                    <div key={order.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                        <div className="w-16 h-16 rounded-lg bg-white dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                            {order.items?.[0]?.imageUrl ? <img src={order.items[0].imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><RotateCcw size={20} className="text-gray-400" /></div>}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{order.store?.name || 'Store'}</h4>
                                            <p className="text-xs text-gray-500">Order ID: {order.id.slice(0, 8).toUpperCase()}</p>
                                            <div className="mt-2 flex justify-between items-center">
                                                <StatusBadge status={order.status} />
                                                <span className="font-bold text-gray-900 dark:text-white">${order.total?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyState icon={RotateCcw} title="No returns" desc="Return requests will appear here" />}
                    </div>
                );

            case 'coupons':
                return (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setActiveSection('overview')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowLeft size={20} /></button>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Coupons</h2>
                        </div>
                        <EmptyState icon={Ticket} title="No coupons yet" desc="Coupons and promo codes will appear here" action={() => onNavigate('/shop')} actionLabel="Browse Products" />
                    </div>
                );

            case 'giftcards':
                return (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setActiveSection('overview')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowLeft size={20} /></button>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gift Cards</h2>
                        </div>
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-sm opacity-80">Gift Card Balance</p>
                                    <p className="text-3xl font-black">$0.00</p>
                                </div>
                                <Gift size={32} className="opacity-50" />
                            </div>
                            <p className="text-sm opacity-80">Redeem a gift card to add balance</p>
                        </div>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Enter gift card code" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                            <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700">Redeem</button>
                        </div>
                    </div>
                );

            case 'addresses':
                return (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setActiveSection('overview')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowLeft size={20} /></button>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                        </div>
                        <EmptyState icon={MapPin} title="No saved addresses" desc="Add addresses for faster checkout" action={() => { }} actionLabel="Add Address" />
                    </div>
                );

            case 'support':
                return (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setActiveSection('overview')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowLeft size={20} /></button>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Support Center</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {[
                                { icon: MessageSquare, title: 'Live Chat', desc: 'Chat with our support team' },
                                { icon: Mail, title: 'Email Support', desc: 'support@acommerce.com' },
                                { icon: Phone, title: 'Phone Support', desc: '1-800-ACOMMERCE' },
                                { icon: FileText, title: 'Help Center', desc: 'Browse FAQs and guides' },
                            ].map(({ icon: Icon, title, desc }) => (
                                <button key={title} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-indigo-500 transition-colors text-left">
                                    <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"><Icon size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{title}</h4>
                                        <p className="text-xs text-gray-500">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'history':
                return (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setActiveSection('overview')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowLeft size={20} /></button>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order History</h2>
                        </div>
                        {myOrders.length > 0 ? (
                            <div className="space-y-4">
                                {myOrders.map((order: any) => (
                                    <div key={order.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                        <div className="w-16 h-16 rounded-lg bg-white dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                            {order.items?.[0]?.imageUrl ? <img src={order.items[0].imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><Clock size={20} className="text-gray-400" /></div>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{order.store?.name || 'Store'}</h4>
                                                    <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <StatusBadge status={order.status} />
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white mt-1">${order.total?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyState icon={Clock} title="No history" desc="Your order history will appear here" />}
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <button onClick={() => setActiveSection('overview')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowLeft size={20} /></button>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security Settings</h2>
                            </div>
                            <div className="space-y-4">
                                <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-indigo-500 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"><Lock size={24} /></div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Change Password</h4>
                                            <p className="text-xs text-gray-500">Update your account password</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-400" />
                                </button>
                                <button onClick={() => setShowTwoFactorModal(true)} className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-indigo-500 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded bg-green-100 dark:bg-green-900/30 text-green-600"><Smartphone size={24} /></div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                                            <p className="text-xs text-gray-500">{twoFactorStatus?.enabled ? 'Enabled' : 'Not enabled'}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {showPasswordModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full">
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
                                        <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X size={20} /></button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                            <div className="relative">
                                                <input type={showCurrentPassword ? 'text' : 'password'} value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-12" placeholder="Enter current password" />
                                                <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                            <div className="relative">
                                                <input type={showNewPassword ? 'text' : 'password'} value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-12" placeholder="Enter new password" />
                                                <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                            <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Confirm new password" />
                                        </div>
                                        <button onClick={() => { showToast('Password updated!', 'success'); setShowPasswordModal(false); setPasswordForm({ current: '', new: '', confirm: '' }); }} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Update Password</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showTwoFactorModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Shield size={24} className="text-indigo-600" />Two-Factor Authentication</h2>
                                        <button onClick={() => { setShowTwoFactorModal(false); setTwoFactorStep('setup'); setTwoFactorSetupData(null); setPasswordFor2FA(''); setVerificationCode(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X size={20} /></button>
                                    </div>
                                    <div className="p-6">
                                        {twoFactorStatus?.enabled ? (
                                            <div className="space-y-4">
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                                                    <ShieldCheck size={48} className="mx-auto text-green-500 mb-2" />
                                                    <h3 className="font-bold text-green-700 dark:text-green-400">2FA is Enabled</h3>
                                                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">{twoFactorStatus.backupCodesCount} backup codes remaining.</p>
                                                </div>
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                                                    <div className="flex items-start gap-3">
                                                        <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">Warning</h4>
                                                            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Disabling 2FA will make your account less secure.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Password</label>
                                                    <input type="password" value={passwordFor2FA} onChange={(e) => setPasswordFor2FA(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Enter your password" />
                                                </div>
                                                <button onClick={() => disableTwoFactorMutation.mutate({ password: passwordFor2FA })} disabled={!passwordFor2FA || disableTwoFactorMutation.isPending} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl disabled:opacity-50 transition-colors">
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
                                                            <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Password</label>
                                                            <input type="password" value={passwordFor2FA} onChange={(e) => setPasswordFor2FA(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Enter your password" />
                                                        </div>
                                                        <button onClick={() => setupTwoFactorMutation.mutate({ password: passwordFor2FA })} disabled={!passwordFor2FA || setupTwoFactorMutation.isPending} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50 transition-colors">
                                                            {setupTwoFactorMutation.isPending ? 'Generating...' : 'Continue'}
                                                        </button>
                                                    </>
                                                )}
                                                {twoFactorStep === 'verify' && twoFactorSetupData && (
                                                    <>
                                                        <div className="text-center mb-4">
                                                            <Key size={48} className="mx-auto text-indigo-500 mb-2" />
                                                            <h3 className="font-bold text-gray-900 dark:text-white">Scan QR Code</h3>
                                                            <p className="text-sm text-gray-500 mt-1">Scan with your authenticator app.</p>
                                                        </div>
                                                        <div className="flex justify-center mb-4">
                                                            <img src={twoFactorSetupData.qrCode} alt="QR Code" className="w-48 h-48" />
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
                                                            <p className="text-xs text-gray-500 text-center mb-2">Or enter this secret manually:</p>
                                                            <p className="text-sm font-mono text-center text-gray-900 dark:text-white break-all">{twoFactorSetupData.secret}</p>
                                                        </div>
                                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-4">
                                                            <h4 className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">Save Your Backup Codes</h4>
                                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                                {twoFactorSetupData.backupCodes.map((code: string, i: number) => (
                                                                    <code key={i} className="text-xs bg-white dark:bg-gray-900 p-2 rounded border border-yellow-200 dark:border-yellow-800 font-mono text-center">{code}</code>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification Code</label>
                                                            <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-2xl font-mono tracking-widest" placeholder="000000" maxLength={6} />
                                                        </div>
                                                        <button onClick={() => verifyTwoFactorMutation.mutate({ code: verificationCode })} disabled={verificationCode.length !== 6 || verifyTwoFactorMutation.isPending} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50 transition-colors">
                                                            {verifyTwoFactorMutation.isPending ? 'Verifying...' : 'Verify & Enable 2FA'}
                                                        </button>
                                                    </>
                                                )}
                                                {twoFactorStep === 'enabled' && (
                                                    <div className="text-center py-8">
                                                        <ShieldCheck size={64} className="mx-auto text-green-500 mb-4" />
                                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">2FA Enabled!</h3>
                                                        <p className="text-sm text-gray-500 mt-2 mb-6">Your account is now protected.</p>
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
                );

            case 'creator':
                return (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={() => setActiveSection('overview')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><ArrowLeft size={20} /></button>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Creator Dashboard</h2>
                        </div>
                        {myStores.length > 0 ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                    {[
                                        { label: 'Total Stores', value: myStores.length, icon: StoreIcon, color: 'text-indigo-600' },
                                        { label: 'Total Revenue', value: '$0', icon: TrendingUp, color: 'text-green-600' },
                                        { label: 'Total Orders', value: myOrders.length, icon: Package, color: 'text-blue-600' },
                                        { label: 'Followers', value: '0', icon: Users, color: 'text-purple-600' },
                                    ].map(({ label, value, icon: Icon, color }) => (
                                        <div key={label} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                            <Icon size={20} className={`mb-2 ${color}`} />
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                                            <p className="text-xs text-gray-500">{label}</p>
                                        </div>
                                    ))}
                                </div>
                                {myStores.map((store: any) => (
                                    <div key={store.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600">{store.name.charAt(0)}</div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">{store.name}</h4>
                                                <p className="text-xs text-gray-500">{store.products?.length || 0} products</p>
                                            </div>
                                        </div>
                                        <button onClick={() => onNavigate(`/store/${store.id}/admin`)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Manage</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={StoreIcon} title="No stores yet" desc="Create your first store to start selling" action={() => onNavigate('/')} actionLabel="Create Store" />
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
                {/* Header with Banner */}
                <div className="relative">
                    <div className="h-48 sm:h-56 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
                        {bannerUrl && <img src={bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />}
                        <div className="absolute inset-0 bg-black/20"></div>
                        <button
                            onClick={() => bannerInputRef.current?.click()}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                            disabled={uploadingImage === 'banner'}
                        >
                            {uploadingImage === 'banner' ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={18} />}
                        </button>
                        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')} />
                    </div>

                    <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
                        <div className="flex items-end gap-4">
                            <div className="relative">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-950 shadow-lg overflow-hidden flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl sm:text-4xl font-bold text-gray-400">{user.name.charAt(0)}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg"
                                    disabled={uploadingImage === 'avatar'}
                                >
                                    {uploadingImage === 'avatar' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload size={14} />}
                                </button>
                                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatar')} />
                            </div>
                            <div className="pb-2 flex-1">
                                {isEditing ? (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-lg font-bold" value={name} onChange={e => setName(e.target.value)} />
                                        <div className="flex gap-2">
                                            <button onClick={handleSaveProfile} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-1"><Check size={14} /> Save</button>
                                            <button onClick={() => { setIsEditing(false); setName(user.name); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {user.name}
                                            <button onClick={() => { setName(user.name); setIsEditing(true); }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"><Settings size={16} className="text-gray-500" /></button>
                                        </h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><Mail size={12} /> {user.email}</p>
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:block pb-2">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Membership Badge */}
                    <div className="flex items-center justify-between mb-6">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm`}>
                            <Award size={16} className={membership.color} />
                            <span className={`text-sm font-bold ${membership.color}`}>{membership.label}</span>
                        </div>
                        <p className="text-xs text-gray-500">Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                        {navItems.map(({ id, icon: Icon, label, count }) => (
                            <button
                                key={id}
                                onClick={() => setActiveSection(id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeSection === id
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-indigo-500'
                                    }`}
                            >
                                <Icon size={16} />
                                {label}
                                {count !== undefined && count > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSection === id ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>{count}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {renderContent()}

                    {/* Sign Out */}
                    <div className="pt-8 pb-12 text-center">
                        <button onClick={() => { logout(); navigate('/login'); }} className="text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-3 rounded-full mx-auto transition-colors">
                            <LogOut size={16} /> Sign Out
                        </button>
                        <p className="text-xs text-gray-400 mt-4">Version 2.5.0</p>
                    </div>
                </div>
            </div>
        </>
    );
};
