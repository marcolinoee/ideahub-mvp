import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Register() {
  const navigate = useNavigate();
  
  // Estados para guardar o que o usuário digita
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault(); // Evita que a página recarregue
    setLoading(true);
    setError(null);

    try {
      // 1. Cria o usuário na Autenticação do Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName, // Salvando o nome como metadado
            role: 'comunidade'   // Definindo papel padrão
          }
        }
      });

      if (authError) throw authError;

      // Se deu certo:
      alert('Cadastro realizado! Verifique seu e-mail para confirmar.');
      navigate('/login'); // Manda o usuário para o login

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-ideahub-brand">Crie sua conta</h2>
          <p className="text-gray-500 mt-2">Junte-se ao IdeaHub</p>
        </div>

        {/* Exibe erro se houver */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nome Completo</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-ideahub-accent outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">E-mail</label>
            <input 
              type="email" 
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-ideahub-accent outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Senha</label>
            <input 
              type="password" 
              required
              minLength={6}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-ideahub-accent outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-ideahub-brand text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
           <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Já tenho conta
           </Link>
        </div>
      </div>
    </div>
  );
}