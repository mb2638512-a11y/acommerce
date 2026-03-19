import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import api from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const AuthCallback: React.FC = () => {
 const navigate = useNavigate();
 const { login } = useAuth();
 const { showToast } = useToast();
 const [status, setStatus] = useState('Verifying authentication...');

 useEffect(() => {
  const handleAuth = async () => {
   try {
    if (!supabase) {
     showToast('Supabase is not configured. Cannot complete OAuth callback.', 'error');
     navigate('/login');
     return;
    }

    // Supabase puts the session in the URL hash, getSession parses it automatically
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;
    if (!session || !session.user) {
     navigate('/login');
     return;
    }

    setStatus('Securing session...');

    // We got the Google session. Now negotiate a JWT with our backend.
    const userMetadata = session.user.user_metadata;

    const response = await api.post('/auth/google', {
     email: session.user.email,
     name: userMetadata.full_name || userMetadata.name || 'Google User'
    });

    login(response.data.token, response.data.user);

    showToast(`Welcome via Google, ${response.data.user.name}!`, 'success');

    // Triple-Layer Access Strategy: Role-based redirect
    const user = response.data.user;

    // Check if user is verified
    if (user.isVerified === false) {
     navigate('/verify', { replace: true });
     return;
    }

    // Layer 1: Secret Admin (stealth admin with whitelisted email)
    if (user.role === 'admin') {
     navigate('/admin', { replace: true });
     return;
    }

    // Layer 2: Seller - if user has stores, go to seller dashboard
    if (user.stores && user.stores.length > 0) {
     navigate('/dashboard', { replace: true });
     return;
    }

    // Layer 3: Buyer - go to marketplace
    navigate('/marketplace', { replace: true });

   } catch (err: any) {
    console.error('Google Auth Error:', err);
    showToast(err.message || 'Authentication failed', 'error');
    navigate('/login');
   }
  };

  handleAuth();
 }, [navigate, login, showToast]);

 return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#030305]">
   <div className="relative">
    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
    <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 rounded-2xl flex flex-col items-center shadow-2xl relative z-10">
     <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
     <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{status}</h2>
     <p className="text-sm text-gray-500 dark:text-gray-400">Please do not close this window.</p>
    </div>
   </div>
  </div>
 );
};
