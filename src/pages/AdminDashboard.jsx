import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' ou 'moderation'

  // Cores para os gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    checkPermissionAndFetchData();
  }, []);

  const checkPermissionAndFetchData = async () => {
    // 1. Verifica se é moderador
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'moderador') {
      alert('Acesso negado. Área restrita a moderadores.');
      return navigate('/dashboard');
    }

    // 2. Busca TODOS os problemas para gerar estatísticas
    fetchProblems();
  };

  const fetchProblems = async () => {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error(error);
    else setProblems(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('problems')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Erro ao atualizar.');
    } else {
      // Atualiza a lista localmente
      setProblems(problems.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  // --- PREPARAÇÃO DE DADOS PARA GRÁFICOS ---
  
  // 1. Contagem por Categoria
  const categoryData = problems.reduce((acc, curr) => {
    const found = acc.find(item => item.name === curr.category);
    if (found) found.value++;
    else acc.push({ name: curr.category, value: 1 });
    return acc;
  }, []);

  // 2. Contagem por Status
  const statusData = [
    { name: 'Pendente', valor: problems.filter(p => p.status === 'pendente').length },
    { name: 'Aprovado', valor: problems.filter(p => p.status === 'aprovado').length },
    { name: 'Resolvido', valor: problems.filter(p => p.status === 'resolvido').length },
    { name: 'Rejeitado', valor: problems.filter(p => p.status === 'rejeitado').length },
  ];

  // Filtra apenas os pendentes para a aba de moderação
  const pendingProblems = problems.filter(p => p.status === 'pendente');

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Carregando painel administrativo...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Admin */}
      <header className="bg-ideahub-brand text-white shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <h1 className="text-xl font-bold tracking-wide">Painel Administrativo</h1>
            </div>
            <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-300 hover:text-white">
              Voltar ao Site
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        
        {/* Navegação de Abas */}
        <div className="flex space-x-4 mb-8 border-b border-gray-300 pb-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`pb-2 px-4 font-bold transition-colors ${activeTab === 'dashboard' ? 'text-ideahub-brand border-b-4 border-ideahub-accent' : 'text-gray-400 hover:text-gray-600'}`}
          >
            📊 Indicadores
          </button>
          <button 
            onClick={() => setActiveTab('moderation')}
            className={`pb-2 px-4 font-bold transition-colors ${activeTab === 'moderation' ? 'text-ideahub-brand border-b-4 border-ideahub-accent' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ⚖️ Moderação Pendente ({pendingProblems.length})
          </button>
        </div>

        {/* --- CONTEÚDO DA ABA DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <p className="text-gray-500 text-sm font-bold uppercase">Total Registros</p>
                <p className="text-3xl font-bold text-gray-800">{problems.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                <p className="text-gray-500 text-sm font-bold uppercase">Pendentes</p>
                <p className="text-3xl font-bold text-gray-800">{problems.filter(p => p.status === 'pendente').length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <p className="text-gray-500 text-sm font-bold uppercase">Resolvidos</p>
                <p className="text-3xl font-bold text-gray-800">{problems.filter(p => p.status === 'resolvido').length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <p className="text-gray-500 text-sm font-bold uppercase">Taxa de Resolução</p>
                <p className="text-3xl font-bold text-gray-800">
                  {problems.length > 0 ? Math.round((problems.filter(p => p.status === 'resolvido').length / problems.length) * 100) : 0}%
                </p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Gráfico de Status */}
              <div className="bg-white p-6 rounded-xl shadow-sm h-80">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Status dos Problemas</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="valor" fill="#0B1120" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Categorias */}
              <div className="bg-white p-6 rounded-xl shadow-sm h-80">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Distribuição por Categoria</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%" cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* --- CONTEÚDO DA ABA MODERAÇÃO --- */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gravidade</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingProblems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                        Nenhum problema pendente de aprovação. 🎉
                      </td>
                    </tr>
                  ) : (
                    pendingProblems.map((problem) => (
                      <tr key={problem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(problem.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <button onClick={() => navigate(`/problem/${problem.id}`)} className="hover:text-blue-600 hover:underline text-left">
                            {problem.title}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {problem.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            problem.severity === 'Grave' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {problem.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => updateStatus(problem.id, 'aprovado')}
                            className="text-green-600 hover:text-green-900 mr-4 font-bold"
                          >
                            Aprovar
                          </button>
                          <button 
                            onClick={() => updateStatus(problem.id, 'rejeitado')}
                            className="text-red-600 hover:text-red-900 font-bold"
                          >
                            Rejeitar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}