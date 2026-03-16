import React from 'react';
import { CheckoutStep } from '../types';
import { useCart } from '../context/CartContext';
import {
 ShoppingCart,
 Truck,
 CreditCard,
 CheckCircle,
 ChevronLeft
} from 'lucide-react';

interface CheckoutWizardProps {
 onClose?: () => void;
}

const steps: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
 { id: 'cart', label: 'Cart', icon: <ShoppingCart size={18} /> },
 { id: 'shipping', label: 'Shipping', icon: <Truck size={18} /> },
 { id: 'payment', label: 'Payment', icon: <CreditCard size={18} /> },
 { id: 'review', label: 'Review', icon: <CheckCircle size={18} /> },
];

export const CheckoutWizard: React.FC<CheckoutWizardProps> = () => {
 const { checkoutState, setCheckoutStep } = useCart();
 const currentStepIndex = steps.findIndex(s => s.id === checkoutState.currentStep);

 const getStepStatus = (index: number) => {
  if (index < currentStepIndex) return 'completed';
  if (index === currentStepIndex) return 'current';
  return 'pending';
 };

 return (
  <div className="w-full">
   {/* Progress Steps */}
   <div className="flex items-center justify-between mb-8 px-2">
    {steps.map((step, index) => {
     const status = getStepStatus(index);
     const isLast = index === steps.length - 1;

     return (
      <React.Fragment key={step.id}>
       <button
        onClick={() => {
         if (index < currentStepIndex) {
          setCheckoutStep(step.id);
         }
        }}
        disabled={index > currentStepIndex}
        className={`
                                    flex flex-col items-center gap-2 transition-all duration-300
                                    ${index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed'}
                                `}
       >
        <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                                    ${status === 'completed' ? 'bg-green-500 text-white scale-110' : ''}
                                    ${status === 'current' ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30' : ''}
                                    ${status === 'pending' ? 'bg-gray-200 dark:bg-gray-800 text-gray-400' : ''}
                                `}>
         {status === 'completed' ? <CheckCircle size={20} /> : step.icon}
        </div>
        <span className={`
                                    text-xs font-bold uppercase tracking-wider transition-colors
                                    ${status === 'completed' ? 'text-green-500' : ''}
                                    ${status === 'current' ? 'text-indigo-600 dark:text-indigo-400' : ''}
                                    ${status === 'pending' ? 'text-gray-400' : ''}
                                `}>
         {step.label}
        </span>
       </button>

       {!isLast && (
        <div className={`
                                    flex-1 h-1 mx-2 rounded-full transition-all duration-500
                                    ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}
                                `} />
       )}
      </React.Fragment>
     );
    })}
   </div>

   {/* Mobile Step Indicator */}
   <div className="lg:hidden flex items-center justify-between mb-6 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl">
    <button
     onClick={() => {
      if (currentStepIndex > 0) {
       setCheckoutStep(steps[currentStepIndex - 1].id);
      }
     }}
     disabled={currentStepIndex === 0}
     className="p-2 rounded-full bg-white dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
     <ChevronLeft size={20} />
    </button>
    <div className="text-center">
     <span className="text-sm font-bold text-gray-900 dark:text-white">
      Step {currentStepIndex + 1} of {steps.length}
     </span>
     <p className="text-xs text-gray-500">{steps[currentStepIndex].label}</p>
    </div>
    <div className="w-10" />
   </div>
  </div>
 );
};

export default CheckoutWizard;
