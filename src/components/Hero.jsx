import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Importante para navegação
import { supabase } from '../supabaseClient';

export default function Hero() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <section className="w-full bg-ideahub-light min-h-[85vh] flex flex-col md:flex-row items-center justify-between px-6 py-12 md:px-20 relative overflow-hidden">
      
      {/* Background Decorativo (Opcional) */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent opacity-50 pointer-events-none"></div>

      {/* Lado Esquerdo: Texto */}
      <div className="flex-1 max-w-2xl space-y-8 z-10">
        <div className="inline-block">
          <span className="text-ideahub-brand font-bold tracking-wider uppercase text-xs bg-white border border-blue-100 px-4 py-2 rounded-full shadow-sm">
            🚀 Ideias na Prática
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-ideahub-brand leading-tight">
          Transforme problemas em <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-ideahub-brand">soluções reais.</span>
        </h1>
        
        <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-lg">
          Conectamos os desafios da sua comunidade com o potencial de inovação da universidade. Registre um problema, inspire um projeto.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          {/* Botão Inteligente: Leva para Login ou Novo Problema dependendo do status */}
          <Link 
            to={session ? "/new-problem" : "/login"} 
            className="bg-ideahub-brand text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all text-center"
          >
            Registrar Problema
          </Link>
          
          <Link 
            to="/dashboard" 
            className="bg-white border-2 border-ideahub-brand text-ideahub-brand px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all text-center"
          >
            Ver Projetos
          </Link>
        </div>
      </div>

      {/* Lado Direito: Ilustração (Placeholder melhorado) */}
      <div className="flex-1 mt-12 md:mt-0 flex justify-center relative z-10">
        <div className="relative w-full max-w-md">
            {/* Círculo Animado atrás */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-ideahub-accent rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            
            {/* Card Flutuante */}
            <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-4 border-b pb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-40 bg-blue-50 rounded-lg flex items-center justify-center">
                        <span className="text-4xl">🗺️</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    <div className="flex gap-2 mt-4">
                        <div className="px-3 py-1 bg-green-100 rounded-full text-xs text-green-700 font-bold">Segurança</div>
                        <div className="px-3 py-1 bg-red-100 rounded-full text-xs text-red-700 font-bold">Grave</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

    </section>
  );
}