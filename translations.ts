import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import ProductGrid from '../components/ProductGrid';
import Features from '../components/Features';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-gold-200 selection:text-gray-900">
      <Header />
      <main>
        <Hero />
        <Features />
        <About />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
}
