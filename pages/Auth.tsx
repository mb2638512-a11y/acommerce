import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, User, Mail, Lock, Loader2, Eye, EyeOff, Shield, Zap, Sparkles, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ThemeToggle } from '../context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import api from '../src/lib/api';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import { getPostLoginRoute } from '../src/lib/adminAccess';

type AuthMode = 'signin' | 'signup' | 'forgot_password';

export const Auth: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [step, setStep] = useState<1 | 2>(1); // Step 1: Email, Step 2: Password/Details

    // Form State
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Recovery State
    const [recoveryEmailSent, setRecoveryEmailSent] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const { showToast } = useToast();
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return showToast("Email is required", "error");

        if (mode === 'forgot_password') {
            handleForgotPassword();
        } else {
            setStep(2);
        }
    };

    const handleForgotPassword = async () => {
        setLoading(true);
        try {
            // In a real app, this would hit an actual endpoint: await api.post('/auth/forgot-password', { email });
            // Simulating API call for now since backend doesn't have this yet
            await new Promise(resolve => setTimeout(resolve, 1500));
            setRecoveryEmailSent(true);
            showToast("Password reset link sent to your email.", "success");
        } catch (error) {
            showToast("Failed to send reset link. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/#/auth/callback`
                }
            });
            if (error) throw error;
        } catch (error: any) {
            showToast(error.message || 'Google Auth Error', 'error');
            setLoading(false);
        }
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return showToast("Password is required", "error");

        if (mode === 'signup') {
            if (!name.trim()) return showToast("Name is required", "error");
            if (password !== confirmPassword) return showToast("Passwords do not match", "error");
            if (password.length < 6) return showToast("Password must be at least 6 characters", "error");
        }

        setLoading(true);
        try {
            const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login';
            const payload = mode === 'signup'
                ? { email, password, name: name.trim() }
                : { email, password };

            const res = await api.post(endpoint, payload);
            login(res.data.token, res.data.user);
            showToast(mode === 'signup' ? 'Account created successfully.' : `Welcome back, ${res.data.user.name}!`, "success");

            if (res.data.user.isVerified === false) {
                navigate('/verify');
            } else {
                navigate(getPostLoginRoute(res.data.user));
            }
        } catch (error: any) {
            const apiMessage = error?.response?.data?.error;
            showToast(apiMessage || (mode === 'signup' ? 'Registration failed.' : 'Invalid credentials.'), "error");
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setStep(1);
        setPassword('');
        setConfirmPassword('');
        setRecoveryEmailSent(false);
    };

    const InputField = ({ icon: Icon, type, value, onChange, label, autoFocus = false, extraProps = {} }: any) => {
        const [focused, setFocused] = useState(false);
        const isFilled = value.length > 0;
        const active = focused || isFilled;

        return (
            <div className="relative group/input mt-6">
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-focus-within/input:opacity-50 transition duration-500 ${extraProps.disabled ? 'hidden' : ''}`}></div>
                <div className={`relative flex items-center bg-white dark:bg-black/40 border rounded-2xl transition-all duration-300 ${extraProps.disabled ? 'border-gray-100 dark:border-white/5 opacity-60 bg-gray-50 dark:bg-white/5' : 'border-gray-200 dark:border-white/10 focus-within:border-indigo-500'}`}>
                    <Icon className={`absolute left-4 transition-colors duration-300 ${focused ? 'text-indigo-500' : 'text-gray-400'}`} size={20} />
                    <label className={`absolute left-12 transition-all duration-300 pointer-events-none ${active ? '-top-3 text-[10px] font-bold tracking-wider uppercase px-2 bg-white dark:bg-[#0a0f1d] text-indigo-500 dark:text-indigo-400 rounded-full' : 'top-4 text-sm text-gray-400'}`}>
                        {label}
                    </label>
                    <input
                        type={type} required autoFocus={autoFocus} value={value} onChange={onChange}
                        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                        className={`w-full pl-12 pr-4 py-4 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-transparent text-sm ${extraProps.disabled ? 'cursor-not-allowed text-gray-400' : ''}`}
                        placeholder={label}
                        {...extraProps}
                    />
                </div>
            </div>
        );
    };

    // Calculate password strength indicator (Simple example)
    const getPwdStrength = () => {
        let score = 0;
        if (password.length > 6) score += 1;
        if (password.match(/[A-Z]/)) score += 1;
        if (password.match(/[0-9]/)) score += 1;
        if (password.match(/[^a-zA-Z0-9]/)) score += 1;

        return score;
    };

    const strengthScore = getPwdStrength();
    const strengthColors = ['bg-gray-200 dark:bg-white/10', 'bg-red-500', 'bg-yellow-500', 'bg-emerald-400', 'bg-emerald-500'];
    const currentStrengthColor = password.length > 0 ? strengthColors[strengthScore] : strengthColors[0];

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-50 dark:bg-[#030305] font-sans selection:bg-indigo-500/30">
            {/* Ambient Background for Dark Mode */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 hidden dark:block">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen opacity-50 animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen opacity-50 animate-blob animation-delay-2000"></div>
            </div>

            {/* Left Side: Branding & Value Props */}
            <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden z-10 border-r border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-3xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
                <div className="absolute top-1/4 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none animate-float"></div>

                <div className="flex items-center justify-between relative z-20">
                    <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-gray-900 dark:text-white cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-md rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                            <div className="bg-gradient-to-br from-gray-900 to-black dark:from-indigo-500 dark:to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xl relative transform group-hover:scale-105 transition-transform duration-300">
                                <ShoppingBag size={24} />
                            </div>
                        </div>
                        ACommerce
                    </div>
                    <ThemeToggle />
                </div>

                <div className="relative z-20 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-8 shadow-sm animate-fade-in-up">
                        <Sparkles size={14} className="animate-pulse" /> Advanced Unified Platform
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-[1.15] text-gray-900 dark:text-white tracking-tight animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                        Elevate your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 animate-gradient-x">digital enterprise</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-md animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
                        Join the elite tier of digital architects. ACommerce provides the advanced infrastructure needed to scale your operations globally.
                    </p>

                    <div className="space-y-5">
                        {[
                            { icon: Zap, title: "Lightning Fast API", desc: "Sub-50ms response times globally", delay: '300ms' },
                            { icon: Shield, title: "Enterprise Security", desc: "Bank-grade quantum encryption", delay: '400ms' },
                            { icon: CheckCircle2, title: "99.99% Uptime", desc: "Distributed resilient architecture", delay: '500ms' },
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: feature.delay, animationFillMode: 'both' }}>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                                    <feature.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-20 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 pt-8 border-t border-gray-200 dark:border-white/10">
                    <span>&copy; {new Date().getFullYear()} ACommerce Inc.</span>
                    <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Terms & Privacy</a>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex flex-col justify-center items-center p-6 lg:p-12 relative z-10 w-full">
                {/* Mobile Header */}
                <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2 font-black text-xl text-gray-900 dark:text-white" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
                        <ShoppingBag size={16} />
                    </div>
                    ACommerce
                </div>
                <div className="lg:hidden absolute top-6 right-6">
                    <ThemeToggle />
                </div>

                <div className={`w-full max-w-md transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>

                    {/* Glass Form Card */}
                    <div className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative">

                        {/* Quick Navigation / Back Button */}
                        {(step > 1 || mode === 'forgot_password') && (
                            <button
                                onClick={() => {
                                    if (recoveryEmailSent) {
                                        switchMode('signin');
                                    } else if (mode === 'forgot_password') {
                                        switchMode('signin');
                                    } else {
                                        setStep(1);
                                    }
                                }}
                                className="absolute top-8 left-8 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                            >
                                <ArrowLeft size={14} /> Back
                            </button>
                        )}

                        <div className="text-center mb-10 pt-4">
                            {mode === 'forgot_password' ? (
                                <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                    <KeyRound size={24} />
                                </div>
                            ) : null}

                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                                {mode === 'signup' ? 'Create Account' :
                                    mode === 'forgot_password' ? (recoveryEmailSent ? 'Check Your Inbox' : 'Reset Password') :
                                        'Welcome Back'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                                {mode === 'signup' ? 'Enter your details to create your workspace.' :
                                    mode === 'forgot_password' ? (recoveryEmailSent ? 'We sent a password reset link to your email.' : 'Enter your email address and we will send you a link to reset your password.') :
                                        'Enter your credentials to access your dashboard.'}
                            </p>
                        </div>

                        <div className="space-y-6">

                            {/* FORGOT PASSWORD MODE */}
                            {mode === 'forgot_password' ? (
                                recoveryEmailSent ? (
                                    <div className="animate-fade-in text-center pb-4">
                                        <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-center gap-3 mb-8">
                                            <Mail size={18} className="text-gray-400" />
                                            <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
                                        </div>
                                        <button onClick={() => switchMode('signin')} className="w-full bg-gray-900 hover:bg-black text-white dark:bg-gradient-to-r dark:from-indigo-600 dark:to-purple-600 rounded-2xl py-4 font-bold shadow-lg transition-all">
                                            Return to Sign In
                                        </button>
                                        <div className="mt-6 text-xs text-gray-500">
                                            Didn't receive the email? <button onClick={handleForgotPassword} disabled={loading} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Click to resend</button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleEmailSubmit} className="animate-fade-in">
                                        <InputField icon={Mail} type="email" label="Account Email Address" value={email} onChange={(e: any) => setEmail(e.target.value)} autoFocus />

                                        <button type="submit" disabled={loading} className="w-full mt-8 bg-gray-900 hover:bg-black text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-2xl py-4 flex items-center justify-center gap-2 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group disabled:opacity-70 disabled:cursor-not-allowed">
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                                <>
                                                    Send Reset Link
                                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )
                            )

                                /* STEP 1: EMAIL (SIGN IN / SIGN UP) */
                                : step === 1 ? (
                                    <form onSubmit={handleEmailSubmit} className="animate-fade-in">
                                        <InputField icon={Mail} type="email" label="Email Address" value={email} onChange={(e: any) => setEmail(e.target.value)} autoFocus />

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-70 group"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : mode === 'signin' ? 'Access Enterprise' : 'Deploy Unified Store'}
                                            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                                        </button>

                                        {/* Google Auth Divider & Button */}
                                        <div className="relative mt-8">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-4 bg-white/70 dark:bg-black/40 text-gray-500">Or continue strategically with</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleGoogleLogin}
                                            disabled={loading}
                                            className="w-full py-4 mt-6 bg-white dark:bg-[#131827] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm disabled:opacity-70 group"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Google Business
                                        </button>
                                    </form>
                                )

                                    /* STEP 2: DETAILS & PASSWORD */
                                    : (
                                        <form onSubmit={handleFinalSubmit} className="animate-fade-in-up">
                                            {/* Email display pill */}
                                            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between mb-6 shadow-sm">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                                                        <User size={18} />
                                                    </div>
                                                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                        {email}
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 flex-shrink-0 bg-indigo-50 dark:bg-transparent rounded-lg">
                                                    Change
                                                </button>
                                            </div>

                                            {mode === 'signup' && (
                                                <div className="mb-6">
                                                    <InputField icon={User} type="text" label="Full Name" value={name} onChange={(e: any) => setName(e.target.value)} autoFocus />
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <div className="relative group/input">
                                                    <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 focus-within:opacity-50 transition duration-500`}></div>
                                                    <div className="relative flex items-center bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl transition-all duration-300 focus-within:border-indigo-500">
                                                        <Lock className="absolute left-4 text-gray-400 focus-within:text-indigo-500 transition-colors" size={20} />
                                                        <input
                                                            type={showPassword ? "text" : "password"} required autoFocus={mode !== 'signup'} value={password} onChange={(e) => setPassword(e.target.value)}
                                                            className="w-full pl-12 pr-12 py-4 bg-transparent border-none outline-none text-gray-900 dark:text-white font-mono tracking-widest text-lg placeholder:text-gray-400/50 placeholder:font-sans placeholder:tracking-normal placeholder:text-sm"
                                                            placeholder="Password"
                                                        />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-indigo-500 transition-colors">
                                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {mode === 'signup' && password.length > 0 && (
                                                    <div className="flex gap-1 px-1 h-1 transition-all">
                                                        {[1, 2, 3, 4].map(idx => (
                                                            <div key={idx} className={`h-full flex-1 rounded-full transition-colors duration-300 ${strengthScore >= idx ? currentStrengthColor : 'bg-gray-200 dark:bg-white/10'}`}></div>
                                                        ))}
                                                    </div>
                                                )}

                                                {mode === 'signup' && (
                                                    <div className="relative group/input">
                                                        <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 focus-within:opacity-50 transition duration-500`}></div>
                                                        <div className={`relative flex items-center bg-white dark:bg-black/40 border rounded-2xl transition-all duration-300 ${confirmPassword.length > 0 && password !== confirmPassword ? 'border-red-500 dark:border-red-500/50' : 'border-gray-200 dark:border-white/10 focus-within:border-indigo-500'}`}>
                                                            <Shield className={`absolute left-4 transition-colors ${confirmPassword.length > 0 && password !== confirmPassword ? 'text-red-500' : 'text-gray-400 focus-within:text-indigo-500'}`} size={20} />
                                                            <input
                                                                type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                                                className="w-full pl-12 pr-12 py-4 bg-transparent border-none outline-none text-gray-900 dark:text-white font-mono tracking-widest text-lg placeholder:text-gray-400/50 placeholder:font-sans placeholder:tracking-normal placeholder:text-sm"
                                                                placeholder="Confirm Password"
                                                            />
                                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 text-gray-400 hover:text-indigo-500 transition-colors">
                                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                            </button>
                                                        </div>
                                                        {confirmPassword.length > 0 && password !== confirmPassword && (
                                                            <p className="text-red-500 text-xs font-medium ml-2 mt-2">Passwords do not match</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {mode === 'signin' && (
                                                <div className="flex justify-end mt-4">
                                                    <button type="button" onClick={() => switchMode('forgot_password')} className="text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                        Forgot password?
                                                    </button>
                                                </div>
                                            )}

                                            <button type="submit" disabled={loading} className="w-full mt-8 bg-gray-900 hover:bg-black text-white dark:bg-gradient-to-r dark:from-indigo-600 dark:to-purple-600 rounded-2xl py-4 flex items-center justify-center gap-2 font-bold transition-all duration-300 shadow-xl shadow-indigo-500/20 dark:shadow-indigo-500/40 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed group">
                                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                                    <>
                                                        {mode === 'signup' ? 'Create Account' : 'Sign In'}
                                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                        </div>

                        {/* Toggle Registration/Login */}
                        {mode !== 'forgot_password' && (
                            <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-white/10">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                                    <button type="button" onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                                        {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
