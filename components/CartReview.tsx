import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { Trash2, Plus, Minus, Gift, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartReviewProps {
 onContinue: () => void;
}

export const CartReview: React.FC<CartReviewProps> = ({ onContinue }) => {
 const { items, removeFromCart, updateQuantity, total, checkoutState, applyCoupon } = useCart();
 const { convertPrice } = useCurrency();
 const [couponInput, setCouponInput] = useState('');
 const [couponError, setCouponError] = useState('');
 const [couponApplied, setCouponApplied] = useState(false);

 const handleApplyCoupon = async () => {
  setCouponError('');
  const success = await applyCoupon(couponInput);
  if (success) {
   setCouponApplied(true);
  } else {
   setCouponError('Invalid coupon code');
  }
 };

 const subtotal = total;
 const discount = checkoutState.discount;
 const shipping = subtotal > 100 ? 0 : 9.99;
 const tax = subtotal * 0.08;
 const grandTotal = subtotal + shipping + tax - discount;

 if (items.length === 0) {
  return (
   <div className="text-center py-16 animate-fade-in">
    <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
    <p className="text-gray-500 mb-6">Add some items to get started!</p>
   </div>
  );
 }

 return (
  <div className="animate-fade-in">
   <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Shopping Cart</h2>

   {/* Cart Items */}
   <div className="space-y-4 mb-8">
    {items.map((item) => (
     <div
      key={item.id}
      className="flex gap-4 p-4 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl hover:shadow-lg transition-shadow"
     >
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
       {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
       ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
         <ShoppingBag size={24} />
        </div>
       )}
      </div>

      <div className="flex-1 min-w-0">
       <h4 className="font-bold text-gray-900 dark:text-white truncate">{item.name}</h4>
       <p className="text-sm text-gray-500 dark:text-gray-400">{convertPrice(item.price)}</p>

       <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
         <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
         >
          <Minus size={14} />
         </button>
         <span className="w-8 text-center font-bold text-gray-900 dark:text-white">
          {item.quantity}
         </span>
         <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
         >
          <Plus size={14} />
         </button>
        </div>

        <button
         onClick={() => removeFromCart(item.id)}
         className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
         <Trash2 size={18} />
        </button>
       </div>
      </div>

      <div className="text-right">
       <p className="font-black text-lg text-gray-900 dark:text-white">
        {convertPrice(item.price * item.quantity)}
       </p>
      </div>
     </div>
    ))}
   </div>

   {/* Coupon Code */}
   <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
    <div className="flex gap-2">
     <div className="relative flex-1">
      <Gift size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
       type="text"
       value={couponInput}
       onChange={(e) => setCouponInput(e.target.value)}
       placeholder="Enter coupon code"
       disabled={couponApplied}
       className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50"
      />
     </div>
     <button
      onClick={handleApplyCoupon}
      disabled={couponApplied || !couponInput}
      className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
     >
      {couponApplied ? 'Applied!' : 'Apply'}
     </button>
    </div>
    {couponError && (
     <p className="text-red-500 text-sm mt-2">{couponError}</p>
    )}
    {couponApplied && (
     <p className="text-green-500 text-sm mt-2">Coupon applied successfully! You save {convertPrice(discount)}</p>
    )}
    <p className="text-xs text-gray-500 mt-2">Try: SAVE10, SAVE20, or WELCOME</p>
   </div>

   {/* Order Summary */}
   <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>

    <div className="space-y-3 text-sm">
     <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
      <span className="font-bold text-gray-900 dark:text-white">{convertPrice(subtotal)}</span>
     </div>

     {discount > 0 && (
      <div className="flex justify-between text-green-500">
       <span>Discount</span>
       <span className="font-bold">-{convertPrice(discount)}</span>
      </div>
     )}

     <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">Shipping</span>
      <span className="font-bold text-gray-900 dark:text-white">
       {shipping === 0 ? 'FREE' : convertPrice(shipping)}
      </span>
     </div>

     <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">Tax (8%)</span>
      <span className="font-bold text-gray-900 dark:text-white">{convertPrice(tax)}</span>
     </div>

     <div className="h-px bg-gray-200 dark:bg-gray-700 my-3" />

     <div className="flex justify-between text-lg">
      <span className="font-bold text-gray-900 dark:text-white">Total</span>
      <span className="font-black text-xl text-gray-900 dark:text-white">{convertPrice(grandTotal)}</span>
     </div>
    </div>

    {subtotal < 100 && (
     <p className="text-xs text-green-600 dark:text-green-400 mt-3 flex items-center gap-1">
      <Gift size={12} /> Add {convertPrice(100 - subtotal)} more for free shipping!
     </p>
    )}
   </div>

   {/* Continue Button */}
   <button
    onClick={onContinue}
    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
   >
    Continue to Shipping <ArrowRight size={20} />
   </button>
  </div>
 );
};

export default CartReview;
