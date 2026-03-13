import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Plus, LogOut, CheckCircle2, Image as ImageIcon,
  Trash2, Tag, Pencil, X, TrendingUp, ShoppingCart,
  Users, DollarSign, Calendar, Eye, Filter, Search,
  Download, BarChart3, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Percent, Clock, ShoppingBag, Bell,
  FileText, Printer, Mail, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ══════════════════════════════════════════════════
// COMPRESSION D'IMAGE OPTIMISÉE
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
// TYPES
// ══════════════════════════════════════════════════
interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  avgOrderValue: number;
  pendingOrders: number;
  conversionRate: number;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  revenueByDate: Array<{ date: string; amount: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  lowStockProducts: Array<{ id: string; name: string; stock: number }>;
  recentActivity: Array<{ type: string; message: string; time: string }>;
}

// ══════════════════════════════════════════════════
// SKELETON LOADER
// ══════════════════════════════════════════════════
const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
      <div className="w-16 h-4 rounded bg-gray-200"></div>
    </div>
    <div className="w-24 h-3 rounded bg-gray-200 mb-2"></div>
    <div className="w-32 h-8 rounded bg-gray-200"></div>
  </div>
);

// ══════════════════════════════════════════════════
// STAT CARD AMÉLIORÉE
// ══════════════════════════════════════════════════
const StatCard = ({ icon: Icon, label, value, trend, trendValue, color, onClick }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    onClick={onClick}
    className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} shadow-sm`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
    <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </motion.div>
);

// ══════════════════════════════════════════════════
// MINI CHART
// ══════════════════════════════════════════════════
const MiniChart = ({ data }: { data: Array<{ date: string; amount: number }> }) => {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((item, i) => (
        <div key={i} className="flex-1 bg-gradient-to-t from-gold-500 to-gold-300 rounded-t" 
             style={{ height: `${(item.amount / max) * 100}%`, minHeight: '4px' }}
             title={`${item.date}: ${item.amount.toLocaleString()} DA`}
        />
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════
export default function AdminV3() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const { products, addProduct, deleteProduct, updateProductStock, orders, updateOrderStatus } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'analytics'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'En attente' | 'Expédiée' | 'Livrée'>('all');
  const [loading, setLoading] = useState(true);

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
  // LOADING SIMULATION
  // ══════════════════════════════════════════════════
  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => setLoading(false), 800);
    }
  }, [isAuthenticated]);

  // ══════════════════════════════════════════════════
  // STATISTIQUES AVANCÉES
  // ══════════════════════════════════════════════════
  const stats: Stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pendingOrders = orders.filter(o => o.status === 'En attente').length;
    
    // Taux de conversion simulé (en production, tracker les visites)
    const conversionRate = 3.2;

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
      date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      amount: orders
        .filter(o => o.date.startsWith(date))
        .reduce((sum, o) => sum + o.total, 0)
    }));

    // Orders par statut
    const ordersByStatus = [
      { status: 'En attente', count: orders.filter(o => o.status === 'En attente').length },
      { status: 'Expédiée', count: orders.filter(o => o.status === 'Expédiée').length },
      { status: 'Livrée', count: orders.filter(o => o.status === 'Livrée').length },
    ];

    // Produits en stock faible (< 5)
    const lowStockProducts = products
      .filter(p => p.stock < 5)
      .map(p => ({ id: p.id, name: p.name, stock: p.stock }))
      .slice(0, 5);

    // Activité récente
    const recentActivity = orders
      .slice(-10)
      .reverse()
      .map(o => ({
        type: 'order',
        message: `Nouvelle commande de ${o.customer.fullName}`,
        time: new Date(o.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }));

    return {
      totalRevenue, totalOrders, totalProducts, avgOrderValue, 
      pendingOrders, conversionRate, topProducts, revenueByDate,
      ordersByStatus, lowStockProducts, recentActivity
    };
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setLoading(true);
    navigate('/');
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
  // PRINT INVOICE
  // ══════════════════════════════════════════════════
  const printInvoice = (order: any) => {
    const win = window.open('', '', 'width=800,height=600');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture ${order.id}</title>
        <style>
          body { font-family: Arial; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 32px; font-weight: bold; color: #D4AF37; }
          .info { margin: 20px 0; }
          .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items th, .items td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .items th { background: #f5f5f5; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">WHITE AURA</div>
          <p>Cosmétiques Premium - Algérie</p>
        </div>
        <div class="info">
          <h2>Facture ${order.id}</h2>
          <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString('fr-FR')}</p>
          <p><strong>Client:</strong> ${order.customer.fullName}</p>
          <p><strong>Téléphone:</strong> ${order.customer.phone}</p>
          <p><strong>Adresse:</strong> ${order.customer.address}, ${order.customer.commune}, ${order.customer.wilaya}</p>
        </div>
        <table class="items">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString()} DA</td>
                <td>${(item.price * item.quantity).toLocaleString()} DA</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          TOTAL: ${order.total.toLocaleString()} DA
        </div>
        <script>window.print(); window.close();</script>
      </body>
      </html>
    `);
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
            <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Package size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-500">White Aura - Gestion</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                placeholder="Entrez le mot de passe admin"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-white py-3 rounded-lg font-medium hover:from-gold-600 hover:to-gold-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Se connecter
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════
  // MAIN DASHBOARD
  // ══════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-md">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">White Aura Admin</h1>
                <p className="text-xs text-gray-500">Dashboard de gestion</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
              { id: 'products', label: 'Produits', icon: Package },
              { id: 'orders', label: 'Commandes', icon: ShoppingCart },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* ═══════════════════════════════════════ */}
          {/* DASHBOARD TAB */}
          {/* ═══════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={DollarSign}
                    label="Revenu total"
                    value={`${stats.totalRevenue.toLocaleString()} DA`}
                    trend="up"
                    trendValue="+12%"
                    color="bg-gradient-to-br from-green-500 to-green-600"
                  />
                  <StatCard
                    icon={ShoppingCart}
                    label="Commandes"
                    value={stats.totalOrders}
                    trend="up"
                    trendValue="+8%"
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    onClick={() => setActiveTab('orders')}
                  />
                  <StatCard
                    icon={Package}
                    label="Produits"
                    value={stats.totalProducts}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                    onClick={() => setActiveTab('products')}
                  />
                  <StatCard
                    icon={Clock}
                    label="En attente"
                    value={stats.pendingOrders}
                    trend={stats.pendingOrders > 5 ? 'up' : undefined}
                    trendValue={stats.pendingOrders > 5 ? `${stats.pendingOrders} urgentes` : undefined}
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                  />
                </div>
              )}

              {/* Revenue Chart + Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Revenus (7 derniers jours)</h3>
                      <p className="text-sm text-gray-500">Tendance des ventes</p>
                    </div>
                    <button className="text-sm text-gold-600 hover:text-gold-700 font-medium">
                      Voir détails →
                    </button>
                  </div>
                  <MiniChart data={stats.revenueByDate} />
                  <div className="flex justify-between mt-4 text-xs text-gray-500">
                    <span>{stats.revenueByDate[0]?.date}</span>
                    <span>{stats.revenueByDate[stats.revenueByDate.length - 1]?.date}</span>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell size={18} className="text-gold-500" />
                    <h3 className="text-lg font-bold text-gray-900">Activité récente</h3>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {stats.recentActivity.slice(0, 5).map((activity, i) => (
                      <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-gold-500 mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Products + Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-gold-500" />
                    <h3 className="text-lg font-bold text-gray-900">Top Produits</h3>
                  </div>
                  <div className="space-y-3">
                    {stats.topProducts.map((product, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-gold-600">#{i + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sales} ventes</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-600">{product.revenue.toLocaleString()} DA</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={18} className="text-orange-500" />
                    <h3 className="text-lg font-bold text-gray-900">Alertes Stock</h3>
                  </div>
                  {stats.lowStockProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Tous les stocks sont OK ✅</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.lowStockProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-orange-600">Stock faible</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-orange-600">{product.stock}</span>
                            <p className="text-xs text-gray-500">restants</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* PRODUCTS TAB */}
          {/* ═══════════════════════════════════════ */}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Add Product Form */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingId ? 'Modifier le produit' : 'Ajouter un produit'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                        required
                      >
                        <option value="">Sélectionner...</option>
                        <option value="Sérums">Sérums</option>
                        <option value="Crèmes">Crèmes</option>
                        <option value="Masques">Masques</option>
                        <option value="Nettoyants">Nettoyants</option>
                        <option value="Huiles">Huiles</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix (DA)</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix original (optionnel)</label>
                      <input
                        type="number"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="Pour afficher une promo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Label promo (optionnel)</label>
                      <input
                        type="text"
                        value={promoLabel}
                        onChange={(e) => setPromoLabel(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="Ex: -20%, PROMO"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <ImageIcon size={18} />
                        <span className="text-sm font-medium">Choisir une image</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      {imageLoading && <span className="text-sm text-gray-500">Upload en cours...</span>}
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isNew"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="w-4 h-4 text-gold-600 border-gray-300 rounded focus:ring-gold-500"
                    />
                    <label htmlFor="isNew" className="text-sm font-medium text-gray-700">
                      Marquer comme "NOUVEAU"
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg font-medium hover:from-gold-600 hover:to-gold-700 transition-all shadow-md hover:shadow-lg"
                    >
                      {editingId ? 'Enregistrer les modifications' : 'Ajouter le produit'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Products List */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Liste des produits ({products.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                {product.isNew && <span className="text-xs text-gold-600 font-medium">NOUVEAU</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700">{product.category}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{product.price.toLocaleString()} DA</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${product.stock < 5 ? 'text-orange-600' : 'text-gray-700'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Supprimer ce produit ?')) deleteProduct(product.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* ORDERS TAB */}
          {/* ═══════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom, téléphone, ID..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="En attente">En attente</option>
                    <option value="Expédiée">Expédiée</option>
                    <option value="Livrée">Livrée</option>
                  </select>
                  <button
                    onClick={exportOrdersCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Download size={16} />
                    <span className="text-sm font-medium">Exporter CSV</span>
                  </button>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
                    <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune commande trouvée</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{order.customer.fullName}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'Livrée' ? 'bg-green-100 text-green-700' :
                              order.status === 'Expédiée' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {order.customer.phone}
                            </span>
                            <span>{order.customer.commune}, {order.customer.wilaya}</span>
                            <span className="text-gray-400">#{order.id.slice(0, 8)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{order.total.toLocaleString()} DA</p>
                          <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Articles commandés:</p>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.quantity}x {item.name}</span>
                              <span className="font-medium text-gray-900">{(item.price * item.quantity).toLocaleString()} DA</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {order.status === 'En attente' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Expédiée')}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Marquer comme expédiée
                          </button>
                        )}
                        {order.status === 'Expédiée' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Livrée')}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Marquer comme livrée
                          </button>
                        )}
                        <button
                          onClick={() => printInvoice(order)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Printer size={14} />
                          Imprimer facture
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* ANALYTICS TAB */}
          {/* ═══════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
                <BarChart3 size={48} className="text-gold-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Avancés</h3>
                <p className="text-gray-500 mb-6">
                  Graphiques détaillés, rapports de ventes, prévisions de stock, et analyses comportementales des clients.
                </p>
                <p className="text-sm text-gray-400">
                  🚧 En développement - Bientôt disponible
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
