import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  availability?: 'in stock' | 'out of stock';
}

export default function SEO({
  title = 'White Aura - Cosmétiques Premium Algérie',
  description = 'Découvrez White Aura, votre destination pour les cosmétiques premium en Algérie. Sérums, crèmes, masques et soins de luxe avec livraison à domicile dans toutes les wilayas.',
  image = 'https://white-aura.vercel.app/og-image.jpg',
  type = 'website',
  price,
  availability
}: SEOProps) {
  const location = useLocation();
  const url = `https://white-aura.vercel.app${location.pathname}`;

  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta tags
    const metaTags: Array<[string, string, string]> = [
      ['name', 'description', description],
      ['name', 'keywords', 'cosmétiques algérie, white aura, sérums, crèmes, soins visage, beauté algérie, cosmétiques premium'],
      ['name', 'author', 'White Aura'],
      ['name', 'robots', 'index, follow'],
      
      // Open Graph
      ['property', 'og:type', type],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:image', image],
      ['property', 'og:url', url],
      ['property', 'og:site_name', 'White Aura'],
      ['property', 'og:locale', 'fr_DZ'],
      
      // Twitter Card
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', image],
      
      // Mobile
      ['name', 'viewport', 'width=device-width, initial-scale=1, maximum-scale=5'],
      ['name', 'theme-color', '#D4AF37'],
      ['name', 'apple-mobile-web-app-capable', 'yes'],
      ['name', 'apple-mobile-web-app-status-bar-style', 'black-translucent'],
    ];

    // Product specific meta tags
    if (type === 'product' && price) {
      metaTags.push(
        ['property', 'product:price:amount', String(price)],
        ['property', 'product:price:currency', 'DZD'],
        ['property', 'product:availability', availability || 'in stock']
      );
    }

    // Remove old tags
    document.querySelectorAll('meta[data-seo]').forEach(el => el.remove());

    // Add new tags
    metaTags.forEach(([attr, key, value]) => {
      const meta = document.createElement('meta');
      meta.setAttribute(attr, key);
      meta.setAttribute('content', value);
      meta.setAttribute('data-seo', 'true');
      document.head.appendChild(meta);
    });

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

  }, [title, description, image, type, price, availability, url]);

  return null;
}

// ══════════════════════════════════════════════════
// JSON-LD SCHEMA FOR PRODUCTS
// ══════════════════════════════════════════════════
export function ProductSchema({ product }: { product: any }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.imageUrl,
    "brand": {
      "@type": "Brand",
      "name": "White Aura"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "DZD",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `https://white-aura.vercel.app/product/${product.id}`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ══════════════════════════════════════════════════
// ORGANIZATION SCHEMA
// ══════════════════════════════════════════════════
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "White Aura",
    "url": "https://white-aura.vercel.app",
    "logo": "https://white-aura.vercel.app/logo.png",
    "description": "Cosmétiques premium en Algérie",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "DZ",
      "addressLocality": "Algérie"
    },
    "sameAs": [
      "https://facebook.com/whiteaura",
      "https://instagram.com/whiteaura"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
