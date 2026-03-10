export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;   // ← ancien prix avant promo
  promoLabel?: string;       // ← badge promo ex: "-30%", "Soldes"
  imageUrl: string;
  images?: string[];
  category: string;
  isNew?: boolean;
  stock: number;
}
