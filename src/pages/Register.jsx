import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Tenta criar o usuário
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'comunidade' }
      }
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // 2. O PULO DO GATO: Auto-Login imediato
    // Como desligamos a confirmação de email, o usuário já é criado ativo.
    // Vamos fazer o login manual logo em seguida para garantir a sessão.
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      toast.success('Conta criada! Faça login para continuar.');
      navigate('/login');
    } else {
      toast.success(`Bem-vindo, ${fullName}! 🎉`);
      navigate('/dashboard'); // Manda direto pro sistema!
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-ideahub-brand">Junte-se ao IdeaHub</h2>
          <p className="text-gray-500 mt-2">Crie sua conta em segundos</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nome Completo</label>
            <input type="text" required className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ideahub-accent" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">E-mail</label>
            <input type="email" required className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ideahub-accent" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Senha</label>
            <input type="password" required minLength={6} className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ideahub-accent" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button disabled={loading} className="w-full bg-ideahub-brand text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Criando e Entrando...' : 'Começar Agora'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
           <Link to="/login" className="text-blue-600 font-bold hover:underline">Já tenho conta</Link>
        </div>
      </div>
    </div>
  );
}