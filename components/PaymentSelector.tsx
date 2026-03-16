import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { PaymentMethodType, CardDetails } from '../types';
import { ArrowRight, ArrowLeft, CreditCard, Wallet, Banknote, Building, Clock, Smartphone, Check } from 'lucide-react';

interface PaymentSelectorProps {
 onContinue: () => void;
 onBack: () => void;
}

interface PaymentOption {
 id: PaymentMethodType;
 name: string;
 description: string;
 icon: React.ReactNode;
 color: string;
}

const paymentOptions: PaymentOption[] = [
 {
  id: 'card',
  name: 'Credit / Debit Card',
  description: 'Visa, Mastercard, American Express',
  icon: <CreditCard size={24} />,
  color: 'blue',
 },
 {
  id: 'paypal',
  name: 'PayPal',
  description: 'Pay with your PayPal account',
  icon: <Wallet size={24} />,
  color: 'blue',
 },
 {
  id: 'apple_pay',
  name: 'Apple Pay',
  description: 'Fast and secure checkout with Apple',
  icon: <Smartphone size={24} />,
  color: 'black',
 },
 {
  id: 'google_pay',
  name: 'Google Pay',
  description: 'Pay with Google',
  icon: <Smartphone size={24} />,
  color: 'red',
 },
 {
  id: 'klarna',
  name: 'Klarna',
  description: 'Buy now, pay later in 4 installments',
  icon: <Clock size={24} />,
  color: 'pink',
 },
 {
  id: 'afterpay',
  name: 'Afterpay',
  description: 'Pay in 4 interest-free payments',
  icon: <Clock size={24} />,
  color: 'teal',
 },
 {
  id: 'bank_transfer',
  name: 'Bank Transfer',
  description: 'Direct bank transfer payment',
  icon: <Building size={24} />,
  color: 'gray',
 },
 {
  id: 'cod',
  name: 'Cash on Delivery',
  description: 'Pay when you receive your order',
  icon: <Banknote size={24} />,
  color: 'green',
 },
];

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({ onContinue, onBack }) => {
 const { checkoutState, setPaymentMethod, setCardDetails } = useCart();
 const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType | null>(checkoutState.paymentMethod);
 const [cardForm, setCardForm] = useState<CardDetails>(
  checkoutState.cardDetails || {
   number: '',
   expiry: '',
   cvc: '',
   name: '',
  }
 );
 const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

 const validateCard = () => {
  if (selectedPayment !== 'card') return true;

  const errors: Record<string, string> = {};

  if (!cardForm.number.replace(/\s/g, '').match(/^\d{16}$/)) {
   errors.number = 'Valid card number required';
  }
  if (!cardForm.expiry.match(/^\d{2}\/\d{2}$/)) {
   errors.expiry = 'Valid expiry required (MM/YY)';
  }
  if (!cardForm.cvc.match(/^\d{3,4}$/)) {
   errors.cvc = 'Valid CVC required';
  }
  if (!cardForm.name.trim()) {
   errors.name = 'Name on card required';
  }

  setCardErrors(errors);
  return Object.keys(errors).length === 0;
 };

 const handleSubmit = () => {
  if (!selectedPayment) return;

  if (selectedPayment === 'card') {
   if (!validateCard()) return;
   setCardDetails(cardForm);
  } else {
   setCardDetails(null);
  }

  setPaymentMethod(selectedPayment);
  onContinue();
 };

 const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
   parts.push(match.substring(i, i + 4));
  }
  return parts.length ? parts.join(' ') : value;
 };

 const formatExpiry = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
   return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
 };

 const getColorClasses = (color: string) => {
  switch (color) {
   case 'blue': return 'bg-blue-500 text-white';
   case 'black': return 'bg-black text-white';
   case 'red': return 'bg-red-500 text-white';
   case 'pink': return 'bg-pink-500 text-white';
   case 'teal': return 'bg-teal-500 text-white';
   case 'gray': return 'bg-gray-500 text-white';
   case 'green': return 'bg-green-500 text-white';
   default: return 'bg-gray-500 text-white';
  }
 };

 return (
  <div className="animate-fade-in">
   <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Payment Method</h2>

   {/* Payment Options Grid */}
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
    {paymentOptions.map((option) => (
     <label
      key={option.id}
      className={`flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedPayment === option.id
        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
       }`}
     >
      <input
       type="radio"
       name="paymentMethod"
       value={option.id}
       checked={selectedPayment === option.id}
       onChange={() => setSelectedPayment(option.id)}
       className="w-4 h-4 mt-1 text-indigo-600 focus:ring-indigo-500"
      />
      <div className={`p-2 rounded-xl ${getColorClasses(option.color)}`}>
       {option.icon}
      </div>
      <div>
       <p className="font-bold text-gray-900 dark:text-white">{option.name}</p>
       <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
      </div>
      {selectedPayment === option.id && (
       <Check size={20} className="text-indigo-500 ml-auto" />
      )}
     </label>
    ))}
   </div>

   {/* Card Details Form */}
   {selectedPayment === 'card' && (
    <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 animate-fade-in">
     <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <CreditCard size={18} className="text-indigo-500" /> Card Details
     </h3>

     <div className="space-y-4">
      <div>
       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
       <input
        type="text"
        value={cardForm.number}
        onChange={(e) => setCardForm(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
        maxLength={19}
        className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${cardErrors.number ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
        placeholder="1234 5678 9012 3456"
       />
       {cardErrors.number && <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
       <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
        <input
         type="text"
         value={cardForm.expiry}
         onChange={(e) => setCardForm(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
         maxLength={5}
         className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${cardErrors.expiry ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
         placeholder="MM/YY"
        />
        {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
       </div>

       <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">CVC</label>
        <input
         type="text"
         value={cardForm.cvc}
         onChange={(e) => setCardForm(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '') }))}
         maxLength={4}
         className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${cardErrors.cvc ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
         placeholder="123"
        />
        {cardErrors.cvc && <p className="text-red-500 text-xs mt-1">{cardErrors.cvc}</p>}
       </div>
      </div>

      <div>
       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name on Card</label>
       <input
        type="text"
        value={cardForm.name}
        onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value }))}
        className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${cardErrors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
        placeholder="John Doe"
       />
       {cardErrors.name && <p className="text-red-500 text-xs mt-1">{cardErrors.name}</p>}
      </div>
     </div>

     <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
      <Lock size={14} /> Your payment info is secure and encrypted
     </div>
    </div>
   )}

   {/* PayPal Button Preview */}
   {selectedPayment === 'paypal' && (
    <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 animate-fade-in text-center">
     <p className="text-gray-600 dark:text-gray-400 mb-4">
      You'll be redirected to PayPal to complete your payment
     </p>
     <button className="px-8 py-3 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold rounded-xl transition-colors">
      Continue with PayPal
     </button>
    </div>
   )}

   {/* BNPL Info */}
   {(selectedPayment === 'klarna' || selectedPayment === 'afterpay') && (
    <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 animate-fade-in">
     <p className="text-gray-600 dark:text-gray-400 mb-2">
      <strong>How it works:</strong>
     </p>
     <ul className="text-sm text-gray-500 space-y-1">
      <li>• Select this option at checkout</li>
      <li>• Complete your purchase in 4 interest-free installments</li>
      <li>• No hidden fees or interest</li>
     </ul>
    </div>
   )}

   {/* COD Info */}
   {selectedPayment === 'cod' && (
    <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 animate-fade-in">
     <p className="text-green-800 dark:text-green-200 font-bold mb-2">
      Cash on Delivery Available
     </p>
     <p className="text-sm text-green-700 dark:text-green-300">
      Pay with cash when your order is delivered to your doorstep.
      Additional COD fee of $5.99 may apply.
     </p>
    </div>
   )}

   {/* Bank Transfer Info */}
   {selectedPayment === 'bank_transfer' && (
    <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 animate-fade-in">
     <p className="font-bold text-gray-900 dark:text-white mb-2">Bank Transfer Details</p>
     <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
      <p>Bank: Example Bank</p>
      <p>Account: 1234567890</p>
      <p>Routing: 987654321</p>
      <p className="mt-2 text-xs">You'll receive an email with payment instructions after placing your order.</p>
     </div>
    </div>
   )}

   {/* Navigation Buttons */}
   <div className="flex gap-4">
    <button
     onClick={onBack}
     className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
    >
     <ArrowLeft size={20} /> Back to Shipping
    </button>
    <button
     onClick={handleSubmit}
     disabled={!selectedPayment}
     className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
    >
     Review Order <ArrowRight size={20} />
    </button>
   </div>
  </div>
 );
};

// Need to import Lock icon
import { Lock } from 'lucide-react';

export default PaymentSelector;
