import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Loader2, CheckCircle2, AlertTriangle, ShoppingBag } from 'lucide-react';
import api from '../src/lib/api';
import { useToast } from '../context/ToastContext';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Parse token and email from URL hash params
  useEffect(() => {
    const hash = window.location.hash;
    const queryStart = hash.indexOf('?');
    if (queryStart === -1) return;
    const params = new URLSearchParams(hash.slice(queryStart + 1));
    const t = params.get('token') || '';
    const e = params.get('email') || '';
    setToken(t);
    setEmail(decodeURIComponent(e));
    if (!t || !e) setError('Invalid or missing reset link. Please request a new one.');
  }, []);

  const passwordRequirements = [
    { label: 'At least 8 characters', ok: newPassword.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter', ok: /[a-z]/.test(newPassword) },
    { label: 'One number', ok: /[0-9]/.test(newPassword) },
    { label: 'One special character', ok: /[^a-zA-Z0-9]/.test(newPassword) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) return setError('Invalid reset link. Please request a new one.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    if (passwordRequirements.some(r => !r.ok)) return setError('Password does not meet all requirements.');

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/password-reset/confirm', { token, email, newPassword });
      setSuccess(true);
      showToast('Password reset successfully!', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to reset password. The link may have expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShoppingBag className="text-white" size={20} />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white">ACommerce</span>
        </div>

        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-10 shadow-2xl">
          {success ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Password Reset!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Your password has been updated. You can now sign in with your new password.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl shadow-indigo-600/30"
              >
                Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock size={28} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Set New Password</h2>
                {email && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">for <span className="text-indigo-500 font-semibold">{email}</span></p>}
              </div>

              {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* New Password */}
              <div className="relative">
                <div className="flex items-center bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus-within:border-indigo-500 transition-colors">
                  <Lock className="absolute left-4 text-slate-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password"
                    required
                    className="w-full pl-12 pr-12 py-4 bg-transparent outline-none text-slate-900 dark:text-white text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-slate-400 hover:text-indigo-500">
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {/* Password strength */}
                {newPassword && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {passwordRequirements.map((r, i) => (
                      <div key={i} className={`flex items-center gap-1.5 text-xs ${r.ok ? 'text-emerald-500' : 'text-slate-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${r.ok ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="flex items-center bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus-within:border-indigo-500 transition-colors">
                  <Shield className="absolute left-4 text-slate-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-slate-900 dark:text-white text-sm"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={11} /> Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token || !email}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Reset Password'}
              </button>

              <p className="text-center text-xs text-slate-400">
                Remember your password?{' '}
                <button type="button" onClick={() => navigate('/login')} className="text-indigo-500 font-bold hover:text-indigo-600">
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
