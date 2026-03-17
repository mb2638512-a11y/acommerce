import React from 'react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { ArrowRight, ShoppingBag } from 'lucide-react';

interface RecentlyViewedProps {
 products: Product[];
 storeId: string;
 onProductClick: (product: Product) => void;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ products, storeId, onProductClick }) => {
 const { convertPrice } = useCurrency();
 const { addToCart } = useCart();

 // Get recently viewed product IDs from localStorage
 const getRecentlyViewed = (): string[] => {
  try {
   return JSON.parse(localStorage.getItem(`acommerce_viewed_${storeId}`) || '[]');
  } catch {
   return [];
  }
 };

 const recentlyViewedIds = getRecentlyViewed();
 const recentlyViewedProducts = recentlyViewedIds
  .map(id => products.find(p => p.id === id))
  .filter((p): p is Product => p !== undefined && p.status === 'ACTIVE')
  .slice(0, 4);

 if (recentlyViewedProducts.length === 0) {
  return null;
 }

 return (
  <div className="mb-16">
   <div className="flex items-center justify-between mb-8">
    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Recently Viewed</h2>
    <button className="text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
     View All <ArrowRight size={16} />
    </button>
   </div>

   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {recentlyViewedProducts.map((product) => (
     <div
      key={product.id}
      onClick={() => onProductClick(product)}
      className="group cursor-pointer"
     >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
       <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
       />
       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      </div>

      <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
       {product.name}
      </h3>
      <div className="flex items-center gap-2">
       <span className="font-black text-gray-900 dark:text-white">
        {convertPrice(product.price)}
       </span>
       {product.compareAtPrice && product.compareAtPrice > product.price && (
        <span className="text-sm text-gray-400 line-through">
         {convertPrice(product.compareAtPrice)}
        </span>
       )}
      </div>
     </div>
    ))}
   </div>
  </div>
 );
};

export default RecentlyViewed;
