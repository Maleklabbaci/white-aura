// src/pages/Admin.tsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import {
  Package,
  Plus,
  LogOut,
  CheckCircle2,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ── Fonction de compression d'image ──────────────────────────────
const compressImage = (
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Compression échouée'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Erreur de chargement de l'image"));
    };

    img.src = url;
  });
};

// ── Upload vers Supabase Storage ─────────────────────────────────
const uploadToSupabase = async (file: File): Promise<string> => {
  // Compresser l'image
  const compressedBlob = await compressImage(file, 800, 0.7);

  // Générer un nom unique
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
  const filePath = `products/${fileName}`;

  // Upload vers Supabase Storage
  const { error } = await supabase.storage
    .from('products')
    .upload(filePath, compressedBlob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
    });

  if (error) throw error;

  // Récupérer l'URL publique
  const { data } = supabase.storage.from('products').getPublicUrl(filePath);

  return data.publicUrl;
};

// ── Composant Admin ──────────────────────────────────────────────
export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const {
    products,
    addProduct,
    deleteProduct,
    updateProductStock,
    orders,
    updateOrderStatus,
  } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // ── Login ────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      window.dispatchEvent(
        new CustomEvent('show-toast', { detail: 'Connexion réussie' })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent('show-toast', { detail: 'Mot de passe incorrect' })
      );
    }
  };

  // ── Image Upload (Compress + Supabase) ───────────────────────
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limite de 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: 'Image trop lourde (max 10MB)',
        })
      );
      return;
    }

    setImageLoading(true);

    // Aperçu local immédiat
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    try {
      const publicUrl = await uploadToSupabase(file);
      setImageUrl(publicUrl);
      window.dispatchEvent(
        new CustomEvent('show-toast', { detail: 'Image uploadée avec succès' })
      );
    } catch (error) {
      console.error('Upload error:', error);
      setImagePreview('');
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: "Erreur lors de l'upload de l'image",
        })
      );
    } finally {
      setImageLoading(false);
    }
  };

  // ── Add Product ──────────────────────────────────────────────
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl) {
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: "Veuillez d'abord uploader une image",
        })
      );
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      description,
      imageUrl,
      images: [imageUrl],
      isNew,
    };

    addProduct(newProduct);
    window.dispatchEvent(
      new CustomEvent('show-toast', { detail: 'Produit ajouté avec succès' })
    );

    // Reset form
    setName('');
    setCategory('');
    setPrice('');
    setStock('10');
    setDescription('');
    setImageUrl('');
    setImagePreview('');
    setIsNew(false);
  };

  // ── Login Screen ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-gray-900 uppercase tracking-widest mb-2">
              Accès Admin
            </h1>
            <p className="text-sm text-gray-500">
              Veuillez entrer le mot de passe pour accéder au tableau de bord.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 mt-2 hover:bg-gold-400 hover:text-gray-900 transition-colors font-bold text-sm uppercase tracking-widest"
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full bg-transparent text-gray-500 py-2 hover:text-gray-900 transition-colors text-xs uppercase tracking-widest"
            >
              Retour au site
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 uppercase tracking-widest">
              Tableau de bord
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Gérez vos produits et collections
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-900 text-xs font-bold uppercase tracking-widest hover:border-gray-900 transition-colors"
            >
              Voir le site
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${
              activeTab === 'products'
                ? 'border-gold-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Produits
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-gold-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Commandes
            {orders.filter((o) => o.status === 'En attente').length > 0 && (
              <span className="bg-gold-400 text-gray-900 text-[10px] px-2 py-0.5 rounded-full">
                {orders.filter((o) => o.status === 'En attente').length}
              </span>
            )}
          </button>
        </div>

        {/* ── PRODUCTS TAB ────────────────────────────────────── */}
        {activeTab === 'products' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Product Form */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 bg-gold-400 rounded-full flex items-center justify-center text-gray-900">
                  <Plus size={20} />
                </div>
                <h2 className="text-xl font-display font-bold text-gray-900 uppercase tracking-widest">
                  Ajouter un produit
                </h2>
              </div>

              <form onSubmit={handleAddProduct} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                      Nom du produit
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                      placeholder="Ex: Sérum Éclat Or"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                      Collection / Catégorie
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                      placeholder="Ex: Soin du visage"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                      Prix (DZD)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min="0"
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                      placeholder="Ex: 4500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                      Stock initial
                    </label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                      min="0"
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                      placeholder="Ex: 10"
                    />
                  </div>
                </div>

                {/* ── Image Upload Zone ─────────────────────────── */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                    Image du produit
                  </label>
                  <div className="flex items-center gap-4">
                    {(imagePreview || imageUrl) && (
                      <div className="relative">
                        <img
                          src={imagePreview || imageUrl}
                          alt="Preview"
                          className={`w-16 h-16 object-cover rounded border border-gray-200 ${
                            imageLoading ? 'opacity-50' : ''
                          }`}
                        />
                        {imageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                              className="animate-spin h-5 w-5 text-gold-500"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 px-4 py-3 text-sm hover:border-gold-400 hover:bg-gold-50 transition-colors ${
                        imageLoading
                          ? 'cursor-wait opacity-60'
                          : 'cursor-pointer'
                      }`}
                    >
                      {imageLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-gold-500"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          <span className="text-gray-600 font-medium">
                            Compression & upload...
                          </span>
                        </>
                      ) : imageUrl ? (
                        <>
                          <CheckCircle2
                            size={18}
                            className="text-green-500"
                          />
                          <span className="text-green-600 font-medium">
                            Image uploadée — Cliquer pour changer
                          </span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={18} className="text-gray-400" />
                          <span className="text-gray-600 font-medium">
                            Télécharger une photo
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={imageLoading}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                    Description détaillée
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                    placeholder="Décrivez les bienfaits du produit..."
                  ></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isNew"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="w-5 h-5 accent-gold-500"
                  />
                  <label
                    htmlFor="isNew"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Marquer comme "Nouveau" produit
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={imageLoading || !imageUrl}
                  className={`w-full md:w-auto self-start px-8 py-4 mt-4 font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-colors ${
                    imageLoading || !imageUrl
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gold-400 hover:text-gray-900'
                  }`}
                >
                  <CheckCircle2 size={18} />
                  Publier le produit
                </button>
              </form>
            </div>

            {/* Stats / Inventory */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900">
                  <Package size={20} />
                </div>
                <h2 className="text-xl font-display font-bold text-gray-900 uppercase tracking-widest">
                  Inventaire ({products.length})
                </h2>
              </div>

              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {product.category}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm font-bold text-gold-600">
                        {product.price.toLocaleString('fr-DZ')} DZD
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                          <span className="text-[10px] uppercase tracking-widest font-bold px-2 text-gray-500 bg-gray-50 border-r border-gray-200">
                            Stock
                          </span>
                          <input
                            type="number"
                            value={product.stock}
                            onChange={(e) =>
                              updateProductStock(
                                product.id,
                                Number(e.target.value)
                              )
                            }
                            className="w-12 text-xs text-center py-1 focus:outline-none"
                            min="0"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                'Voulez-vous vraiment supprimer ce produit ?'
                              )
                            ) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── ORDERS TAB ───────────────────────────────────────── */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-display font-bold text-gray-900 uppercase tracking-widest">
                Suivi des commandes
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      ID
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Client
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Adresse
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Total
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Statut
                    </th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-gray-500"
                      >
                        Aucune commande pour le moment.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-4 font-mono text-sm">{order.id}</td>
                        <td className="p-4">
                          <p className="font-bold text-gray-900 text-sm">
                            {order.customer.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.customer.phone}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-900">
                            {order.customer.wilaya}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.customer.commune}
                          </p>
                        </td>
                        <td className="p-4 font-bold text-gray-900 text-sm">
                          {order.total.toLocaleString('fr-DZ')} DZD
                        </td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(
                                order.id,
                                e.target.value as any
                              )
                            }
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
