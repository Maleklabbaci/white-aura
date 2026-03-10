// src/pages/TrackOrder.tsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { Search, Package, Truck, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrackOrder() {
  const { orders } = useAppContext();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [foundOrder, setFoundOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    const order = orders.find(
      (o) =>
        o.id === searchId.trim() ||
        o.customer.phone === searchPhone.trim()
    );

    setFoundOrder(order || null);
  };

  const getStepStatus = (orderStatus: string, step: string) => {
    const steps = ['En attente', 'Expédiée', 'Livrée'];
    const orderIndex = steps.indexOf(orderStatus);
    const stepIndex = steps.indexOf(step);

    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  const steps = [
    { key: 'En attente', label: 'Commande confirmée', icon: Clock, description: 'Votre commande a été reçue et est en cours de préparation.' },
    { key: 'Expédiée', label: 'En cours de livraison', icon: Truck, description: 'Votre colis est en route vers votre adresse.' },
    { key: 'Livrée', label: 'Livrée', icon: CheckCircle2, description: 'Votre commande a été livrée avec succès !' },
  ];

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
            <p className="text-sm text-gray-500">
              Entrez votre numéro de commande ou votre numéro de téléphone
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
        >
          <form onSubmit={handleSearch} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                  N° de commande
                </label>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Ex: 1719856400000"
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                  Ou N° de téléphone
                </label>
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="Ex: 0555123456"
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto self-center bg-gray-900 text-white px-10 py-4 hover:bg-gold-400 hover:text-gray-900 transition-colors font-bold text-sm uppercase tracking-widest flex items-center gap-2"
            >
              <Search size={18} />
              Rechercher
            </button>
          </form>
        </motion.div>

        {/* Results */}
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            {foundOrder ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                {/* Order Info */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Commande</p>
                    <p className="font-mono font-bold text-gray-900">#{foundOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Client</p>
                    <p className="font-bold text-gray-900">{foundOrder.customer.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Date</p>
                    <p className="font-bold text-gray-900">
                      {new Date(foundOrder.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total</p>
                    <p className="font-bold text-gold-600 text-lg">
                      {foundOrder.total.toLocaleString('fr-DZ')} DZD
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {steps.map((step, index) => {
                    const status = getStepStatus(foundOrder.status, step.key);
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="flex gap-4 mb-8 last:mb-0">
                        {/* Line + Circle */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              status === 'completed'
                                ? 'bg-green-500 text-white'
                                : status === 'current'
                                ? 'bg-gold-400 text-gray-900 ring-4 ring-gold-100'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            <StepIcon size={18} />
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              className={`w-0.5 h-16 mt-1 ${
                                status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pt-1.5">
                          <h3
                            className={`font-bold text-sm uppercase tracking-widest ${
                              status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                            }`}
                          >
                            {step.label}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${
                              status === 'upcoming' ? 'text-gray-300' : 'text-gray-500'
                            }`}
                          >
                            {step.description}
                          </p>
                          {status === 'current' && (
                            <span className="inline-block mt-2 text-xs font-bold uppercase tracking-widest bg-gold-100 text-gold-700 px-3 py-1 rounded-full">
                              Statut actuel
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery Address */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Adresse de livraison
                  </p>
                  <p className="text-gray-900 font-medium">
                    {foundOrder.customer.wilaya}, {foundOrder.customer.commune}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                <Package className="mx-auto mb-4 text-gray-300" size={48} />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Commande introuvable
                </h3>
                <p className="text-sm text-gray-500">
                  Vérifiez votre numéro de commande ou votre numéro de téléphone.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
