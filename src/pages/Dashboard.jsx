import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [problems, setProblems] = useState([]);
  const [isModerator, setIsModerator] = useState(false);

  // Estados dos Filtros Visuais
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterSeverity, setFilterSeverity] = useState('Todas');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        setUser(user);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile?.role === 'moderador') setIsModerator(true);

        fetchProblems();
      }
    };
    checkUser();
  }, [navigate]);

  const fetchProblems = async () => {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.log('Erro ao buscar:', error);
    else setProblems(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // --- AQUI ESTÁ A CORREÇÃO (Lógica de Visibilidade) ---
  const filteredProblems = problems.filter(problem => {
    // 1. Filtros de Interface (Busca, Categoria, Gravidade)
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todas' || problem.category === filterCategory;
    const matchesSeverity = filterSeverity === 'Todas' || problem.severity === filterSeverity;

    // 2. REGRA DE VISIBILIDADE (O Pulo do Gato 🐱)
    // O post é público? (Aprovado ou Resolvido)
    const isPublic = problem.status === 'aprovado' || problem.status === 'resolvido';
    
    // Eu sou o dono do post? (Vejo meus pendentes para acompanhar)
    const isOwner = user && problem.user_id === user.id;

    // Decisão Final: Mostra se for Público OU se for Meu
    // (Nota: Moderadores usam o Painel Admin para ver os pendentes dos outros)
    const showProblem = isPublic || isOwner;

    return matchesSearch && matchesCategory && matchesSeverity && showProblem;
  });

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
      {/* Header */}
      <header className="bg-ideahub-brand text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <div className="text-xl font-bold flex items-center gap-2">
          Idea<span className="text-ideahub-accent">Hub</span> 
          <span className="text-xs font-normal text-gray-400 border-l border-gray-600 pl-2 ml-2">Painel</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300 hidden md:inline">Olá, {user.email}</span>
          {isModerator && (
            <Link to="/admin" className="bg-ideahub-accent text-ideahub-brand px-4 py-2 rounded-lg font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(163,230,53,0.4)]">
              🛡️ Admin
            </Link>
          )}
          <button onClick={handleLogout} className="text-sm bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white transition-colors font-bold">
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Visão Geral</h1>
          <Link to="/new-problem" className="bg-ideahub-brand text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
            <span>+</span> Reportar Problema
          </Link>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Pesquisar</label>
            <input 
              type="text" 
              placeholder="Buscar por título ou descrição..." 
              className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-ideahub-accent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Categoria</label>
            <select 
              className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-ideahub-accent outline-none bg-white"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="Todas">Todas</option>
              <option value="Saúde">Saúde</option>
              <option value="Educação">Educação</option>
              <option value="Transporte">Transporte</option>
              <option value="Segurança">Segurança</option>
              <option value="Trabalho">Trabalho</option>
              <option value="Meio Ambiente">Meio Ambiente</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div className="w-full md:w-40">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Gravidade</label>
            <select 
              className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-ideahub-accent outline-none bg-white"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="Todas">Todas</option>
              <option value="Grave">Grave</option>
              <option value="Médio">Médio</option>
              <option value="Leve">Leve</option>
            </select>
          </div>
        </div>

        {/* LISTA FILTRADA */}
        {filteredProblems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-xl font-bold text-gray-800">Nada para mostrar</h2>
            <p className="text-gray-500 mt-2">
               Os posts precisam ser aprovados para aparecerem aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((problem) => (
              <Link to={`/problem/${problem.id}`} key={problem.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col cursor-pointer group">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {problem.image_url ? (
                    <img src={problem.image_url} alt={problem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                      Sem foto
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(problem.severity)}`}>
                    {problem.severity}
                  </span>
                </div>

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
                    <span className={`px-2 py-1 rounded capitalize font-bold ${
                      problem.status === 'resolvido' ? 'bg-green-100 text-green-700' : 
                      problem.status === 'aprovado' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {problem.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}