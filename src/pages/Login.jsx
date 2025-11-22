import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error('E-mail ou senha incorretos.');
    else navigate('/dashboard');
  };

  // Função genérica para login social
  const handleSocialLogin = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
    });
    if (error) {
      toast.error(`Erro ao conectar com ${provider}`);
      setLoading(false);
    }
    // O Supabase redireciona automaticamente, não precisa de navigate aqui
  };

  return (
    <div className="min-h-screen bg-ideahub-brand flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-ideahub-brand">Idea<span className="text-ideahub-accent">Hub</span></h2>
          <p className="text-gray-500 mt-2">Bem-vindo de volta!</p>
        </div>

        {/* Botões de Login Social */}
        <div className="space-y-3 mb-6">
          <button 
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-all"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Continuar com Google
          </button>
          
          {/* Exemplo com Github (que é fácil de configurar para devs) */}
          <button 
            onClick={() => handleSocialLogin('github')}
            className="w-full flex items-center justify-center gap-3 bg-[#24292F] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all"
          >
            <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5 filter invert" alt="Github" />
            Continuar com GitHub
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">ou entre com e-mail</span></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">E-mail</label>
            <input 
              type="email" required className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ideahub-accent" 
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Senha</label>
            <input 
              type="password" required className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ideahub-accent" 
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button disabled={loading} className="w-full bg-ideahub-brand text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          <p className="text-gray-500">Não tem conta? <Link to="/register" className="text-blue-600 font-bold hover:underline">Crie agora</Link></p>
          <Link to="/" className="block mt-4 text-gray-400 hover:text-gray-600">← Voltar para o início</Link>
        </div>

      </div>
    </div>
  );
}