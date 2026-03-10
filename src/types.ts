export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  promoLabel?: string;
  imageUrl: string;
  images?: string[];
  category: string;
  isNew?: boolean;
  stock: number;
}
