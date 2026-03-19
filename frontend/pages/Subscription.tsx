import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';
import { User, PlanTier } from '../types';
import api from '../src/lib/api';
import { useToast } from '../context/ToastContext';
import {
 Crown,
 Check,
 X,
 CreditCard,
 Gift,
 ArrowRight,
 Loader2,
 Sparkles,
 Zap,
 Shield,
 Headphones,
 BarChart3,
 Users,
 Package,
 Tag,
 Calendar,
 Clock,
 DollarSign,
 Percent,
 RefreshCw,
 ChevronDown,
 ChevronUp,
 Lock
} from 'lucide-react';

interface PlanFeature {
 name: string;
 starter: boolean | number | string;
 pro: boolean | number | string;
 premium: boolean | number | string;
 enterprise: boolean | number | string;
}

interface Plan {
 tier: PlanTier;
 label: string;
 monthlyPriceUsd: number;
 limits: {
  maxProducts: number;
  maxDiscountCodes: number;
  maxStaffMembers: number;
  aiRequestsPerDay: number;
 };
 features: string[];
 popular?: boolean;
}

interface PromoCodeValidation {
 valid: boolean;
 code?: string;
 description?: string;
 discountType?: string;
 discountValue?: number;
 discountAmount?: number;
 finalPrice?: number;
 originalPrice?: number;
 expiresAt?: string;
 error?: string;
}

// Platform plan features
const PLAN_FEATURES: PlanFeature[] = [
 { name: 'Products', starter: 200, pro: 1000, premium: 5000, enterprise: 'Unlimited' },
 { name: 'Staff Members', starter: 2, pro: 5, premium: 15, enterprise: 'Unlimited' },
 { name: 'Discount Codes', starter: 10, pro: 50, premium: 200, enterprise: 'Unlimited' },
 { name: 'AI Requests/Day', starter: 50, pro: 500, premium: 2000, enterprise: 'Unlimited' },
 { name: 'Analytics', starter: false, pro: true, premium: true, enterprise: true },
 { name: 'Priority Support', starter: false, pro: true, premium: true, enterprise: true },
 { name: 'Custom Domain', starter: false, pro: true, premium: true, enterprise: true },
 { name: 'Abandoned Cart Recovery', starter: false, pro: true, premium: true, enterprise: true },
 { name: 'Bulk Import', starter: false, pro: true, premium: true, enterprise: true },
 { name: 'Email Marketing', starter: false, pro: true, premium: true, enterprise: true },
 { name: 'Facebook Pixel', starter: false, pro: true, premium: true, enterprise: true },
 { name: 'Google Analytics', starter: false, pro: true, premium: true, enterprise: true },
 { name: 'Gift Cards', starter: false, pro: true, premium: true, enterprise: true },
 { name: 'Loyalty Program', starter: false, pro: false, premium: true, enterprise: true },
 { name: 'Wholesale Pricing', starter: false, pro: false, premium: true, enterprise: true },
 { name: 'API Access', starter: false, pro: false, premium: true, enterprise: true },
 { name: 'White Label', starter: false, pro: false, premium: false, enterprise: true },
 { name: 'Dedicated Support', starter: false, pro: false, premium: false, enterprise: true },
];

const PLANS: Plan[] = [
 {
  tier: 'STARTER',
  label: 'Starter',
  monthlyPriceUsd: 0,
  limits: { maxProducts: 200, maxDiscountCodes: 10, maxStaffMembers: 2, aiRequestsPerDay: 50 },
  features: ['Basic Analytics', 'Email Support', 'Standard Features']
 },
 {
  tier: 'PRO',
  label: 'Pro',
  monthlyPriceUsd: 49,
  limits: { maxProducts: 1000, maxDiscountCodes: 50, maxStaffMembers: 5, aiRequestsPerDay: 500 },
  features: ['Advanced Analytics', 'Priority Support', 'Marketing Tools', 'AI Features'],
  popular: true
 },
 {
  tier: 'PREMIUM',
  label: 'Premium',
  monthlyPriceUsd: 149,
  limits: { maxProducts: 5000, maxDiscountCodes: 200, maxStaffMembers: 15, aiRequestsPerDay: 2000 },
  features: ['Full Analytics', '24/7 Support', 'All Marketing', 'Advanced AI', 'API Access']
 },
 {
  tier: 'ENTERPRISE',
  label: 'Enterprise',
  monthlyPriceUsd: 499,
  limits: { maxProducts: -1, maxDiscountCodes: -1, maxStaffMembers: -1, aiRequestsPerDay: -1 },
  features: ['Custom Solutions', 'Dedicated Support', 'White Label', 'SLA Guarantee', 'Custom Integrations']
 }
];

const Subscription: React.FC = () => {
 const { user, loading: authLoading } = useAuth();
 const navigate = useNavigate();
 const { showToast } = useToast();

 const [currentPlan, setCurrentPlan] = useState<PlanTier | null>(null);
 const [loading, setLoading] = useState(true);
 const [processing, setProcessing] = useState(false);
 const [promoCode, setPromoCode] = useState('');
 const [promoValidation, setPromoValidation] = useState<PromoCodeValidation | null>(null);
 const [validatingPromo, setValidatingPromo] = useState(false);
 const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
 const [showPromoInput, setShowPromoInput] = useState(false);
 const [showFeatureComparison, setShowFeatureComparison] = useState(false);

 useEffect(() => {
  if (!authLoading && user) {
   fetchCurrentPlan();
  }
 }, [user, authLoading]);

 const fetchCurrentPlan = async () => {
  try {
   // Get user's plan from their store or direct
   const response = await api.get('/billing/catalog');
   if (response.data.plans) {
    // Find user's current plan tier
    const userPlan = user?.plan as PlanTier;
    setCurrentPlan(userPlan || 'STARTER');
   }
  } catch (error) {
   console.error('Error fetching current plan:', error);
   setCurrentPlan('STARTER');
  } finally {
   setLoading(false);
  }
 };

 const validatePromoCode = async () => {
  if (!promoCode.trim()) return;

  setValidatingPromo(true);
  try {
   const response = await api.post('/promo/validate', {
    code: promoCode.toUpperCase(),
    tier: selectedPlan || 'STARTER'
   });
   setPromoValidation(response.data);
   if (response.data.valid) {
    showToast('Promo code applied!', 'success');
   }
  } catch (error: any) {
   const errorMsg = error.response?.data?.error || 'Invalid promo code';
   setPromoValidation({ valid: false, error: errorMsg });
   showToast(errorMsg, 'error');
  } finally {
   setValidatingPromo(false);
  }
 };

 const handleSubscribe = async (plan: Plan) => {
  setSelectedPlan(plan.tier);
  setProcessing(true);

  try {
   // Calculate final price with promo code
   let finalPrice = plan.monthlyPriceUsd;
   let discountAmount = 0;

   if (promoValidation?.valid && promoValidation.discountAmount) {
    discountAmount = promoValidation.discountAmount;
    finalPrice = promoValidation.finalPrice || plan.monthlyPriceUsd;
   }

   // For free plans, no need for Stripe
   if (plan.monthlyPriceUsd === 0) {
    showToast('You are already on the Starter plan', 'info');
    return;
   }

   // Create Stripe checkout session
   const response = await api.post(`/stores/${user?.stores?.[0]}/billing/checkout-session`, {
    tier: plan.tier,
    promoCode: promoValidation?.valid ? promoCode : undefined,
    discountAmount
   });

   if (response.data.url) {
    window.location.href = response.data.url;
   } else {
    showToast('Checkout session created. Redirecting...', 'success');
   }
  } catch (error: any) {
   console.error('Subscribe error:', error);
   showToast(error.response?.data?.error || 'Failed to start checkout', 'error');
  } finally {
   setProcessing(false);
  }
 };

 const clearPromoCode = () => {
  setPromoCode('');
  setPromoValidation(null);
  setShowPromoInput(false);
 };

 const formatPrice = (price: number) => {
  return price === 0 ? 'Free' : `$${price}`;
 };

 const getDisplayPrice = (plan: Plan) => {
  let price = plan.monthlyPriceUsd;
  let originalPrice = price;

  if (promoValidation?.valid && promoValidation.discountAmount && selectedPlan === plan.tier) {
   price = promoValidation.finalPrice || price;
   originalPrice = promoValidation.originalPrice || price;
  }

  return { price, originalPrice };
 };

 if (authLoading) {
  return (
   <div className="min-h-screen bg-[#07070d] text-white flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
   </div>
  );
 }

 if (!user) {
  return <Navigate to="/login" replace />;
 }

 return (
  <div className="min-h-screen bg-[#07070d] text-white">
   {/* Header */}
   <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900/50 to-[#07070d] py-16">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
     <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
       <Crown className="w-8 h-8 text-yellow-500" />
       <h1 className="text-4xl font-bold">Choose Your Plan</h1>
      </div>
      <p className="text-xl text-gray-400 max-w-2xl mx-auto">
       Upgrade your store with powerful features. All plans include a 14-day free trial.
      </p>
     </div>
    </div>
   </div>

   {/* Current Plan Banner */}
   {currentPlan && currentPlan !== 'STARTER' && (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
     <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
       <div className="p-2 bg-indigo-500/20 rounded-lg">
        <Crown className="w-5 h-5 text-indigo-400" />
       </div>
       <div>
        <p className="text-sm text-gray-400">Current Plan</p>
        <p className="font-semibold text-white">{PLANS.find(p => p.tier === currentPlan)?.label}</p>
       </div>
      </div>
      <button
       onClick={() => navigate('/dashboard')}
       className="text-sm text-indigo-400 hover:text-indigo-300"
      >
       Manage in Dashboard →
      </button>
     </div>
    </div>
   )}

   {/* Pricing Cards */}
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
     {PLANS.map((plan) => {
      const isCurrentPlan = currentPlan === plan.tier;
      const { price, originalPrice } = getDisplayPrice(plan);
      const isPopular = plan.popular;

      return (
       <div
        key={plan.tier}
        className={`relative rounded-2xl border transition-all duration-300 ${isPopular
          ? 'border-indigo-500 bg-gradient-to-b from-indigo-900/40 to-[#07070d] shadow-lg shadow-indigo-500/20'
          : 'border-white/10 bg-white/5 hover:border-white/20'
         }`}
       >
        {isPopular && (
         <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium px-4 py-1 rounded-full flex items-center gap-1">
           <Sparkles className="w-4 h-4" /> Most Popular
          </span>
         </div>
        )}

        <div className="p-6">
         <h3 className="text-xl font-semibold text-white mb-2">{plan.label}</h3>
         <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-bold text-white">${price}</span>
          {price > 0 && <span className="text-gray-400">/month</span>}
         </div>

         {promoValidation?.valid && selectedPlan === plan.tier && promoValidation.discountAmount && (
          <div className="mb-4 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
           <div className="flex items-center gap-2 text-green-400 text-sm">
            <Gift className="w-4 h-4" />
            <span>Save ${promoValidation.discountAmount.toFixed(2)}!</span>
           </div>
           {promoValidation.discountValue && (
            <p className="text-xs text-gray-400 mt-1">
             {promoValidation.discountType === 'PERCENTAGE'
              ? `${promoValidation.discountValue}% off`
              : `$${promoValidation.discountValue} off`} with {promoCode}
            </p>
           )}
          </div>
         )}

         {originalPrice > price && price > 0 && (
          <p className="text-sm text-gray-500 line-through mb-4">
           ${originalPrice}/month
          </p>
         )}

         <button
          onClick={() => {
           setSelectedPlan(plan.tier);
           handleSubscribe(plan);
          }}
          disabled={isCurrentPlan || processing}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${isCurrentPlan
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : isPopular
             ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/30'
             : 'bg-white/10 hover:bg-white/20 text-white'
           }`}
         >
          {isCurrentPlan ? (
           <>Current Plan</>
          ) : processing && selectedPlan === plan.tier ? (
           <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
           </>
          ) : plan.monthlyPriceUsd === 0 ? (
           <>Get Started</>
          ) : (
           <>
            Subscribe <ArrowRight className="w-4 h-4" />
           </>
          )}
         </button>

         {/* Features List */}
         <div className="mt-6 space-y-3">
          {plan.features.map((feature, idx) => (
           <div key={idx} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-300">{feature}</span>
           </div>
          ))}
         </div>
        </div>
       </div>
      );
     })}
    </div>

    {/* Promo Code Section */}
    <div className="mt-12 max-w-md mx-auto">
     {!showPromoInput ? (
      <button
       onClick={() => setShowPromoInput(true)}
       className="w-full text-center text-indigo-400 hover:text-indigo-300 text-sm flex items-center justify-center gap-2"
      >
       <Tag className="w-4 h-4" />
       Have a promo code?
      </button>
     ) : (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
       <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
         <Gift className="w-4 h-4 text-indigo-400" />
         Promo Code
        </h3>
        <button
         onClick={clearPromoCode}
         className="text-gray-400 hover:text-white"
        >
         <X className="w-4 h-4" />
        </button>
       </div>

       <div className="flex gap-2">
        <div className="relative flex-1">
         <input
          type="text"
          value={promoCode}
          onChange={(e) => {
           setPromoCode(e.target.value.toUpperCase());
           setPromoValidation(null);
          }}
          placeholder="Enter promo code"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
         />
        </div>
        <button
         onClick={validatePromoCode}
         disabled={!promoCode.trim() || validatingPromo}
         className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
         {validatingPromo ? (
          <Loader2 className="w-5 h-5 animate-spin" />
         ) : (
          'Apply'
         )}
        </button>
       </div>

       {promoValidation && !promoValidation.valid && (
        <p className="mt-2 text-sm text-red-400">{promoValidation.error}</p>
       )}

       {promoValidation?.valid && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
         <div className="flex items-center gap-2 text-green-400">
          <Check className="w-4 h-4" />
          <span className="font-medium">
           {promoValidation.discountType === 'PERCENTAGE'
            ? `${promoValidation.discountValue}% off`
            : `$${promoValidation.discountValue} off`}
          </span>
         </div>
         {promoValidation.expiresAt && (
          <p className="text-xs text-gray-400 mt-1">
           Expires: {new Date(promoValidation.expiresAt).toLocaleDateString()}
          </p>
         )}
        </div>
       )}
      </div>
     )}
    </div>

    {/* Feature Comparison Toggle */}
    <div className="mt-16">
     <button
      onClick={() => setShowFeatureComparison(!showFeatureComparison)}
      className="mx-auto flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
     >
      {showFeatureComparison ? (
       <>Hide Full Comparison <ChevronUp className="w-4 h-4" /></>
      ) : (
       <>View Full Feature Comparison <ChevronDown className="w-4 h-4" /></>
      )}
     </button>

     {showFeatureComparison && (
      <div className="mt-8 overflow-x-auto">
       <table className="w-full">
        <thead>
         <tr className="border-b border-white/10">
          <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
          {PLANS.map((plan) => (
           <th key={plan.tier} className="text-center py-4 px-4 text-white font-semibold">
            {plan.label}
           </th>
          ))}
         </tr>
        </thead>
        <tbody>
         {PLAN_FEATURES.map((feature, idx) => (
          <tr key={idx} className="border-b border-white/5">
           <td className="py-4 px-4 text-gray-300">{feature.name}</td>
           {(['starter', 'pro', 'premium', 'enterprise'] as const).map((tier) => {
            const value = feature[tier];
            return (
             <td key={tier} className="text-center py-4 px-4">
              {typeof value === 'boolean' ? (
               value ? (
                <Check className="w-5 h-5 text-green-500 mx-auto" />
               ) : (
                <X className="w-5 h-5 text-gray-600 mx-auto" />
               )
              ) : (
               <span className="text-white">{value}</span>
              )}
             </td>
            );
           })}
          </tr>
         ))}
        </tbody>
       </table>
      </div>
     )}
    </div>

    {/* FAQ Section */}
    <div className="mt-20">
     <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
     <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
       <h3 className="font-semibold text-white mb-2">Can I change plans later?</h3>
       <p className="text-gray-400 text-sm">
        Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
       </p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
       <h3 className="font-semibold text-white mb-2">What payment methods do you accept?</h3>
       <p className="text-gray-400 text-sm">
        We accept all major credit cards through our secure Stripe payment system.
       </p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
       <h3 className="font-semibold text-white mb-2">Is there a free trial?</h3>
       <p className="text-gray-400 text-sm">
        Yes! All paid plans come with a 14-day free trial. No credit card required to start.
       </p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
       <h3 className="font-semibold text-white mb-2">What happens if I cancel?</h3>
       <p className="text-gray-400 text-sm">
        You'll retain access to your current features until the end of your billing period.
       </p>
      </div>
     </div>
    </div>

    {/* Stripe Badge */}
    <div className="mt-12 flex items-center justify-center gap-2 text-gray-500 text-sm">
     <Lock className="w-4 h-4" />
     <span>Secure payments powered by Stripe</span>
    </div>
   </div>
  </div>
 );
};

export default Subscription;
