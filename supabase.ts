import { Product } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Sérum Éclat Or',
    description: 'Un sérum illuminateur infusé de particules d\'or pour un teint radieux.',
    price: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615397323712-4267438e8869?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Soin du visage',
    isNew: true,
    stock: 15,
  },
  {
    id: '2',
    name: 'Crème de Nuit Régénérante',
    description: 'Crème riche et soyeuse qui répare la peau pendant votre sommeil.',
    price: 4500,
    originalPrice: 6500,
    promoLabel: '-30%',
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Soin du visage',
    stock: 0,
  },
  {
    id: '3',
    name: 'Huile Précieuse Corps',
    description: 'Huile sèche nourrissante au parfum envoûtant et fini satiné.',
    price: 2800,
    originalPrice: 3500,
    promoLabel: '-20%',
    imageUrl: 'https://images.unsplash.com/photo-1615397323712-4267438e8869?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1615397323712-4267438e8869?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Soin du corps',
    stock: 8,
  },
  {
    id: '4',
    name: 'Essence Florale',
    description: 'Lotion tonique hydratante aux extraits de rose et de jasmin.',
    price: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Nettoyant',
    stock: 20,
  }
];
