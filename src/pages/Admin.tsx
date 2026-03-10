import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import {
  Package, Plus, LogOut, CheckCircle2, Image as ImageIcon,
  Trash2, Tag, Pencil, X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const { products, addProduct, deleteProduct, updateProductStock, orders, updateOrderStatus } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Form
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Connexion réussie' }));
    } else {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Mot de passe incorrect' }));
    }
  };

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
      // ── MODIFIER ──
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

        // Mettre à jour le state local
        window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Produit modifié ✅' }));
        // Recharger la page pour voir les changements
        window.location.reload();
      } catch (err: any) {
        alert('❌ Erreur modification: ' + (err?.message || ''));
      }
    } else {
      // ── AJOUTER ──
      productData.id = Date.now().toString();
      addProduct(productData);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Produit ajouté ✅' }));
    }

    resetForm();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-gray-900 uppercase tracking-widest mb-2">Accès Admin</h1>
            <p className="text-sm text-gray-500">Entrez le mot de passe</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400" required />
            <button type="submit" className="w-full bg-gray-900 text-white py-4 mt-2 hover:bg-gold-400 hover:text-gray-900 transition-colors font-bold text-sm uppercase tracking-widest">Se connecter</button>
            <button type="button" onClick={() => navigate('/')} className="w-full text-gray-500 py-2 hover:text-gray-900 text-xs uppercase tracking-widest">Retour au site</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 uppercase tracking-widest">Tableau de bord</h1>
            <p className="text-sm text-gray-500 mt-2">Gérez vos produits et collections</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-white border border-gray-200 text-gray-900 text-xs font-bold uppercase tracking-widest hover:border-gray-900 transition-colors">Voir le site</button>
            <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"><LogOut size={16} />Déconnexion</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button onClick={() => setActiveTab('products')} className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest border-b-2 ${activeTab === 'products' ? 'border-gold-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>Produits</button>
          <button onClick={() => setActiveTab('orders')} className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest border-b-2 flex items-center gap-2 ${activeTab === 'orders' ? 'border-gold-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            Commandes
            {orders.filter((o) => o.status === 'En attente').length > 0 && (
              <span className="bg-gold-400 text-gray-900 text-[10px] px-2 py-0.5 rounded-full">{orders.filter((o) => o.status === 'En attente').length}</span>
            )}
          </button>
        </div>

        {activeTab === 'products' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ═══════════════════════════════════════════════ */}
            {/* FORMULAIRE AJOUTER / MODIFIER                  */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

              {/* Titre du formulaire */}
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${editingId ? 'bg-blue-500 text-white' : 'bg-gold-400 text-gray-900'}`}>
                    {editingId ? <Pencil size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-gray-900 uppercase tracking-widest">
                      {editingId ? 'Modifier le produit' : 'Ajouter un produit'}
                    </h2>
                    {editingId && <p className="text-xs text-blue-500">Mode édition — ID: {editingId}</p>}
                  </div>
                </div>
                {editingId && (
                  <button onClick={resetForm} className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest">
                    <X size={14} /> Annuler
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Nom + Catégorie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Nom du produit</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400" placeholder="Ex: Sérum Éclat Or" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Collection / Catégorie</label>
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400" placeholder="Ex: Soin du visage" />
                  </div>
                </div>

                {/* Prix + Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Prix actuel (DZD)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400" placeholder="Ex: 4500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Stock</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required min="0" className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400" placeholder="Ex: 10" />
                  </div>
                </div>

                {/* ═══════════════════════════════════════════ */}
                {/* PROMO — FOND ROUGE BIEN VISIBLE            */}
                {/* ═══════════════════════════════════════════ */}
                <div className="p-5 bg-red-50 border-2 border-red-200 rounded-xl">
                  <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Tag size={16} />
                    Section Promotion (optionnel)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                        💰 Ancien prix avant promo
                      </label>
                      <input
                        type="number"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        min="0"
                        className="w-full border border-red-200 px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white rounded"
                        placeholder="Ex: 6500 (vide = pas de promo)"
                      />
                      <p className="text-[10px] text-red-400 mt-1">Laissez vide si pas de promotion</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                        🏷️ Badge promo
                      </label>
                      <input
                        type="text"
                        value={promoLabel}
                        onChange={(e) => setPromoLabel(e.target.value)}
                        className="w-full border border-red-200 px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 bg-white rounded"
                        placeholder="Ex: -30%, Soldes, Promo Été"
                      />
                      <p className="text-[10px] text-red-400 mt-1">Badge rouge affiché sur le produit</p>
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Image du produit</label>
                  <div className="flex items-center gap-4">
                    {(imagePreview || imageUrl) && (
                      <div className="relative">
                        <img src={imagePreview || imageUrl} alt="Preview" className={`w-16 h-16 object-cover rounded border border-gray-200 ${imageLoading ? 'opacity-50' : ''}`} />
                        {imageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-gold-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          </div>
                        )}
                      </div>
                    )}
                    <label className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 px-4 py-3 text-sm hover:border-gold-400 hover:bg-gold-50 transition-colors ${imageLoading ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}>
                      {imageLoading ? (
                        <><svg className="animate-spin h-5 w-5 text-gold-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span className="text-gray-600 font-medium">Upload en cours...</span></>
                      ) : imageUrl ? (
                        <><CheckCircle2 size={18} className="text-green-500" /><span className="text-green-600 font-medium">Image OK — Cliquer pour changer</span></>
                      ) : (
                        <><ImageIcon size={18} className="text-gray-400" /><span className="text-gray-600 font-medium">Télécharger une photo</span></>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={imageLoading} />
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400" placeholder="Décrivez le produit..."></textarea>
                </div>

                {/* Nouveau */}
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isNew" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="w-5 h-5 accent-gold-500" />
                  <label htmlFor="isNew" className="text-sm font-medium text-gray-700 cursor-pointer">Marquer comme "Nouveau"</label>
                </div>

                {/* Submit */}
                <button type="submit" disabled={imageLoading || !imageUrl} className={`w-full md:w-auto self-start px-8 py-4 mt-2 font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-colors ${imageLoading || !imageUrl ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : editingId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-gold-400 hover:text-gray-900'}`}>
                  {editingId ? <><Pencil size={18} /> Enregistrer les modifications</> : <><CheckCircle2 size={18} /> Publier le produit</>}
                </button>
              </form>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* INVENTAIRE                                      */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900"><Package size={20} /></div>
                <h2 className="text-xl font-display font-bold text-gray-900 uppercase tracking-widest">Inventaire ({products.length})</h2>
              </div>
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                {products.map((product) => (
                  <div key={product.id} className={`flex gap-4 items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors ${editingId === product.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100'}`}>
                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" referrerPolicy="no-referrer" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{product.category}</p>
                      {product.promoLabel && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 mt-0.5"><Tag size={8} />{product.promoLabel}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        {product.originalPrice ? (
                          <>
                            <p className="text-[10px] text-gray-400 line-through">{product.originalPrice.toLocaleString('fr-DZ')} DZD</p>
                            <p className="text-sm font-bold text-red-500">{product.price.toLocaleString('fr-DZ')} DZD</p>
                          </>
                        ) : (
                          <p className="text-sm font-bold text-gold-600">{product.price.toLocaleString('fr-DZ')} DZD</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                          <span className="text-[10px] uppercase tracking-widest font-bold px-1.5 text-gray-500 bg-gray-50 border-r border-gray-200">S</span>
                          <input type="number" value={product.stock} onChange={(e) => updateProductStock(product.id, Number(e.target.value))} className="w-10 text-xs text-center py-1 focus:outline-none" min="0" />
                        </div>
                        <button onClick={() => handleEditProduct(product)} className="text-blue-400 hover:text-blue-600 transition-colors p-1" title="Modifier">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => { if (window.confirm('Supprimer ?')) deleteProduct(product.id); }} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Supprimer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════ */
          /* COMMANDES                                          */
          /* ═══════════════════════════════════════════════════ */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100"><h2 className="text-xl font-display font-bold text-gray-900 uppercase tracking-widest">Suivi des commandes</h2></div>
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
                  {orders.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Aucune commande</td></tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-4 font-mono text-sm">{order.id}</td>
                        <td className="p-4"><p className="font-bold text-gray-900 text-sm">{order.customer.fullName}</p><p className="text-xs text-gray-500">{order.customer.phone}</p></td>
                        <td className="p-4"><p className="text-sm text-gray-900">{order.customer.wilaya}</p><p className="text-xs text-gray-500">{order.customer.commune}</p></td>
                        <td className="p-4 font-bold text-gray-900 text-sm">{order.total.toLocaleString('fr-DZ')} DZD</td>
                        <td className="p-4">
                          <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value as any)} className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-gold-400 ${order.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' : order.status === 'Expédiée' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            <option value="En attente">En attente</option>
                            <option value="Expédiée">Expédiée</option>
                            <option value="Livrée">Livrée</option>
                          </select>
                        </td>
                        <td className="p-4 text-sm text-gray-500">{new Date(order.date).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
