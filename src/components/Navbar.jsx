import React from 'react';
import { Link } from 'react-router-dom'; // Importamos o Link

export default function Navbar() {
  return (
    <nav className="w-full bg-ideahub-brand py-4 px-8 flex justify-between items-center shadow-lg">
      {/* Logo -> Leva para a Home */}
      <Link to="/" className="text-2xl font-bold text-white cursor-pointer">
        Idea<span className="text-ideahub-accent">Hub</span>
      </Link>

      <div className="hidden md:flex items-center space-x-6">
        <a href="#como-funciona" className="text-gray-300 hover:text-ideahub-accent transition-colors">
          Como funciona
        </a>
        
        {/* Botão Entrar -> Leva para /login */}
        <Link to="/login" className="text-white font-medium hover:text-ideahub-accent transition-colors">
          Entrar
        </Link>
        
        {/* Botão Cadastro -> Leva para /register */}
        <Link to="/register" className="bg-ideahub-accent text-ideahub-brand px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform shadow-md shadow-green-500/20">
          Cadastre-se
        </Link>
      </div>
    </nav>
  );
}