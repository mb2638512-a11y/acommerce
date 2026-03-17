import React from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
 onClose: () => void;
 onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onClose, onCheckout }) => {
 const { items, removeFromCart, updateQuantity, total } = useCart();
 const { convertPrice } = useCurrency();

 return (
  <div className="fixed inset-0 z-50 flex justify-end">
   {/* Backdrop */}
   <div
    className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
    onClick={onClose}
   />

   {/* Drawer */}
   <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-slide-in-right">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
     <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
      <ShoppingBag size={24} className="text-indigo-500" />
      Your Cart
      <span className="text-sm font-bold text-gray-500">({items.length} items)</span>
     </h2>
     <button
      onClick={onClose}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
     >
      <X size={24} />
     </button>
    </div>

    {/* Cart Items */}
    <div className="flex-1 overflow-y-auto p-6">
     {items.length === 0 ? (
      <div className="text-center py-16">
       <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
       <p className="text-gray-500 text-sm">Add some items to get started!</p>
      </div>
     ) : (
      <div className="space-y-4">
       {items.map((item) => (
        <div
         key={item.id}
         className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"
        >
         <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
          {item.imageUrl ? (
           <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
           <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={24} className="text-gray-400" />
           </div>
          )}
         </div>

         <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{convertPrice(item.price)}</p>

          <div className="flex items-center justify-between mt-2">
           <div className="flex items-center gap-1">
            <button
             onClick={() => updateQuantity(item.id, item.quantity - 1)}
             className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
             <Minus size={12} />
            </button>
            <span className="w-6 text-center text-sm font-bold text-gray-900 dark:text-white">
             {item.quantity}
            </span>
            <button
             onClick={() => updateQuantity(item.id, item.quantity + 1)}
             className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
             <Plus size={12} />
            </button>
           </div>

           <button
            onClick={() => removeFromCart(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
           >
            <Trash2 size={16} />
           </button>
          </div>
         </div>

         <p className="font-black text-gray-900 dark:text-white text-sm">
          {convertPrice(item.price * item.quantity)}
         </p>
        </div>
       ))}
      </div>
     )}
    </div>

    {/* Footer */}
    {items.length > 0 && (
     <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="flex justify-between items-center mb-4">
       <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
       <span className="text-xl font-black text-gray-900 dark:text-white">{convertPrice(total)}</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">Shipping and taxes calculated at checkout</p>

      <button
       onClick={onCheckout}
       className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
      >
       Checkout <ArrowRight size={20} />
      </button>

      <button
       onClick={onClose}
       className="w-full mt-3 py-3 text-gray-600 dark:text-gray-400 font-bold text-sm hover:text-gray-900 dark:hover:text-white transition-colors"
      >
       Continue Shopping
      </button>
     </div>
    )}
   </div>
  </div>
 );
};

export default CartDrawer;
