import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Navbar() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="w-full bg-ideahub-brand py-4 px-8 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-white cursor-pointer hover:opacity-80 transition-opacity">
        Idea<span className="text-ideahub-accent">Hub</span>
      </Link>

      <div className="hidden md:flex items-center space-x-6">
        <Link to="/#como-funciona" className="text-gray-300 hover:text-white transition-colors">
          Como funciona
        </Link>

        {session ? (
          // Se logado: Botão para ir ao Dashboard
          <Link 
            to="/dashboard" 
            className="text-white font-medium hover:text-ideahub-accent transition-colors border border-transparent hover:border-ideahub-accent px-4 py-2 rounded-lg"
          >
            Ir para o Painel
          </Link>
        ) : (
          // Se deslogado: Entrar ou Cadastrar
          <>
            <Link to="/login" className="text-white font-medium hover:text-ideahub-accent transition-colors">
              Entrar
            </Link>
            <Link to="/register" className="bg-ideahub-accent text-ideahub-brand px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform shadow-md shadow-green-500/20">
              Cadastre-se
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}