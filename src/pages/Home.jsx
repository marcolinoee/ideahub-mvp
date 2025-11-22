import React from 'react';
import Navbar from '../components/Navbar'; // Note os dois pontos ".." para voltar uma pasta
import Hero from '../components/Hero';

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <Hero />
    </div>
  );
}