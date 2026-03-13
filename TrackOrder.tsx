import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Plus, LogOut, CheckCircle2, Image as ImageIcon,
  Trash2, Tag, Pencil, X, TrendingUp, ShoppingCart,
  Users, DollarSign, Calendar, Eye, Filter, Search,
  Download, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ══════════════════════════════════════════════════
// COMPRESSION D'IMAGE
// ══════════════════════════════════════════════════
const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Canvas error')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      c.toBlob((b) => { URL.revokeObjectURL(url); b ? resolve(b) : reject(new Error('Fail')); }, 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image error')); };
    img.src = url;
  });
};

const uploadToSupabase = async (file: File): Promise<string> => {
  const blob = await compressImage(file, 800, 0.7);
  const name = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
  const { data, error } = await supabase.storage.from('products').upload(name, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: true });
  if (error) throw new Error(error.message);
  const { data: u } = supabase.storage.from('products').getPublicUrl(data.path);
  return u.publicUrl;
};

// ══════════════════════════════════════════════════
// STATISTIQUES
// ══════════════════════════════════════════════════
interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  avgOrderValue: number;
  pendingOrders: number;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  revenueByDate: Array<{ date: string; amount: number }>;
}

const StatCard = ({ icon: Icon, label, value, trend, trendValue, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trendValue}
        </div>
      )}
    </div>
    <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </motion.div>
);

export default function AdminV2() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const { products, addProduct, deleteProduct, updateProductStock, orders, updateOrderStatus } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'En attente' | 'Expédiée' | 'Livrée'>('all');

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [promoLabel, setPromoLabel] = useState('');

  // ══════════════════════════════════════════════════
  // CALCUL DES STATISTIQUES
  // ══════════════════════════════════════════════════
  const stats: Stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pendingOrders = orders.filter(o => o.status === 'En attente').length;

    // Top produits vendus
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.id) || { name: item.name, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        productSales.set(item.id, existing);
      });
    });
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(p => ({ name: p.name, sales: p.quantity, revenue: p.revenue }));

    // Revenue par date (7 derniers jours)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    const revenueByDate = last7Days.map(date => ({
      date,
      amount: orders
        .filter(o => o.date.startsWith(date))
        .reduce((sum, o) => sum + o.total, 0)
    }));

    return { totalRevenue, totalOrders, totalProducts, avgOrderValue, pendingOrders, topProducts, revenueByDate };
  }, [orders, products]);

  // ══════════════════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════════════════
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Connexion réussie ✅' }));
    } else {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Mot de passe incorrect ❌' }));
    }
  };

  // ══════════════════════════════════════════════════
  // IMAGE UPLOAD
  // ══════════════════════════════════════════════════
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Image trop lourde (max 10MB)' }));
      return;
    }
    setImageLoading(true);
    setImagePreview(URL.createObjectURL(file));
    try {
      const url = await uploadToSupabase(file);
      setImageUrl(url);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Image uploadée ✅' }));
    } catch (err: any) {
      setImagePreview('');
      alert('❌ ERREUR: ' + (err?.message || ''));
    } finally {
      setImageLoading(false);
    }
  };

  // ══════════════════════════════════════════════════
  // FORM HANDLERS
  // ══════════════════════════════════════════════════
  const resetForm = () => {
    setEditingId(null); setName(''); setCategory(''); setPrice('');
    setStock('10'); setDescription(''); setImageUrl(''); setImagePreview('');
    setIsNew(false); setOriginalPrice(''); setPromoLabel('');
  };

  const handleEditProduct = (product: any) => {
    setEditingId(product.id);
    setName(product.name || '');
    setCategory(product.category || '');
    setPrice(String(product.price || ''));
    setStock(String(product.stock || '0'));
    setDescription(product.description || '');
    setImageUrl(product.imageUrl || '');
    setImagePreview(product.imageUrl || '');
    setIsNew(product.isNew || false);
    setOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
    setPromoLabel(product.promoLabel || '');
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: "Uploadez d'abord une image" }));
      return;
    }

    const productData: any = {
      name, category,
      price: Number(price),
      stock: Number(stock),
      description, imageUrl,
      images: [imageUrl],
      isNew,
    };
    if (originalPrice && Number(originalPrice) > 0) productData.originalPrice = Number(originalPrice);
    if (promoLabel.trim()) productData.promoLabel = promoLabel.trim();

    if (editingId) {
      try {
        const { error } = await supabase.from('products').update({
          name: productData.name,
          category: productData.category,
          price: productData.price,
          stock: productData.stock,
          description: productData.description,
          image_url: productData.imageUrl,
          images: productData.images,
          is_new: productData.isNew,
          original_price: productData.originalPrice || null,
          promo_label: productData.promoLabel || null,
        }).eq('id', editingId);
        if (error) throw error;
        window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Produit modifié ✅' }));
        resetForm();
      } catch (err: any) {
        alert('Erreur: ' + err.message);
      }
    } else {
      productData.id = `prod_${Date.now()}`;
      addProduct(productData);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Produit ajouté ✅' }));
      resetForm();
    }
  };

  // ══════════════════════════════════════════════════
  // FILTRES
  // ══════════════════════════════════════════════════
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.phone.includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  // ══════════════════════════════════════════════════
  // EXPORT CSV
  // ══════════════════════════════════════════════════
  const exportOrdersCSV = () => {
    const headers = ['ID', 'Client', 'Téléphone', 'Wilaya', 'Commune', 'Total', 'Statut', 'Date'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.customer.fullName,
      o.customer.phone,
      o.customer.wilaya,
      o.customer.commune,
      o.total,
      o.status,
      new Date(o.date).toLocaleDateString('fr-FR')
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ══════════════════════════════════════════════════
  // LOGIN SCREEN
  // ══════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 uppercase tracking-wider">White Aura</h1>
            <p className="text-sm text-gray-500 mt-2">Admin Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400 rounded-lg"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-white font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-lg hover:from-gold-500 hover:to-gold-700 transition-all shadow-lg hover:shadow-xl"
            >
              Se connecter
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // ADMIN DASHBOARD
  // ══════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-gray-900 uppercase tracking-wider">White Aura</h1>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gold-600 transition-colors flex items-center gap-2"
              >
                <Eye size={16} />
                Voir le site
              </button>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setPassword('');
                }}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
              { id: 'products', label: 'Produits', icon: Package },
              { id: 'orders', label: 'Commandes', icon: ShoppingCart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* DASHBOARD */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* STATS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={DollarSign}
                  label="Revenus totaux"
                  value={`${stats.totalRevenue.toLocaleString('fr-DZ')} DZD`}
                  color="bg-gradient-to-br from-green-400 to-green-600"
                />
                <StatCard
                  icon={ShoppingCart}
                  label="Commandes"
                  value={stats.totalOrders}
                  trend="up"
                  trendValue="+12%"
                  color="bg-gradient-to-br from-blue-400 to-blue-600"
                />
                <StatCard
                  icon={Package}
                  label="Produits"
                  value={stats.totalProducts}
                  color="bg-gradient-to-br from-purple-400 to-purple-600"
                />
                <StatCard
                  icon={Users}
                  label="En attente"
                  value={stats.pendingOrders}
                  color="bg-gradient-to-br from-orange-400 to-orange-600"
                />
              </div>

              {/* REVENUE CHART */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Revenus des 7 derniers jours</h3>
                <div className="flex items-end gap-2 h-64">
                  {stats.revenueByDate.map((item, i) => {
                    const maxRevenue = Math.max(...stats.revenueByDate.map(d => d.amount));
                    const height = maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0;
                    return (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.1 }}
                        className="flex-1 bg-gradient-to-t from-gold-400 to-gold-600 rounded-t-lg min-h-[20px] relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {item.amount.toLocaleString('fr-DZ')} DZD
                        </div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* TOP PRODUCTS */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Top 5 Produits</h3>
                <div className="space-y-4">
                  {stats.topProducts.map((product, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-600 font-bold flex items-center justify-center text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sales} ventes</p>
                        </div>
                      </div>
                      <p className="font-bold text-gold-600">{product.revenue.toLocaleString('fr-DZ')} DZD</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PRODUCTS */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* FORM */}
              <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-display font-bold text-gray-900 uppercase tracking-widest">
                    {editingId ? 'Modifier le produit' : 'Nouveau produit'}
                  </h2>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
                    >
                      <X size={16} />
                      Annuler
                    </button>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Nom du produit *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-lg"
                        placeholder="Ex: Sérum Vitamine C"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Catégorie *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-lg"
                      >
                        <option value="">-- Sélectionner --</option>
                        <option value="Visage">Visage</option>
                        <option value="Corps">Corps</option>
                        <option value="Cheveux">Cheveux</option>
                        <option value="Parfums">Parfums</option>
                        <option value="Maquillage">Maquillage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Prix (DZD) *</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        min="0"
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-lg"
                        placeholder="2500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Prix original (promo)</label>
                      <input
                        type="number"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        min="0"
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-lg"
                        placeholder="3500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Stock *</label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                        min="0"
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-lg"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Label promo</label>
                      <input
                        type="text"
                        value={promoLabel}
                        onChange={(e) => setPromoLabel(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-lg"
                        placeholder="-30%"
                      />
                    </div>
                  </div>

                  {/* IMAGE */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-3">Image du produit *</label>
                    <div className="flex gap-4 items-center">
                      {imagePreview && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          {imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                      <label className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 px-6 py-4 rounded-lg text-sm hover:border-gold-400 hover:bg-gold-50 transition-colors ${imageLoading ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}>
                        {imageLoading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-gold-500" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-gray-600 font-medium">Upload en cours...</span>
                          </>
                        ) : imageUrl ? (
                          <>
                            <CheckCircle2 size={18} className="text-green-500" />
                            <span className="text-green-600 font-medium">Image OK — Cliquer pour changer</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={18} className="text-gray-400" />
                            <span className="text-gray-600 font-medium">Télécharger une photo</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={imageLoading} />
                      </label>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Description *</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={4}
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-lg"
                      placeholder="Décrivez le produit..."
                    />
                  </div>

                  {/* NOUVEAU */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isNew"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="w-5 h-5 accent-gold-500 rounded"
                    />
                    <label htmlFor="isNew" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Marquer comme "Nouveau"
                    </label>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={imageLoading || !imageUrl}
                    className={`w-full md:w-auto px-8 py-4 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg transition-all ${
                      imageLoading || !imageUrl
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : editingId
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-gold-400 to-gold-600 text-white hover:from-gold-500 hover:to-gold-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {editingId ? (
                      <>
                        <Pencil size={18} /> Enregistrer les modifications
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> Publier le produit
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* INVENTORY */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <Package size={20} className="text-gray-900" />
                  <h2 className="text-lg font-display font-bold text-gray-900 uppercase tracking-widest">
                    Inventaire ({products.length})
                  </h2>
                </div>
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`flex gap-3 items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                        editingId === product.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100'
                      }`}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{product.category}</p>
                        {product.promoLabel && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 mt-1">
                            <Tag size={8} />
                            {product.promoLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          {product.originalPrice ? (
                            <>
                              <p className="text-[10px] text-gray-400 line-through">
                                {product.originalPrice.toLocaleString('fr-DZ')} DZD
                              </p>
                              <p className="text-sm font-bold text-red-500">
                                {product.price.toLocaleString('fr-DZ')} DZD
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-bold text-gold-600">
                              {product.price.toLocaleString('fr-DZ')} DZD
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                            <span className="text-[10px] uppercase tracking-widest font-bold px-1.5 text-gray-500 bg-gray-50 border-r border-gray-200">
                              S
                            </span>
                            <input
                              type="number"
                              value={product.stock}
                              onChange={(e) => updateProductStock(product.id, Number(e.target.value))}
                              className="w-10 text-xs text-center py-1 focus:outline-none"
                              min="0"
                            />
                          </div>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                            title="Modifier"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Supprimer ce produit ?')) deleteProduct(product.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ORDERS */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* FILTERS */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom, téléphone ou ID..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="En attente">En attente</option>
                      <option value="Expédiée">Expédiée</option>
                      <option value="Livrée">Livrée</option>
                    </select>
                    <button
                      onClick={exportOrdersCSV}
                      className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
                    >
                      <Download size={16} />
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* ORDERS TABLE */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">ID</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Client</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Adresse</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            Aucune commande trouvée
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="p-4 font-mono text-sm text-gray-900">{order.id}</td>
                            <td className="p-4">
                              <p className="font-bold text-gray-900 text-sm">{order.customer.fullName}</p>
                              <p className="text-xs text-gray-500">{order.customer.phone}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-gray-900">{order.customer.wilaya}</p>
                              <p className="text-xs text-gray-500">{order.customer.commune}</p>
                            </td>
                            <td className="p-4 font-bold text-gray-900 text-sm">
                              {order.total.toLocaleString('fr-DZ')} DZD
                            </td>
                            <td className="p-4">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-gold-400 ${
                                  order.status === 'En attente'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : order.status === 'Expédiée'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                <option value="En attente">En attente</option>
                                <option value="Expédiée">Expédiée</option>
                                <option value="Livrée">Livrée</option>
                              </select>
                            </td>
                            <td className="p-4 text-sm text-gray-500">
                              {new Date(order.date).toLocaleDateString('fr-FR')}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
