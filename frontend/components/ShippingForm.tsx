import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ShippingAddress, ShippingMethod, ShippingMethodType } from '../types';
import { ArrowRight, ArrowLeft, Truck, Zap, Clock, MapPin, Phone, Mail, User } from 'lucide-react';

interface ShippingFormProps {
 onContinue: () => void;
 onBack: () => void;
}

const shippingMethods: ShippingMethod[] = [
 {
  id: 'standard',
  name: 'Standard Shipping',
  description: 'Delivered in 5-7 business days',
  price: 9.99,
  estimatedDays: '5-7 business days',
 },
 {
  id: 'express',
  name: 'Express Shipping',
  description: 'Delivered in 2-3 business days',
  price: 19.99,
  estimatedDays: '2-3 business days',
 },
 {
  id: 'overnight',
  name: 'Overnight Shipping',
  description: 'Delivered next business day',
  price: 29.99,
  estimatedDays: 'Next business day',
 },
];

export const ShippingForm: React.FC<ShippingFormProps> = ({ onContinue, onBack }) => {
 const { checkoutState, setShippingAddress, setShippingMethod, setOrderNotes } = useCart();
 const { convertPrice } = useCurrency();
 const [errors, setErrors] = useState<Record<string, string>>({});

 const [formData, setFormData] = useState<ShippingAddress>(
  checkoutState.shippingAddress || {
   firstName: '',
   lastName: '',
   email: '',
   phone: '',
   address: '',
   city: '',
   state: '',
   zipCode: '',
   country: 'US',
   saveAddress: false,
  }
 );

 const [orderNotesLocal, setOrderNotesLocal] = useState(checkoutState.orderNotes || '');
 const [selectedMethod, setSelectedMethod] = useState<ShippingMethodType>(
  (checkoutState.shippingMethod?.id as ShippingMethodType) || 'standard'
 );

 const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
  if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
  if (!formData.email.trim()) newErrors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
  if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
  if (!formData.address.trim()) newErrors.address = 'Address is required';
  if (!formData.city.trim()) newErrors.city = 'City is required';
  if (!formData.state.trim()) newErrors.state = 'State is required';
  if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
 };

 const handleSubmit = () => {
  if (validateForm()) {
   setShippingAddress(formData);
   const method = shippingMethods.find(m => m.id === selectedMethod);
   if (method) setShippingMethod(method);
   setOrderNotes(orderNotesLocal);
   onContinue();
  }
 };

 const handleChange = (field: keyof ShippingAddress, value: string | boolean) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  if (errors[field]) {
   setErrors(prev => ({ ...prev, [field]: '' }));
  }
 };

 const getMethodIcon = (id: ShippingMethodType) => {
  switch (id) {
   case 'standard': return <Truck size={20} />;
   case 'express': return <Zap size={20} />;
   case 'overnight': return <Clock size={20} />;
  }
 };

 return (
  <div className="animate-fade-in">
   <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Shipping Information</h2>

   {/* Contact Info */}
   <div className="mb-8">
    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
     <Mail size={18} className="text-indigo-500" /> Contact Information
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <div>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
      <div className="relative">
       <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
       <input
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
        placeholder="your@email.com"
       />
      </div>
      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
     </div>

     <div>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
      <div className="relative">
       <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
       <input
        type="tel"
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border ${errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
        placeholder="(555) 123-4567"
       />
      </div>
      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
     </div>
    </div>
   </div>

   {/* Shipping Address */}
   <div className="mb-8">
    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
     <MapPin size={18} className="text-indigo-500" /> Shipping Address
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
     <div>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
      <div className="relative">
       <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
       <input
        type="text"
        value={formData.firstName}
        onChange={(e) => handleChange('firstName', e.target.value)}
        className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border ${errors.firstName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
        placeholder="John"
       />
      </div>
      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
     </div>

     <div>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
      <input
       type="text"
       value={formData.lastName}
       onChange={(e) => handleChange('lastName', e.target.value)}
       className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.lastName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
       placeholder="Doe"
      />
      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
     </div>
    </div>

    <div className="mb-4">
     <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Address</label>
     <input
      type="text"
      value={formData.address}
      onChange={(e) => handleChange('address', e.target.value)}
      className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.address ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
      placeholder="123 Main Street"
     />
     {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
     <div className="col-span-2 md:col-span-2">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">City</label>
      <input
       type="text"
       value={formData.city}
       onChange={(e) => handleChange('city', e.target.value)}
       className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.city ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
       placeholder="New York"
      />
      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
     </div>

     <div>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">State</label>
      <input
       type="text"
       value={formData.state}
       onChange={(e) => handleChange('state', e.target.value)}
       className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.state ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
       placeholder="NY"
      />
      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
     </div>

     <div>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ZIP Code</label>
      <input
       type="text"
       value={formData.zipCode}
       onChange={(e) => handleChange('zipCode', e.target.value)}
       className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.zipCode ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
       placeholder="10001"
      />
      {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
     </div>
    </div>

    <div className="flex items-center gap-2">
     <input
      type="checkbox"
      id="saveAddress"
      checked={formData.saveAddress}
      onChange={(e) => handleChange('saveAddress', e.target.checked)}
      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
     />
     <label htmlFor="saveAddress" className="text-sm text-gray-600 dark:text-gray-400">
      Save this address for future orders
     </label>
    </div>
   </div>

   {/* Shipping Method */}
   <div className="mb-8">
    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
     <Truck size={18} className="text-indigo-500" /> Shipping Method
    </h3>

    <div className="space-y-3">
     {shippingMethods.map((method) => (
      <label
       key={method.id}
       className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedMethod === method.id
         ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
         : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
       <div className="flex items-center gap-4">
        <input
         type="radio"
         name="shippingMethod"
         value={method.id}
         checked={selectedMethod === method.id}
         onChange={() => setSelectedMethod(method.id as ShippingMethodType)}
         className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
        />
        <div className={`p-2 rounded-full ${selectedMethod === method.id
          ? 'bg-indigo-500 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
         }`}>
         {getMethodIcon(method.id as ShippingMethodType)}
        </div>
        <div>
         <p className="font-bold text-gray-900 dark:text-white">{method.name}</p>
         <p className="text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
        </div>
       </div>
       <span className="font-black text-lg text-gray-900 dark:text-white">
        {method.price === 0 ? 'FREE' : convertPrice(method.price)}
       </span>
      </label>
     ))}
    </div>
   </div>

   {/* Order Notes */}
   <div className="mb-8">
    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
     Order Notes (Optional)
    </label>
    <textarea
     value={orderNotesLocal}
     onChange={(e) => setOrderNotesLocal(e.target.value)}
     rows={3}
     className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
     placeholder="Special instructions for delivery..."
    />
   </div>

   {/* Navigation Buttons */}
   <div className="flex gap-4">
    <button
     onClick={onBack}
     className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
    >
     <ArrowLeft size={20} /> Back to Cart
    </button>
    <button
     onClick={handleSubmit}
     className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
    >
     Continue to Payment <ArrowRight size={20} />
    </button>
   </div>
  </div>
 );
};

export default ShippingForm;
