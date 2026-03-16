import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Store, ShoppingCart, Zap, Shield, Rocket, Globe, ArrowRight, LayoutDashboard,
    Database, CreditCard, ShoppingBag, BarChart3, Users, Smartphone,
    ChevronRight, CheckCircle2, Play
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200 font-sans overflow-x-hidden transition-colors duration-300">
            {/* Background Ambient Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100 animate-blob"></div>
                <div className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100 animate-blob" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full bg-cyan-400/20 dark:bg-emerald-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 dark:opacity-100 animate-blob" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-[#030712]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-black text-2xl tracking-tighter cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <ShoppingBag size={22} className="text-white" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                            ACommerce
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Features</a>
                        <a href="#solutions" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Solutions</a>
                        <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Pricing</a>
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>
                        <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors">Sign In</button>
                        <button onClick={() => navigate('/login')} className="relative group overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20 dark:hover:shadow-white/20">
                            <span className="relative z-10 flex items-center gap-2">Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-40 pb-20 md:pt-52 md:pb-32 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in-up backdrop-blur-md shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-500"></span>
                        </span>
                        ACommerce OS 2.0 Live
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter mb-8 leading-[1.05] animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                        The Engine For <br className="hidden md:block" />
                        <span className="relative whitespace-nowrap">
                            <span className="absolute -inset-1 block bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/20 dark:to-purple-500/20 blur-2xl rounded-full"></span>
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Next-Gen Brands</span>
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up font-medium" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                        Launch your unified digital storefront in minutes. Scale to millions without infrastructure limits.
                        The world's most advanced, design-forward commerce OS built for modern creators.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                        <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1">
                            Start Building Free
                        </button>
                        <button onClick={() => navigate('/shop')} className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 backdrop-blur-md">
                            <Globe size={20} className="text-slate-500 dark:text-slate-400 group-hover:animate-pulse-slow" /> Explore Demo Store
                        </button>
                    </div>

                    {/* Dashboard Preview Interface */}
                    <div className="mt-24 relative mx-auto max-w-6xl animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
                        {/* Decorative background blur for interface */}
                        <div className="absolute -inset-4 bg-gradient-to-b from-indigo-500/10 to-transparent dark:from-indigo-500/20 blur-2xl rounded-[3rem] -z-10"></div>

                        <div className="rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-indigo-900/10 dark:shadow-black/50 overflow-hidden bg-white/40 dark:bg-[#0f111a]/80 backdrop-blur-2xl p-2 md:p-4">
                            <div className="rounded-[2rem] overflow-hidden border border-slate-200/50 dark:border-white/5 relative bg-white dark:bg-[#07070d]">
                                {/* Browser Window header mockup */}
                                <div className="h-12 border-b border-slate-100 dark:border-white/5 flex items-center px-6 gap-2 bg-slate-50 dark:bg-[#0f111a]">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="flex-1 flex justify-center">
                                        <div className="w-1/2 max-w-sm h-6 bg-white dark:bg-[#07070d] rounded-md border border-slate-200 dark:border-white/5 flex items-center justify-center px-3">
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">admin.acommerce.com</span>
                                        </div>
                                    </div>
                                </div>
                                <img
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e3f890?q=80&w=2400&auto=format&fit=crop"
                                    alt="Platform Dashboard Preview"
                                    className="w-full h-auto object-cover opacity-90 mix-blend-multiply dark:mix-blend-lighten"
                                />

                                {/* Floating stat cards overlay */}
                                <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 bg-white/90 dark:bg-[#0f111a]/90 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/40 animate-float" style={{ animationDuration: '6s' }}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <BarChart3 size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Live Sales</p>
                                            <p className="text-xl font-black text-slate-900 dark:text-white">+$12,450.00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By Logos */}
            <section className="py-12 border-y border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">Powering next-generation commerce brands</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder abstract shapes for logos to maintain aesthetic */}
                        {[Zap, Shield, Database, Globe, Rocket].map((Icon, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xl font-black text-slate-800 dark:text-white">
                                <Icon size={24} /> Brand{idx + 1}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Features Bento Grid */}
            <section id="features" className="py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
                            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">dominate.</span>
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                            An uncompromising suite of enterprise-grade tools, beautifully distilled into an intuitive interface designed for hyper-growth.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Large feature block 1 */}
                        <div className="md:col-span-2 p-8 md:p-12 rounded-[2rem] bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 border border-indigo-100 dark:border-indigo-500/20">
                                    <Zap size={28} />
                                </div>
                                <h3 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Lightning Fast Edge Delivery</h3>
                                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                                    Built on a globally distributed edge network. Your storefront loads in less than 50ms anywhere on Earth, aggressively caching catalog data to maximize conversion rates.
                                </p>
                            </div>
                        </div>

                        {/* Feature block 2 */}
                        <div className="p-8 md:p-10 rounded-[2rem] bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-all group overflow-hidden relative">
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mb-10 transition-transform group-hover:scale-150 duration-700"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 border border-purple-100 dark:border-purple-500/20">
                                    <Shield size={24} />
                                </div>
                                <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">Bank-Grade Security</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    SOC 2 Type II compliant, PCI-DSS Level 1 certified infrastructure. Your data and customer transactions are cryptographically locked down.
                                </p>
                            </div>
                        </div>

                        {/* Feature block 3 */}
                        <div className="p-8 md:p-10 rounded-[2rem] bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all group overflow-hidden relative">
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mb-10 transition-transform group-hover:scale-150 duration-700"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 border border-emerald-100 dark:border-emerald-500/20">
                                    <LayoutDashboard size={24} />
                                </div>
                                <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">Live Unified Analytics</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                                    Uncover deep behavioral patterns with our real-time streaming analytics engine. Actionable intelligence, not just static reports.
                                </p>
                            </div>
                        </div>

                        {/* Large feature block 4 */}
                        <div className="md:col-span-2 p-8 md:p-12 rounded-[2rem] bg-slate-900 dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-purple-900/40 border border-slate-800 dark:border-white/10 shadow-xl overflow-hidden relative text-white group">
                            {/* Abstract design element inside dark card */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl group-hover:opacity-100 opacity-50 transition-all duration-700"></div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                                        <Globe size={14} className="text-cyan-400" /> Borderless
                                    </div>
                                    <h3 className="text-3xl font-black mb-4">Born Global. Day One.</h3>
                                    <p className="text-lg text-slate-300 leading-relaxed mb-6">
                                        Out-of-the-box support for 135+ currencies, automated local taxes, real-time carrier shipping rates, and deeply localized checkout flows. Expand internationally without touching a single line of code.
                                    </p>
                                    <ul className="space-y-3">
                                        {['Multi-currency checkout', 'Automated tax compliance', 'Localized language routing'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-200 font-medium">
                                                <CheckCircle2 size={18} className="text-cyan-400" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Metrics Focus */}
            <section className="py-32 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-900/20"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {[
                            { label: "Stores Powered", value: "10,000+" },
                            { label: "Platform Uptime", value: "99.99%" },
                            { label: "GMV Processed", value: "$2.4B+" },
                            { label: "Global Reach", value: "150+" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-md">{stat.value}</div>
                                <div className="text-indigo-200 dark:text-indigo-300 font-bold uppercase tracking-widest text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA / Final Section */}
            <section className="py-40 px-6 relative z-10 overflow-hidden">
                <div className="max-w-6xl mx-auto text-center relative">
                    {/* Magical glow behind CTA */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30 blur-[100px] rounded-full z-0 pointer-events-none"></div>

                    <div className="relative z-10 bg-white/50 dark:bg-[#0f111a]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-12 md:p-24 rounded-[3rem] shadow-2xl shadow-indigo-500/10 dark:shadow-none">
                        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-slate-900 dark:text-white">
                            Ready to ignite <br /> your brand's growth?
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
                            Join elite creators and fast-growing brands building the next generation of commerce on our platform.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={() => navigate('/login')} className="px-10 py-5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-xl hover:shadow-2xl">
                                Start Your Free Trial
                            </button>
                            <button onClick={() => { }} className="px-10 py-5 bg-transparent border-2 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 text-slate-900 dark:text-white rounded-full font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                                <Play size={20} className="fill-current" /> Watch Full Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#030712] relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900 dark:text-white mb-6">
                                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                    <ShoppingBag size={18} className="text-white" />
                                </div>
                                ACommerce
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs font-medium leading-relaxed">
                                Defining the future architecture of digital commerce. Built for performance, designed for conversion.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Product</h4>
                            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Integrations</a></li>
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Changelog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Resources</h4>
                            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Developer API</a></li>
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Community</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Company</h4>
                            <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-400 font-medium text-sm">
                        <div>&copy; {new Date().getFullYear()} ACommerce Inc. All rights reserved.</div>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookie settings</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
