import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [problems, setProblems] = useState([]); // <--- Estado para guardar os problemas

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        setUser(user);
        fetchProblems(user.id); // <--- Busca problemas assim que logar
      }
    };
    getUser();
  }, [navigate]);

  // Função que vai no Supabase buscar os problemas
  const fetchProblems = async (userId) => {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false }); // Mais recentes primeiro
    
    if (error) console.log('Erro ao buscar:', error);
    else setProblems(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Funçãozinha para escolher a cor da "badge" de gravidade
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Grave': return 'bg-red-100 text-red-800 border-red-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (!user) return <div className="p-10 text-center">Carregando sistema...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-ideahub-brand text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <div className="text-xl font-bold">
          Idea<span className="text-ideahub-accent">Hub</span> Painel
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300 hidden md:inline">Olá, {user.email}</span>
          <button 
            onClick={handleLogout}
            className="text-sm bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white transition-colors font-bold"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        {/* Cabeçalho da Área Principal */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Visão Geral</h1>
          <Link 
            to="/new-problem" 
            className="bg-ideahub-accent text-ideahub-brand px-6 py-3 rounded-lg font-bold hover:brightness-90 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <span>+</span> Reportar Problema
          </Link>
        </div>

        {/* Grid de Cards */}
        {problems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800">Tudo limpo por aqui!</h2>
            <p className="text-gray-500 mt-2">Nenhum problema foi reportado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem) => (
              <div key={problem.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
                
                {/* Imagem do Card */}
                <div className="h-48 bg-gray-100 relative">
                  {problem.image_url ? (
                    <img src={problem.image_url} alt={problem.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                      Sem foto
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(problem.severity)}`}>
                    {problem.severity}
                  </span>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-xs font-bold text-ideahub-brand uppercase tracking-wide mb-1 opacity-60">
                    {problem.category}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                    {problem.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                    {problem.description}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(problem.created_at).toLocaleDateString()}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600 capitalize">
                      {problem.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}