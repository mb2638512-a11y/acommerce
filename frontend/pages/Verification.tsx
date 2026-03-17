import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Building2, Phone, CheckCircle2, ArrowRight, Loader2, Lock, FileText, User as UserIcon, Calendar, UploadCloud, CreditCard, Wallet } from 'lucide-react';
import { useAuth } from '../src/context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../src/lib/api';
import { ThemeToggle } from '../context/ThemeContext';

export const Verification: React.FC = () => {
 const { user, login } = useAuth();
 const navigate = useNavigate();
 const { showToast } = useToast();

 const [step, setStep] = useState(1);
 const [loading, setLoading] = useState(false);

 // Form Data
 const [companyName, setCompanyName] = useState('');
 const [phone, setPhone] = useState('');
 const [verificationCode, setVerificationCode] = useState('');

 // KYC Data
 const [legalName, setLegalName] = useState('');
 const [dateOfBirth, setDateOfBirth] = useState('');
 const [idDocumentUrl, setIdDocumentUrl] = useState('');

 // Payment Data
 const [provider, setProvider] = useState<'STRIPE' | 'PAYPAL' | null>(null);

 // Auto-navigate to correct step
 useEffect(() => {
  if (user) {
   if (user.isVerified && user.kycStatus === 'APPROVED' && user.paymentVerified) {
    navigate('/dashboard', { replace: true });
   } else if (user.isVerified && user.kycStatus === 'APPROVED' && !user.paymentVerified) {
    setStep(4);
   } else if (user.isVerified && (!user.kycStatus || user.kycStatus === 'PENDING')) {
    setStep(3);
   } else if (!user.isVerified) {
    setStep(1);
   }
  }
 }, [user, navigate]);

 const handleSendCode = (e: React.FormEvent) => {
  e.preventDefault();
  if (!companyName.trim() || !phone.trim() || phone.length < 5) {
   return showToast("Please enter valid business details.", "error");
  }

  setLoading(true);
  setTimeout(() => {
   setLoading(false);
   setStep(2);
   showToast("Verification code sent to your phone.", "success");
  }, 1500);
 };

 const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  if (verificationCode.length < 4) {
   return showToast("Please enter a valid verification code.", "error");
  }

  setLoading(true);
  try {
   const res = await api.post('/auth/verify', { companyName, phone });
   const token = localStorage.getItem('token');
   if (token) login(token, res.data.user);
   showToast("Phone verified! Proceeding to Identity Check.", "success");
   setStep(3);
  } catch (error: any) {
   showToast(error.response?.data?.error || "Verification failed. Please try again.", "error");
  } finally {
   setLoading(false);
  }
 };

 const handleKycSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!legalName || !dateOfBirth || !idDocumentUrl) {
   return showToast("Please provide all required identity information.", "error");
  }

  setLoading(true);
  try {
   const res = await api.post('/auth/kyc', { legalName, dateOfBirth, idDocumentUrl });
   const token = localStorage.getItem('token');
   if (token) login(token, res.data.user);
   showToast("Identity verification submitted successfully.", "success");
   setStep(4);
  } catch (error: any) {
   showToast(error.response?.data?.error || "KYC verification failed.", "error");
  } finally {
   setLoading(false);
  }
 };

 const handlePaymentSubmit = async (selectedProvider: 'STRIPE' | 'PAYPAL') => {
  setProvider(selectedProvider);
  setLoading(true);
  try {
   const res = await api.post('/auth/payment', {
    provider: selectedProvider,
    paymentId: selectedProvider === 'STRIPE' ? 'tok_visa_mock_' + Math.random().toString(36).substring(7) : 'PAY-' + Math.random().toString(36).substring(7)
   });
   const token = localStorage.getItem('token');
   if (token) login(token, res.data.user);
   showToast("Financial verification successful.", "success");
   setStep(5);
   setTimeout(() => navigate('/dashboard', { replace: true }), 3000);
  } catch (error: any) {
   showToast(error.response?.data?.error || "Payment verification failed.", "error");
  } finally {
   setLoading(false);
   setProvider(null);
  }
 };

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#030305] relative overflow-hidden font-sans selection:bg-indigo-500/30">
   <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-blob hidden dark:block"></div>
   <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none animate-blob animation-delay-2000 hidden dark:block"></div>

   <div className="absolute top-6 right-6 z-50">
    <ThemeToggle />
   </div>

   <div className="relative z-10 w-full max-w-lg p-6 lg:p-0">
    <div className="bg-white/80 dark:bg-[#0f111a]/80 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500 animate-gradient-x"></div>

     <div className="text-center mb-8 animate-fade-in-up">
      <div className="w-16 h-16 mx-auto bg-indigo-50 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm border border-indigo-100 dark:border-indigo-500/30">
       <Shield size={32} />
      </div>
      <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
       Verification
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
       Secure your enterprise account to access the platform.
      </p>
     </div>

     <div className="relative">
      <div className="flex justify-center mb-8 gap-2 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
       <div className={`h-2 rounded-full transition-all duration-500 ${step >= 1 ? 'w-8 bg-indigo-500' : 'w-4 bg-gray-200 dark:bg-white/10'}`}></div>
       <div className={`h-2 rounded-full transition-all duration-500 ${step >= 2 ? 'w-8 bg-indigo-500' : 'w-4 bg-gray-200 dark:bg-white/10'}`}></div>
       <div className={`h-2 rounded-full transition-all duration-500 ${step >= 3 ? 'w-8 bg-purple-500' : 'w-4 bg-gray-200 dark:bg-white/10'}`}></div>
       <div className={`h-2 rounded-full transition-all duration-500 ${step >= 4 ? 'w-8 bg-blue-500' : 'w-4 bg-gray-200 dark:bg-white/10'}`}></div>
       <div className={`h-2 rounded-full transition-all duration-500 ${step >= 5 ? 'w-8 bg-emerald-500' : 'w-4 bg-gray-200 dark:bg-white/10'}`}></div>
      </div>

      {step === 1 && (
       <form onSubmit={handleSendCode} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <div>
         <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Company / Organization Name</label>
         <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
           <Building2 size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
           type="text"
           required
           value={companyName}
           onChange={(e) => setCompanyName(e.target.value)}
           className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
           placeholder="ACommerce Inc."
          />
         </div>
        </div>
        <div>
         <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Mobile Phone Number</label>
         <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
           <Phone size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
           type="tel"
           required
           value={phone}
           onChange={(e) => setPhone(e.target.value)}
           className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
           placeholder="+1 (555) 000-0000"
          />
         </div>
         <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1 flex items-center gap-1">
          <Lock size={12} /> We will send a secure verification code.
         </p>
        </div>
        <button
         type="submit"
         disabled={loading}
         className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 group"
        >
         {loading ? <Loader2 className="animate-spin" /> : (
          <>Send Security Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
         )}
        </button>
       </form>
      )}

      {step === 2 && (
       <form onSubmit={handleVerify} className="space-y-6 animate-fade-in-up">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-center">
         <p className="text-sm text-indigo-800 dark:text-indigo-300">
          Enter the 6-digit verification code sent to <br />
          <span className="font-bold">{phone}</span>
         </p>
        </div>

        <div>
         <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Verification Code</label>
         <input
          type="text"
          required
          autoFocus
          maxLength={6}
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="w-full py-4 text-center text-3xl font-mono tracking-[0.5em] bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white"
          placeholder="······"
         />
        </div>

        <button
         type="submit"
         disabled={loading}
         className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70"
        >
         {loading ? <Loader2 className="animate-spin" /> : (
          <>Verify Phone <ArrowRight size={18} /></>
         )}
        </button>

        <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
         Change phone number
        </button>
       </form>
      )}

      {step === 3 && (
       <form onSubmit={handleKycSubmit} className="space-y-6 animate-fade-in-up">
        <div className="p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-xl mb-6">
         <p className="text-sm text-purple-800 dark:text-purple-300 flex items-start gap-2">
          <FileText size={18} className="mt-0.5 shrink-0" />
          Federal law requires us to securely collect your legal identity information before granting platform access.
         </p>
        </div>

        <div>
         <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Legal Full Name</label>
         <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
           <UserIcon size={18} className="text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          </div>
          <input
           type="text"
           required
           value={legalName}
           onChange={(e) => setLegalName(e.target.value)}
           className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
           placeholder="As appears on ID"
          />
         </div>
        </div>

        <div>
         <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Date of Birth</label>
         <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
           <Calendar size={18} className="text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          </div>
          <input
           type="date"
           required
           value={dateOfBirth}
           onChange={(e) => setDateOfBirth(e.target.value)}
           className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 dark:text-white"
          />
         </div>
        </div>

        <div>
         <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Government ID (URL / Mock)</label>
         <div className="flex gap-2">
          <div className="relative group flex-1">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <UploadCloud size={18} className="text-gray-400" />
           </div>
           <input
            type="text"
            required
            value={idDocumentUrl}
            onChange={(e) => setIdDocumentUrl(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 dark:text-white"
            placeholder="https://storage/my-id.pdf"
           />
          </div>
          <button
           type="button"
           onClick={() => setIdDocumentUrl("https://kyc-mock.acommerce.com/id_" + Math.random().toString(36).substring(7) + ".pdf")}
           className="px-4 py-0 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors border border-gray-200 dark:border-white/10"
          >
           Simulate
          </button>
         </div>
        </div>

        <button
         type="submit"
         disabled={loading}
         className="w-full py-4 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-70 group"
        >
         {loading ? <Loader2 className="animate-spin" /> : (
          <>Submit Identity Securely <Lock size={16} className="ml-1" /></>
         )}
        </button>
       </form>
      )}

      {step === 4 && (
       <div className="space-y-6 animate-fade-in-up">
        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl mb-6">
         <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
          <Shield size={18} className="mt-0.5 shrink-0" />
          Final step: Add a payment method to verify financial standing and activate your merchant account. You won't be charged.
         </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <button
          onClick={() => handlePaymentSubmit('STRIPE')}
          disabled={loading}
          className={`p-6 border-2 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all ${provider === 'STRIPE'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
            : 'border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 bg-transparent'
           }`}
         >
          {loading && provider === 'STRIPE' ? (
           <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : (
           <CreditCard className={`w-8 h-8 ${provider === 'STRIPE' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`} />
          )}
          <span className={`font-bold ${provider === 'STRIPE' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>Verify with Stripe</span>
         </button>

         <button
          onClick={() => handlePaymentSubmit('PAYPAL')}
          disabled={loading}
          className={`p-6 border-2 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all ${provider === 'PAYPAL'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
            : 'border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 bg-transparent'
           }`}
         >
          {loading && provider === 'PAYPAL' ? (
           <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : (
           <Wallet className={`w-8 h-8 ${provider === 'PAYPAL' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`} />
          )}
          <span className={`font-bold ${provider === 'PAYPAL' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>Connect PayPal</span>
         </button>
        </div>
       </div>
      )}

      {step === 5 && (
       <div className="text-center py-8 animate-fade-in-up">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
         <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Enterprise Standard Achieved</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
         Your identity and payment methods have been securely verified. Preparing your advanced enterprise dashboard...
        </p>
        <div className="mt-8">
         <Loader2 size={24} className="text-emerald-500 animate-spin mx-auto" />
        </div>
       </div>
      )}
     </div>
    </div>
   </div>
  </div>
 );
};
