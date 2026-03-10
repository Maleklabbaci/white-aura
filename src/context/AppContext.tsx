import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { Language } from '../utils/translations';
import { supabase } from '../lib/supabase';

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
  loading: boolean;
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

// ── Mapping DB ↔ App ──────────────────────────────────────────
const mapProductFromDb = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  price: Number(row.price),
  originalPrice: row.original_price ? Number(row.original_price) : undefined,
  promoLabel: row.promo_label || undefined,
  imageUrl: row.image_url || '',
  images: row.images || [],
  category: row.category || '',
  isNew: row.is_new || false,
  stock: Number(row.stock) || 0,
});

const mapProductToDb = (p: Product) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: p.price,
  original_price: p.originalPrice || null,
  promo_label: p.promoLabel || null,
  image_url: p.imageUrl,
  images: p.images || [],
  category: p.category,
  is_new: p.isNew || false,
  stock: p.stock,
});

const mapOrderFromDb = (row: any): Order => ({
  id: row.id,
  items: row.items || [],
  total: Number(row.total),
  customer: row.customer || {},
  status: row.status,
  date: row.date,
});

const mapOrderToDb = (o: Order) => ({
  id: o.id,
  items: o.items,
  total: o.total,
  customer: o.customer,
  status: o.status,
  date: o.date,
});

// ── Provider ──────────────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('white_aura_language');
    return (saved as Language) || 'fr';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('white_aura_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // ── Fetch Products from Supabase ─────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts((data || []).map(mapProductFromDb));
      } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback: si Supabase marche pas, utiliser localStorage
        const saved = localStorage.getItem('white_aura_products');
        if (saved) setProducts(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Fetch Orders from Supabase ───────────────────────────
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders((data || []).map(mapOrderFromDb));
      } catch (err) {
        console.error('Error fetching orders:', err);
        const saved = localStorage.getItem('white_aura_orders');
        if (saved) setOrders(JSON.parse(saved));
      }
    };
    fetchOrders();
  }, []);

  // ── Language ─────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('white_aura_language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // ── Cart → localStorage ──────────────────────────────────
  useEffect(() => {
    localStorage.setItem('white_aura_cart', JSON.stringify(cart));
  }, [cart]);

  // ── Add Product → Supabase ───────────────────────────────
  const addProduct = async (p: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert(mapProductToDb(p));

      if (error) throw error;
      setProducts(prev => [p, ...prev]);
    } catch (err) {
      console.error('Error adding product:', err);
      // Fallback localStorage
      setProducts(prev => [p, ...prev]);
    }
  };

  // ── Delete Product → Supabase ────────────────────────────
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting product:', err);
    }
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // ── Update Stock → Supabase ──────────────────────────────
  const updateProductStock = async (id: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating stock:', err);
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  // ── Cart ─────────────────────────────────────────────────
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

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    const product = products.find(p => p.id === id);
    if (product && quantity > product.stock) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Stock maximum atteint' }));
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  // ── Add Order → Supabase ─────────────────────────────────
  const addOrder = async (order: Order) => {
    try {
      const { error } = await supabase
        .from('orders')
        .insert(mapOrderToDb(order));

      if (error) throw error;
    } catch (err) {
      console.error('Error adding order:', err);
    }
    setOrders(prev => [order, ...prev]);
  };

  // ── Update Order Status → Supabase ───────────────────────
  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating order:', err);
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      products, loading, addProduct, deleteProduct, updateProductStock,
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
