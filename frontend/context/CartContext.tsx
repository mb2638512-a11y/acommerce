import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';
import { CheckoutState, ShippingAddress, ShippingMethod, PaymentMethodType, CardDetails, OrderConfirmation, CheckoutStep, ShippingMethodType } from '../types';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    variantId?: string;
    storeId?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any, quantity?: number, variant?: any) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, qty: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
    // Checkout state
    checkoutState: CheckoutState;
    setCheckoutStep: (step: CheckoutStep) => void;
    setShippingAddress: (address: ShippingAddress) => void;
    setShippingMethod: (method: ShippingMethod) => void;
    setPaymentMethod: (method: PaymentMethodType) => void;
    setCardDetails: (details: CardDetails | null) => void;
    applyCoupon: (code: string) => Promise<boolean>;
    setOrderNotes: (notes: string) => void;
    setIsGuestCheckout: (isGuest: boolean) => void;
    setTermsAccepted: (accepted: boolean) => void;
    processCheckout: () => Promise<OrderConfirmation | null>;
    resetCheckout: () => void;
    // Cart drawer
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const initialCheckoutState: CheckoutState = {
    currentStep: 'cart',
    shippingAddress: null,
    shippingMethod: null,
    paymentMethod: null,
    cardDetails: null,
    couponCode: '',
    discount: 0,
    orderNotes: '',
    isGuestCheckout: true,
    termsAccepted: false,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialCheckoutState);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user } = useAuth();

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
        const syncToBackend = async () => {
            if (items.length === 0) return;
        };
        syncToBackend();
    }, [items, user]);

    const addToCart = (product: any, quantity = 1, variant?: any) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity,
                storeId: product.storeId
            } as any];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: string, qty: number) => {
        if (qty < 1) return removeFromCart(id);
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    };

    const clearCart = () => {
        setItems([]);
        resetCheckout();
    };

    // Checkout methods
    const setCheckoutStep = (step: CheckoutStep) => {
        setCheckoutState(prev => ({ ...prev, currentStep: step }));
    };

    const setShippingAddress = (address: ShippingAddress) => {
        setCheckoutState(prev => ({ ...prev, shippingAddress: address }));
    };

    const setShippingMethod = (method: ShippingMethod) => {
        setCheckoutState(prev => ({ ...prev, shippingMethod: method }));
    };

    const setPaymentMethod = (method: PaymentMethodType) => {
        setCheckoutState(prev => ({ ...prev, paymentMethod: method }));
    };

    const setCardDetails = (details: CardDetails | null) => {
        setCheckoutState(prev => ({ ...prev, cardDetails: details }));
    };

    const applyCoupon = async (code: string): Promise<boolean> => {
        // Simulate coupon validation
        const validCodes: Record<string, number> = {
            'SAVE10': 10,
            'SAVE20': 20,
            'WELCOME': 15,
        };

        const discount = validCodes[code.toUpperCase()];
        if (discount) {
            setCheckoutState(prev => ({
                ...prev,
                couponCode: code.toUpperCase(),
                discount: (total * discount) / 100
            }));
            return true;
        }
        return false;
    };

    const setOrderNotes = (notes: string) => {
        setCheckoutState(prev => ({ ...prev, orderNotes: notes }));
    };

    const setIsGuestCheckout = (isGuest: boolean) => {
        setCheckoutState(prev => ({ ...prev, isGuestCheckout: isGuest }));
    };

    const setTermsAccepted = (accepted: boolean) => {
        setCheckoutState(prev => ({ ...prev, termsAccepted: accepted }));
    };

    const processCheckout = async (): Promise<OrderConfirmation | null> => {
        const { shippingAddress, shippingMethod, paymentMethod, discount } = checkoutState;

        if (!shippingAddress || !shippingMethod || !paymentMethod) {
            return null;
        }

        const subtotal = total;
        const tax = subtotal * 0.08; // 8% tax
        const shippingCost = shippingMethod.price;
        const finalTotal = subtotal + tax + shippingCost - discount;

        // Simulate order creation
        const orderConfirmation: OrderConfirmation = {
            orderId: `ORD-${Date.now()}`,
            orderNumber: `#${Math.floor(Math.random() * 100000)}`,
            email: shippingAddress.email,
            items: [...items],
            subtotal,
            tax,
            shipping: shippingCost,
            discount,
            total: finalTotal,
            shippingAddress,
            paymentMethod,
            estimatedDelivery: shippingMethod.estimatedDays,
            date: Date.now(),
        };

        // Clear cart after successful checkout
        setItems([]);
        setCheckoutState(initialCheckoutState);
        setIsCartOpen(false);

        return orderConfirmation;
    };

    const resetCheckout = () => {
        setCheckoutState(initialCheckoutState);
    };

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            total,
            itemCount,
            checkoutState,
            setCheckoutStep,
            setShippingAddress,
            setShippingMethod,
            setPaymentMethod,
            setCardDetails,
            applyCoupon,
            setOrderNotes,
            setIsGuestCheckout,
            setTermsAccepted,
            processCheckout,
            resetCheckout,
            isCartOpen,
            setIsCartOpen,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
