import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks'; // <--- Importamos aqui

export default function Home() {
  return (
    <div className="min-h-screen font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <HowItWorks /> {/* <--- Adicionamos aqui */}
      </main>

      {/* Footer Simples */}
      <footer className="bg-ideahub-brand text-white py-8 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p className="opacity-70 text-sm">
            © 2025 IdeaHub - Conectando comunidade e soluções.
          </p>
        </div>
      </footer>
    </div>
  );
}