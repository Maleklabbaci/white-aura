// src/pages/TrackOrder.tsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Phone,
  MapPin,
  ShoppingBag,
  CalendarDays,
  CircleDot,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrackOrder() {
  const { orders } = useAppContext();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [foundOrders, setFoundOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    // Nettoyer le numéro (enlever espaces, tirets, +213 etc.)
    const cleanPhone = phone.trim().replace(/[\s\-\.]/g, '');

    const results = orders.filter((o) => {
      const orderPhone = o.customer.phone.replace(/[\s\-\.]/g, '');
      return (
        orderPhone === cleanPhone ||
        orderPhone.endsWith(cleanPhone) ||
        cleanPhone.endsWith(orderPhone)
      );
    });

    // Trier par date (plus récent en premier)
    setFoundOrders(results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const steps = [
    {
      key: 'En attente',
      label: 'Commande confirmée',
      icon: Clock,
      description: 'Votre commande a été reçue avec succès. Notre équipe la prépare avec soin.',
      detail: 'Délai estimé : préparation sous 24h.',
      color: 'yellow',
    },
    {
      key: 'Expédiée',
      label: 'En cours de livraison',
      icon: Truck,
      description: 'Votre colis a quitté notre entrepôt et est en route vers votre adresse.',
      detail: 'Délai estimé : livraison sous 2 à 5 jours ouvrables selon votre wilaya.',
      color: 'blue',
    },
    {
      key: 'Livrée',
      label: 'Livrée avec succès',
      icon: CheckCircle2,
      description: 'Votre commande a été livrée ! Merci pour votre confiance.',
      detail: 'Si vous avez un souci, contactez-nous dans les 48h.',
      color: 'green',
    },
  ];

  const getStepStatus = (orderStatus: string, stepKey: string) => {
    const order = ['En attente', 'Expédiée', 'Livrée'];
    const orderIndex = order.indexOf(orderStatus);
    const stepIndex = order.indexOf(stepKey);
    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En attente':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full">
            <Clock size={12} />
            En préparation
          </span>
        );
      case 'Expédiée':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
            <Truck size={12} />
            En livraison
          </span>
        );
      case 'Livrée':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
            <CheckCircle2 size={12} />
            Livrée
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Retour au site
          </button>
          <div className="text-center">
            <Package className="mx-auto mb-4 text-gold-500" size={40} />
            <h1 className="text-3xl font-display font-bold text-gray-900 uppercase tracking-widest mb-2">
              Suivre ma commande
            </h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Entrez le numéro de téléphone utilisé lors de votre commande pour voir l'état de votre livraison en temps réel.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
        >
          <form onSubmit={handleSearch} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                <Phone size={14} className="inline mr-2" />
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 0555 12 34 56"
                required
                className="w-full border border-gray-300 px-4 py-4 text-base text-center font-mono tracking-widest focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                Le même numéro que vous avez donné lors de la commande
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white px-10 py-4 hover:bg-gold-400 hover:text-gray-900 transition-colors font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Rechercher mes commandes
            </button>
          </form>
        </motion.div>

        {/* Results */}
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-6"
          >
            {foundOrders.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 text-center">
                  {foundOrders.length} commande{foundOrders.length > 1 ? 's' : ''} trouvée{foundOrders.length > 1 ? 's' : ''}
                </p>

                {foundOrders.map((order, orderIndex) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * orderIndex }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-200">
                            <ShoppingBag size={20} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">
                              Commande
                            </p>
                            <p className="font-mono font-bold text-gray-900 text-lg">
                              #{order.id.slice(-6)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="flex items-start gap-3">
                          <CalendarDays size={16} className="text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Date</p>
                            <p className="text-sm font-bold text-gray-900">
                              {new Date(order.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Livraison</p>
                            <p className="text-sm font-bold text-gray-900">
                              {order.customer.wilaya}
                            </p>
                            <p className="text-xs text-gray-500">{order.customer.commune}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CircleDot size={16} className="text-gold-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Total</p>
                            <p className="text-lg font-bold text-gold-600">
                              {order.total.toLocaleString('fr-DZ')} DZD
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Articles commandés */}
                      {order.items && order.items.length > 0 && (
                        <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                            Articles commandés
                          </p>
                          <div className="space-y-2">
                            {order.items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700">
                                  {item.name} <span className="text-gray-400">× {item.quantity}</span>
                                </span>
                                <span className="font-bold text-gray-900">
                                  {(item.price * item.quantity).toLocaleString('fr-DZ')} DZD
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="relative">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                          Suivi de livraison
                        </p>
                        {steps.map((step, index) => {
                          const status = getStepStatus(order.status, step.key);
                          const StepIcon = step.icon;

                          return (
                            <div key={step.key} className="flex gap-4 mb-6 last:mb-0">
                              {/* Line + Circle */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                    status === 'completed'
                                      ? 'bg-green-500 text-white shadow-md shadow-green-200'
                                      : status === 'current'
                                      ? 'bg-gold-400 text-gray-900 ring-4 ring-gold-100 shadow-md shadow-gold-200'
                                      : 'bg-gray-100 text-gray-300'
                                  }`}
                                >
                                  <StepIcon size={18} />
                                </div>
                                {index < steps.length - 1 && (
                                  <div
                                    className={`w-0.5 h-full min-h-[40px] mt-1 transition-colors ${
                                      status === 'completed'
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                                    }`}
                                  />
                                )}
                              </div>

                              {/* Content */}
                              <div className="pt-1 pb-2">
                                <h3
                                  className={`font-bold text-sm uppercase tracking-widest ${
                                    status === 'upcoming'
                                      ? 'text-gray-300'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {step.label}
                                </h3>
                                <p
                                  className={`text-sm mt-1 ${
                                    status === 'upcoming'
                                      ? 'text-gray-300'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {step.description}
                                </p>
                                {status !== 'upcoming' && (
                                  <p
                                    className={`text-xs mt-1 font-medium ${
                                      status === 'current'
                                        ? 'text-gold-600'
                                        : 'text-green-600'
                                    }`}
                                  >
                                    {step.detail}
                                  </p>
                                )}
                                {status === 'current' && (
                                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold uppercase tracking-widest bg-gold-100 text-gold-700 px-3 py-1 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse"></span>
                                    Statut actuel
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Message selon le statut */}
                      <div className={`mt-6 p-4 rounded-xl text-sm ${
                        order.status === 'En attente'
                          ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                          : order.status === 'Expédiée'
                          ? 'bg-blue-50 border border-blue-200 text-blue-800'
                          : 'bg-green-50 border border-green-200 text-green-800'
                      }`}>
                        {order.status === 'En attente' && (
                          <>
                            <p className="font-bold mb-1">⏳ Votre commande est en cours de préparation</p>
                            <p>Notre équipe prépare votre colis avec soin. Vous serez notifié dès que votre commande sera expédiée. Délai moyen de préparation : 24 heures.</p>
                          </>
                        )}
                        {order.status === 'Expédiée' && (
                          <>
                            <p className="font-bold mb-1">🚚 Votre colis est en route !</p>
                            <p>Le livreur vous contactera au <strong>{order.customer.phone}</strong> avant la livraison. Veuillez garder votre téléphone accessible. Livraison estimée sous 2 à 5 jours ouvrables.</p>
                          </>
                        )}
                        {order.status === 'Livrée' && (
                          <>
                            <p className="font-bold mb-1">✅ Commande livrée avec succès !</p>
                            <p>Merci pour votre achat chez White Aura ! Si vous rencontrez un problème avec votre commande, contactez-nous dans les 48 heures.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            ) : (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                <Package className="mx-auto mb-4 text-gray-300" size={48} />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Aucune commande trouvée
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Aucune commande n'est associée à ce numéro de téléphone. Vérifiez le numéro utilisé lors de votre commande.
                </p>
                <button
                  onClick={() => {
                    setSearched(false);
                    setPhone('');
                  }}
                  className="mt-6 text-sm font-bold text-gold-600 hover:text-gold-700 uppercase tracking-widest"
                >
                  Réessayer
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
