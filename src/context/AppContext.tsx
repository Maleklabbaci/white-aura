import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { products as initialProducts } from '../data';
import { Language } from '../utils/translations';

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: {
    fullName: string;
    phone: string;
    address: string;
    wilaya: string;
    commune: string;
  };
  status: 'En attente' | 'Expédiée' | 'Livrée';
  date: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  products: Product[];
  addProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (id: string, newStock: number) => void;
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('white_aura_language');
    return (saved as Language) || 'fr';
  });

  // Initialize from localStorage or fallback to initialProducts
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('white_aura_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('white_aura_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('white_aura_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('white_aura_language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Save to localStorage whenever products or cart change
  useEffect(() => {
    localStorage.setItem('white_aura_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('white_aura_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('white_aura_orders', JSON.stringify(orders));
  }, [orders]);

  const addProduct = (p: Product) => setProducts([p, ...products]);

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateProductStock = (id: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };
  
  const addToCart = (p: Product) => {
    if (p.stock <= 0) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Produit en rupture de stock' }));
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) {
          window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Stock maximum atteint' }));
          return prev;
        }
        return prev.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...p, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const product = products.find(p => p.id === id);
    if (product && quantity > product.stock) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Stock maximum atteint' }));
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const addOrder = (order: Order) => setOrders([order, ...orders]);

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage,
      products, addProduct, deleteProduct, updateProductStock,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      orders, addOrder, updateOrderStatus,
      isCartOpen, setIsCartOpen, 
      isAuthOpen, setIsAuthOpen 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
