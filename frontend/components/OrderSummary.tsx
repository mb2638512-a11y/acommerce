import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { OrderConfirmation } from '../types';
import { ArrowLeft, Check, CreditCard, Truck, MapPin, ShoppingBag, Edit2, CheckCircle, Loader2 } from 'lucide-react';

interface OrderSummaryProps {
 onBack: () => void;
 onComplete: () => void;
 onEditSection: (section: 'cart' | 'shipping' | 'payment') => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ onBack, onComplete, onEditSection }) => {
 const { items, total, checkoutState, processCheckout, setTermsAccepted } = useCart();
 const { convertPrice } = useCurrency();
 const [isProcessing, setIsProcessing] = useState(false);
 const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);

 const { shippingAddress, shippingMethod, paymentMethod, discount, termsAccepted } = checkoutState;
 const subtotal = total;
 const tax = subtotal * 0.08;
 const shippingCost = shippingMethod?.price || 0;
 const grandTotal = subtotal + tax + shippingCost - discount;

 const handlePlaceOrder = async () => {
  if (!termsAccepted) return;

  setIsProcessing(true);

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const confirmation = await processCheckout();
  setOrderConfirmation(confirmation);
  setIsProcessing(false);
 };

 const getPaymentMethodName = (method: string | null | undefined) => {
  if (!method) return 'Not selected';
  const names: Record<string, string> = {
   card: 'Credit / Debit Card',
   paypal: 'PayPal',
   apple_pay: 'Apple Pay',
   google_pay: 'Google Pay',
   klarna: 'Klarna',
   afterpay: 'Afterpay',
   bank_transfer: 'Bank Transfer',
   cod: 'Cash on Delivery',
   store_credit: 'Store Credit',
  };
  return names[method] || method;
 };

 // Order Confirmation View
 if (orderConfirmation) {
  return (
   <div className="animate-fade-in text-center py-8">
    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
     <CheckCircle size={40} className="text-green-500" />
    </div>

    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Order Confirmed!</h2>
    <p className="text-gray-500 mb-6">Thank you for your purchase</p>

    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 mb-6 text-left max-w-md mx-auto">
     <div className="flex justify-between mb-2">
      <span className="text-gray-500">Order Number</span>
      <span className="font-bold text-gray-900 dark:text-white">{orderConfirmation.orderNumber}</span>
     </div>
     <div className="flex justify-between mb-2">
      <span className="text-gray-500">Order ID</span>
      <span className="font-bold text-gray-900 dark:text-white text-sm">{orderConfirmation.orderId}</span>
     </div>
     <div className="flex justify-between">
      <span className="text-gray-500">Estimated Delivery</span>
      <span className="font-bold text-indigo-600 dark:text-indigo-400">{orderConfirmation.estimatedDelivery}</span>
     </div>
    </div>

    <p className="text-sm text-gray-500 mb-8">
     A confirmation email has been sent to <strong>{orderConfirmation.email}</strong>
    </p>

    <button
     onClick={onComplete}
     className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all hover:scale-[1.02]"
    >
     Continue Shopping
    </button>
   </div>
  );
 }

 return (
  <div className="animate-fade-in">
   <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Review Your Order</h2>

   {/* Order Items */}
   <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
    <div className="flex items-center justify-between mb-4">
     <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
      <ShoppingBag size={18} className="text-indigo-500" /> Items ({items.length})
     </h3>
     <button
      onClick={() => onEditSection('cart')}
      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
     >
      <Edit2 size={14} /> Edit
     </button>
    </div>

    <div className="space-y-3">
     {items.map((item) => (
      <div key={item.id} className="flex items-center gap-4">
       <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
        {item.imageUrl && (
         <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        )}
       </div>
       <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
       </div>
       <p className="font-bold text-gray-900 dark:text-white">
        {convertPrice(item.price * item.quantity)}
       </p>
      </div>
     ))}
    </div>
   </div>

   {/* Shipping Address */}
   <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
    <div className="flex items-center justify-between mb-4">
     <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
      <MapPin size={18} className="text-indigo-500" /> Shipping Address
     </h3>
     <button
      onClick={() => onEditSection('shipping')}
      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
     >
      <Edit2 size={14} /> Edit
     </button>
    </div>

    {shippingAddress && (
     <div className="text-sm text-gray-600 dark:text-gray-400">
      <p className="font-medium text-gray-900 dark:text-white">
       {shippingAddress.firstName} {shippingAddress.lastName}
      </p>
      <p>{shippingAddress.address}</p>
      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
      <p>{shippingAddress.email}</p>
      <p>{shippingAddress.phone}</p>
     </div>
    )}
   </div>

   {/* Shipping Method */}
   <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
    <div className="flex items-center justify-between mb-4">
     <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
      <Truck size={18} className="text-indigo-500" /> Shipping Method
     </h3>
     <button
      onClick={() => onEditSection('shipping')}
      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
     >
      <Edit2 size={14} /> Edit
     </button>
    </div>

    {shippingMethod && (
     <div className="flex justify-between items-center">
      <div>
       <p className="font-medium text-gray-900 dark:text-white">{shippingMethod.name}</p>
       <p className="text-sm text-gray-500">{shippingMethod.estimatedDays}</p>
      </div>
      <p className="font-bold text-gray-900 dark:text-white">
       {shippingMethod.price === 0 ? 'FREE' : convertPrice(shippingMethod.price)}
      </p>
     </div>
    )}
   </div>

   {/* Payment Method */}
   <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
    <div className="flex items-center justify-between mb-4">
     <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
      <CreditCard size={18} className="text-indigo-500" /> Payment Method
     </h3>
     <button
      onClick={() => onEditSection('payment')}
      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
     >
      <Edit2 size={14} /> Edit
     </button>
    </div>

    <p className="font-medium text-gray-900 dark:text-white">
     {getPaymentMethodName(paymentMethod)}
    </p>
   </div>

   {/* Price Summary */}
   <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Order Total</h3>

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
       {shippingCost === 0 ? 'FREE' : convertPrice(shippingCost)}
      </span>
     </div>

     <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">Tax</span>
      <span className="font-bold text-gray-900 dark:text-white">{convertPrice(tax)}</span>
     </div>

     <div className="h-px bg-gray-200 dark:bg-gray-700 my-3" />

     <div className="flex justify-between text-lg">
      <span className="font-bold text-gray-900 dark:text-white">Total</span>
      <span className="font-black text-xl text-gray-900 dark:text-white">{convertPrice(grandTotal)}</span>
     </div>
    </div>
   </div>

   {/* Terms & Conditions */}
   <div className="mb-6">
    <label className="flex items-start gap-3 cursor-pointer">
     <input
      type="checkbox"
      checked={termsAccepted}
      onChange={(e) => setTermsAccepted(e.target.checked)}
      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
     />
     <span className="text-sm text-gray-600 dark:text-gray-400">
      I agree to the <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms and Conditions</a>
      and <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>
     </span>
    </label>
   </div>

   {/* Navigation Buttons */}
   <div className="flex gap-4">
    <button
     onClick={onBack}
     disabled={isProcessing}
     className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-900 dark:text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
    >
     <ArrowLeft size={20} /> Back
    </button>
    <button
     onClick={handlePlaceOrder}
     disabled={!termsAccepted || isProcessing}
     className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
    >
     {isProcessing ? (
      <>
       <Loader2 size={20} className="animate-spin" /> Processing...
      </>
     ) : (
      <>
       <Check size={20} /> Place Order
      </>
     )}
    </button>
   </div>
  </div>
 );
};

export default OrderSummary;
