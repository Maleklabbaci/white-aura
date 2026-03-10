export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images?: string[];
  category: string;
  isNew?: boolean;
  stock: number;
}
