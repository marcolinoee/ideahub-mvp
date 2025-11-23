import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error('E-mail ou senha incorretos.');
    else navigate('/dashboard');
  };

  const handleSocialLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) toast.error(`Erro: ${error.message}`);
  };

  // Login via Link Mágico (Sem Senha)
  const handleMagicLink = async () => {
    if (!email) return toast.error('Digite seu e-mail primeiro.');
    setMagicLinkLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setMagicLinkLoading(false);
    if (error) toast.error(error.message);
    else toast.success('Link de acesso enviado para seu e-mail! 📧');
  };

  return (
    <div className="min-h-screen bg-ideahub-brand flex items-center justify-center p-4">
      {/* Background sutil */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-ideahub-brand mb-1">
            Idea<span className="text-ideahub-accent">Hub</span>
          </h1>
          <p className="text-gray-500">Acesse sua conta</p>
        </div>

        {/* Botão Google (O mais fácil) */}
        <button 
          onClick={() => handleSocialLogin('google')}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all mb-6"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Entrar com Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">ou use seu e-mail</span></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">E-mail</label>
            <input 
              type="email" required 
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:border-ideahub-accent focus:bg-white transition-all" 
              placeholder="seu@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1 ml-1">
              <label className="block text-sm font-bold text-gray-700">Senha</label>
              {/* Botão de Magic Link como alternativa de "Esqueci a senha" */}
              <button type="button" onClick={handleMagicLink} disabled={magicLinkLoading} className="text-xs text-blue-600 hover:underline">
                {magicLinkLoading ? 'Enviando...' : 'Entrar sem senha?'}
              </button>
            </div>
            <input 
              type="password" required 
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:border-ideahub-accent focus:bg-white transition-all" 
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button disabled={loading} className="w-full bg-ideahub-brand text-white font-bold py-4 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-70">
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Novo por aqui?{' '}
            <Link to="/register" className="text-ideahub-brand font-bold hover:underline">
              Crie sua conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}