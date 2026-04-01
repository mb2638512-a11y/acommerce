import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    X, Check, ChevronRight, ChevronLeft, Sparkles, Loader2, 
    Rocket, Palette, Globe, DollarSign, Megaphone, ShieldClose,
    Layout, Type, Box, Heart, Zap, Link as LinkIcon, Facebook, Instagram, Twitter, Phone
} from 'lucide-react';
import api from '../src/lib/api';
import { useToast } from '../context/ToastContext';
import { generateStoreNameIdeas, generateStoreDescription } from '../services/geminiService';
import { StoreSettings } from '../types';

interface StoreCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

const STEPS = [
    { title: 'Concept', icon: <Sparkles size={18} />, description: 'Identity & Niche' },
    { title: 'Design', icon: <Palette size={18} />, description: 'Visual Identity' },
    { title: 'Commerce', icon: <DollarSign size={18} />, description: 'Finance & Tools' },
    { title: 'Social', icon: <Megaphone size={18} />, description: 'Growth Links' },
    { title: 'Launch', icon: <Rocket size={18} />, description: 'Final Review' }
];

const COLORS = [
    { name: 'Indigo', class: 'bg-indigo-500' },
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Green', class: 'bg-emerald-500' },
    { name: 'Red', class: 'bg-rose-500' },
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Amber', class: 'bg-amber-500' },
    { name: 'Pink', class: 'bg-pink-500' },
    { name: 'Cyan', class: 'bg-cyan-500' }
];

const FONTS = ['sans', 'serif', 'mono'] as const;
const RADIUS = ['none', 'sm', 'md', 'full'] as const;

export const StoreCreationWizard: React.FC<StoreCreationWizardProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '', niche: '', description: '', slug: '',
        themeColor: 'indigo', font: 'sans' as typeof FONTS[number],
        borderRadius: 'md' as typeof RADIUS[number],
        logoUrl: '', bannerUrl: '',
        currency: 'USD', taxRate: 0, shippingFee: 0, freeShippingThreshold: 100, salesGoal: 1000,
        maintenanceMode: false, announcementBar: '', supportEmail: '', businessAddress: '',
        facebook: '', instagram: '', twitter: '', whatsapp: '',
    });

    const createStoreMutation = useMutation({
        mutationFn: async (newStoreData: any) => {
            const res = await api.post('/stores', newStoreData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myStores'] });
            showToast('Store launched successfully!', 'success');
            onClose();
        },
        onError: (error: any) => {
            const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to launch store';
            showToast(msg, 'error');
        }
    });

    const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleAI = async (type: 'name' | 'desc') => {
        if (!formData.niche) { showToast('Enter your store niche first.', 'info'); return; }
        setIsGenerating(true);
        try {
            if (type === 'name') {
                const names = await generateStoreNameIdeas(formData.niche);
                setSuggestedNames(names);
            } else {
                const desc = await generateStoreDescription(formData.name || 'My Store', formData.niche);
                updateField('description', desc);
            }
        } catch (error) {
            showToast('AI suggestion failed.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.name.trim()) {
                showToast('Please enter a store name', 'error');
                return;
            }
            if (!formData.niche.trim()) {
                showToast('Please enter your store niche', 'error');
                return;
            }
        }
        setStep(s => Math.min(s + 1, 5));
    };

    const handleLaunch = () => {
        if (!formData.name.trim()) {
            showToast('Please enter a store name', 'error');
            return;
        }

        const settings: StoreSettings = {
            shippingFee: Number(formData.shippingFee) || 0,
            taxRate: Number(formData.taxRate) || 0,
            currency: formData.currency || 'USD',
            maintenanceMode: formData.maintenanceMode || false,
            freeShippingThreshold: Number(formData.freeShippingThreshold) || 100,
            salesGoal: Number(formData.salesGoal) || 1000,
            font: formData.font || 'sans',
            borderRadius: formData.borderRadius || 'md',
            logoUrl: formData.logoUrl || '',
            bannerUrl: formData.bannerUrl || '',
            announcementBar: formData.announcementBar || '',
            socialLinks: { 
                facebook: formData.facebook || '', 
                instagram: formData.instagram || '', 
                twitter: formData.twitter || '', 
                whatsapp: formData.whatsapp || '' 
            }
        };

        createStoreMutation.mutate({
            name: formData.name.trim(),
            description: formData.description || '',
            slug: formData.slug || undefined,
            themeColor: formData.themeColor || 'indigo',
            settings
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
            
            <div className="relative bg-white dark:bg-gray-950 w-full max-w-4xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="px-10 py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <div>
                        <h2 className="text-2xl font-black dark:text-white flex items-center gap-3">
                            <Rocket className="text-indigo-500" /> Launch New Store
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Scale your vision into a global business.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    
                    {/* Sidebar Steps */}
                    <div className="w-1/3 border-r border-gray-100 dark:border-white/5 p-8 hidden md:block bg-gray-50/30 dark:bg-white/[0.02]">
                        <div className="space-y-6">
                            {STEPS.map((s, i) => (
                                <div key={i} className={`flex items-center gap-4 transition-all duration-300 ${step === i + 1 ? 'scale-105' : 'opacity-40'}`}>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${step === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
                                        {step > i + 1 ? <Check size={18} /> : s.icon}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-black ${step === i + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{s.title}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{s.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-20 p-6 rounded-3xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20">
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-2">
                                <Sparkles size={14} /> Power Tip
                            </p>
                            <p className="text-[10px] text-gray-500 leading-relaxed">Use our AI engine to generate unique store names and compelling descriptions based on your niche.</p>
                        </div>
                    </div>

                    {/* Main Form Area */}
                    <div className="flex-1 overflow-y-auto p-10 bg-white dark:bg-gray-950">
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Market Niche</label>
                                    <input 
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium transition-all"
                                        placeholder="e.g. Sustainable Fashion, Tech Gadgets" 
                                        value={formData.niche} 
                                        onChange={e => updateField('niche', e.target.value)} 
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Store Identity</label>
                                        <button 
                                            onClick={() => handleAI('name')} 
                                            disabled={isGenerating}
                                            className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:underline"
                                        >
                                            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Suggest Names
                                        </button>
                                    </div>
                                    <input 
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                                        placeholder="Name your brand" 
                                        value={formData.name} 
                                        onChange={e => updateField('name', e.target.value)} 
                                    />
                                    {suggestedNames.length > 0 && (
                                        <div className="flex gap-2 flex-wrap pt-2">
                                            {suggestedNames.map(n => (
                                                <button 
                                                    key={n} 
                                                    onClick={() => updateField('name', n)}
                                                    className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 transition-colors"
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">About the Store</label>
                                        <button 
                                            onClick={() => handleAI('desc')} 
                                            disabled={isGenerating}
                                            className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:underline"
                                        >
                                            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate Bio
                                        </button>
                                    </div>
                                    <textarea 
                                        rows={4}
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium resize-none shadow-inner"
                                        placeholder="Pitch your store vision..."
                                        value={formData.description}
                                        onChange={e => updateField('description', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Global Theme Color</label>
                                    <div className="flex gap-4 flex-wrap">
                                        {COLORS.map(c => (
                                            <button 
                                                key={c.name}
                                                onClick={() => updateField('themeColor', c.name.toLowerCase())}
                                                className={`w-12 h-12 rounded-2xl ${c.class} transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center ${formData.themeColor === c.name.toLowerCase() ? 'ring-4 ring-indigo-500/40' : ''}`}
                                            >
                                                {formData.themeColor === c.name.toLowerCase() && <Check className="text-white" size={20} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Typography</label>
                                        <div className="flex bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl">
                                            {FONTS.map(f => (
                                                <button 
                                                    key={f}
                                                    onClick={() => updateField('font', f)}
                                                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${formData.font === f ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-600' : 'text-gray-500'}`}
                                                >
                                                    {f.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">UI Rounding</label>
                                        <div className="flex bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl">
                                            {RADIUS.map(r => (
                                                <button 
                                                    key={r}
                                                    onClick={() => updateField('borderRadius', r)}
                                                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${formData.borderRadius === r ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-600' : 'text-gray-500'}`}
                                                >
                                                    {r.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Base Currency</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.currency}
                                                onChange={e => updateField('currency', e.target.value)}
                                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-black appearance-none"
                                            >
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="EUR">EUR - Euro</option>
                                                <option value="GBP">GBP - Pound Sterling</option>
                                            </select>
                                            <div className="absolute right-4 top-4 text-gray-400 pointer-events-none">
                                                <ChevronRight size={18} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Sales Goal (Demo)</label>
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium pl-10"
                                                value={formData.salesGoal}
                                                onChange={e => updateField('salesGoal', e.target.value)}
                                            />
                                            <DollarSign size={16} className="absolute left-4 top-4.5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="text-center mb-2">
                                    <LinkIcon size={32} className="mx-auto text-indigo-500 mb-2" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Connect Your Social Media</h3>
                                    <p className="text-sm text-gray-500 mt-1">Help customers find you across platforms</p>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { key: 'facebook', icon: Facebook, label: 'Facebook', placeholder: 'https://facebook.com/yourstore', color: 'text-blue-600' },
                                        { key: 'instagram', icon: Instagram, label: 'Instagram', placeholder: 'https://instagram.com/yourstore', color: 'text-pink-600' },
                                        { key: 'twitter', icon: Twitter, label: 'Twitter / X', placeholder: 'https://x.com/yourstore', color: 'text-gray-700 dark:text-gray-300' },
                                        { key: 'whatsapp', icon: Phone, label: 'WhatsApp', placeholder: '+1234567890', color: 'text-green-600' },
                                    ].map(({ key, icon: Icon, label, placeholder, color }) => (
                                        <div key={key} className="flex items-center gap-3">
                                            <Icon size={20} className={color} />
                                            <input 
                                                className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
                                                placeholder={placeholder}
                                                value={(formData as any)[key]}
                                                onChange={e => updateField(key, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="text-center py-10 animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-xl shadow-green-500/10">
                                    <Check size={48} strokeWidth={3} />
                                </div>
                                <h3 className="text-3xl font-black dark:text-white">Store is Ready</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-4 leading-relaxed font-medium">Your global commerce storefront is prepared. One click to launch your independent business.</p>
                                
                                <div className="mt-10 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-left space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase text-gray-400">Brand</span>
                                        <span className="text-sm font-bold dark:text-white">{formData.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase text-gray-400">Slug</span>
                                        <span className="text-sm font-mono text-indigo-500">/{formData.slug || 'auto'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase text-gray-400">Plan</span>
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black tracking-widest uppercase border border-indigo-500/20">Starter (Free)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-10 py-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center">
                    <button 
                        onClick={() => setStep(s => s - 1)}
                        className={`px-6 py-3 font-black text-sm flex items-center gap-2 transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'}`}
                    >
                        <ChevronLeft size={18} /> Back
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-1.5 h-1.5 hidden md:flex">
                            {STEPS.map((_, i) => (
                                <div key={i} className={`w-6 rounded-full transition-all duration-500 ${step === i + 1 ? 'bg-indigo-600 w-10' : 'bg-gray-200 dark:bg-white/10'}`}></div>
                            ))}
                        </div>
                        
                        {step < 5 ? (
                            <button 
                                onClick={handleNext}
                                className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-3xl text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Continue Phase
                            </button>
                        ) : (
                            <button 
                                onClick={handleLaunch}
                                disabled={createStoreMutation.isPending}
                                className="px-12 py-4 bg-indigo-600 text-white font-black rounded-3xl text-sm shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {createStoreMutation.isPending ? <Loader2 className="animate-spin" /> : <><Rocket size={18} /> Launch Store</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
