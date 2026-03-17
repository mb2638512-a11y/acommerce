import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Store, ShoppingCart, Zap, Shield, Rocket, Globe, ArrowRight, LayoutDashboard,
    Database, CreditCard, ShoppingBag, BarChart3, Users, Smartphone,
    ChevronRight, CheckCircle2, Play, Sparkles
} from 'lucide-react';
import { ThemeToggle } from '../context/ThemeContext';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden transition-colors duration-500">
            {/* Background Ambient Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-500/10 blur-[150px] animate-blob"></div>
                <div className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-500/10 blur-[150px] animate-blob" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/60 dark:bg-black/60 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-black text-2xl tracking-tighter cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={22} className="text-white" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 font-heading">
                            ACommerce
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Features</a>
                        <a href="#solutions" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Solutions</a>
                        <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Pricing</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">Sign In</button>
                        <button onClick={() => navigate('/login')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all hover:scale-105 hover:shadow-xl shadow-indigo-500/20">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-44 pb-24 md:pt-56 md:pb-40 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-10 animate-fade-in-up shadow-sm">
                        <Sparkles size={14} className="animate-pulse" /> Unified Commerce Engine
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-10 leading-[0.9] animate-fade-in-up font-heading">
                        Build For <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 animate-gradient">The Future.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed animate-fade-in-up font-medium" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                        Deploy enterprise-grade storefronts in seconds. Scalable, design-forward, and integrated with the world's most powerful commerce tools.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                        <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-lg uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1">
                            Deploy Free
                        </button>
                        <button onClick={() => navigate('/shop')} className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-full font-black text-lg uppercase tracking-widest transition-all hover:-translate-y-1 glass-card">
                            Shop Market
                        </button>
                    </div>

                    {/* Visual Preview */}
                    <div className="mt-32 relative mx-auto max-w-6xl animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
                        <div className="absolute -inset-10 bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl -z-10 rounded-full"></div>
                        <div className="rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden glass-card p-4">
                            <div className="rounded-[1.5rem] overflow-hidden border border-slate-100 dark:border-white/5 relative bg-white dark:bg-slate-950">
                                <img
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e3f890?q=80&w=2400&auto=format&fit=crop"
                                    alt="Platform Preview"
                                    className="w-full h-auto opacity-90 transition-opacity hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-black/40 pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-40 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight font-heading">Everything You Need.</h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium tracking-wide">Enterprise power meets radical simplicity.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: "Edge Network", desc: "Sub-50ms catalog loading worldwide.", color: "indigo" },
                            { icon: Shield, title: "Vault Security", desc: "Bank-grade transaction monitoring.", color: "purple" },
                            { icon: Globe, title: "Global Scale", desc: "Built to handle millions of SKU's.", color: "pink" }
                        ].map((feature, i) => (
                            <div key={i} className="p-10 rounded-[2.5rem] glass-card group hover:-translate-y-2 transition-all duration-500">
                                <div className={`w-14 h-14 bg-${feature.color}-50 dark:bg-${feature.color}-500/10 rounded-2xl flex items-center justify-center text-${feature.color}-600 dark:text-${feature.color}-400 mb-8 border border-${feature.color}-100 dark:border-${feature.color}-500/20 group-hover:rotate-6 transition-transform`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-2xl font-black mb-4 font-heading">{feature.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-24 border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-3 font-black text-2xl tracking-tighter mb-8">
                        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                            <ShoppingBag size={18} className="text-white dark:text-black" />
                        </div>
                        <span className="font-heading">ACommerce</span>
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest mb-12">Building the future of digital storefronts.</p>
                    <div className="flex justify-center gap-8 text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
                    </div>
                    <div className="mt-12 text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} ACommerce Inc. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
