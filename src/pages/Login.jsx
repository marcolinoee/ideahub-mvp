import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Se deu certo, vai para o Dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ideahub-brand flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-ideahub-brand">
            Idea<span className="text-ideahub-accent">Hub</span>
          </h2>
          <p className="text-gray-500 mt-2">Bem-vindo de volta!</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">E-mail</label>
            <input 
              type="email" 
              required
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-ideahub-accent focus:ring-2 focus:ring-green-100 transition-all" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">Senha</label>
            <input 
              type="password" 
              required
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:border-ideahub-accent focus:ring-2 focus:ring-green-100 transition-all" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-ideahub-accent text-ideahub-brand font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          <p className="text-gray-500">
            Não tem conta?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Crie agora
            </Link>
          </p>
          <Link to="/" className="block mt-4 text-gray-400 hover:text-gray-600">
            ← Voltar para o início
          </Link>
        </div>

      </div>
    </div>
  );
}