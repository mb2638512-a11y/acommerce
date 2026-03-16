import React, { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyContextType {
    currency: string;
    setCurrency: (c: string) => void;
    convertPrice: (amount: number) => string;
    rates: Record<string, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState('USD');
    const [rates, setRates] = useState<Record<string, number>>({ USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150, CAD: 1.35, AUD: 1.5 });

    const convertPrice = (amount: number) => {
        const rate = rates[currency] || 1;
        // Assume base price is USD. If store has different base, we need that info.
        // For now, assume all prices in DB are USD.
        const converted = amount * rate;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, rates }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
    return context;
};
