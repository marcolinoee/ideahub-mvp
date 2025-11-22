import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); 

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    checkPermissionAndFetchData();
  }, []);

  const checkPermissionAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'moderador') {
      alert('⛔ ACESSO NEGADO: Área restrita a moderadores.');
      return navigate('/dashboard');
    }

    fetchProblems();
  };

  const fetchProblems = async () => {
    // AGORA BUSCAMOS TAMBÉM OS DADOS DO PERFIL (Nome e Email)
    const { data, error } = await supabase
      .from('problems')
      .select('*, profiles(full_name, email)') 
      .order('created_at', { ascending: false });
    
    if (error) console.error(error);
    else setProblems(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('problems').update({ status: newStatus }).eq('id', id);
    if (error) alert('Erro ao atualizar.');
    else setProblems(problems.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  // --- FUNÇÃO NOVA: EXPORTAR PARA CSV ---
  const exportToCSV = () => {
    if (problems.length === 0) return alert("Sem dados para exportar.");

    // Cabeçalho do CSV
    const headers = ["ID,Data,Título,Categoria,Gravidade,Status,Autor,Email,Latitude,Longitude"];

    // Linhas do CSV
    const rows = problems.map(p => {
      // Tratamento para evitar que vírgulas no texto quebrem o CSV
      const cleanTitle = `"${p.title.replace(/"/g, '""')}"`; 
      const cleanAuthor = p.profiles?.full_name ? `"${p.profiles.full_name}"` : "Anônimo";
      const cleanEmail = p.profiles?.email ? `"${p.profiles.email}"` : "N/A";
      const date = new Date(p.created_at).toLocaleDateString();

      return `${p.id},${date},${cleanTitle},${p.category},${p.severity},${p.status},${cleanAuthor},${cleanEmail},${p.latitude || ''},${p.longitude || ''}`;
    });

    const csvContent = [headers, ...rows].join("\n");
    
    // Criar e baixar o arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_ideahub_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- DADOS PARA GRÁFICOS ---
  const categoryData = problems.reduce((acc, curr) => {
    const found = acc.find(item => item.name === curr.category);
    if (found) found.value++;
    else acc.push({ name: curr.category, value: 1 });
    return acc;
  }, []);

  const statusData = [
    { name: 'Pendente', valor: problems.filter(p => p.status === 'pendente').length },
    { name: 'Aprovado', valor: problems.filter(p => p.status === 'aprovado').length },
    { name: 'Resolvido', valor: problems.filter(p => p.status === 'resolvido').length },
    { name: 'Rejeitado', valor: problems.filter(p => p.status === 'rejeitado').length },
  ];

  const pendingProblems = problems.filter(p => p.status === 'pendente');

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-ideahub-brand text-white shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <h1 className="text-xl font-bold tracking-wide">Painel Administrativo</h1>
            </div>
            <div className="flex gap-4">
              {/* BOTÃO DE EXPORTAR */}
              <button 
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors"
              >
                📥 Baixar CSV
              </button>
              <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-300 hover:text-white border border-gray-500 px-3 py-1 rounded hover:border-white transition-colors">
                Voltar ao Site
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <div className="flex space-x-4 mb-8 border-b border-gray-300 pb-1">
          <button onClick={() => setActiveTab('dashboard')} className={`pb-2 px-4 font-bold transition-colors ${activeTab === 'dashboard' ? 'text-ideahub-brand border-b-4 border-ideahub-accent' : 'text-gray-400 hover:text-gray-600'}`}>
            📊 Indicadores
          </button>
          <button onClick={() => setActiveTab('moderation')} className={`pb-2 px-4 font-bold transition-colors ${activeTab === 'moderation' ? 'text-ideahub-brand border-b-4 border-ideahub-accent' : 'text-gray-400 hover:text-gray-600'}`}>
            ⚖️ Moderação Pendente ({pendingProblems.length})
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <p className="text-gray-500 text-sm font-bold uppercase">Total Registros</p>
                <p className="text-3xl font-bold text-gray-800">{problems.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                <p className="text-gray-500 text-sm font-bold uppercase">Pendentes</p>
                <p className="text-3xl font-bold text-gray-800">{pendingProblems.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <p className="text-gray-500 text-sm font-bold uppercase">Resolvidos</p>
                <p className="text-3xl font-bold text-gray-800">{problems.filter(p => p.status === 'resolvido').length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <p className="text-gray-500 text-sm font-bold uppercase">Engajamento</p>
                <p className="text-3xl font-bold text-gray-800">
                  {/* Simulação simples de engajamento */}
                  {problems.length > 0 ? Math.round(problems.length * 1.5) : 0} <span className="text-sm text-gray-400 font-normal">ações</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm h-96">
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

              <div className="bg-white p-6 rounded-xl shadow-sm h-96">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Distribuição por Categoria</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                      {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingProblems.map((problem) => (
                    <tr key={problem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(problem.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold">
                        {problem.profiles?.full_name || 'Anônimo'}
                        <div className="text-xs text-gray-400 font-normal">{problem.profiles?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <button onClick={() => navigate(`/problem/${problem.id}`)} className="hover:text-blue-600 hover:underline text-left">
                          {problem.title}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => updateStatus(problem.id, 'aprovado')} className="text-green-600 hover:text-green-900 mr-4 font-bold">Aprovar</button>
                        <button onClick={() => updateStatus(problem.id, 'rejeitado')} className="text-red-600 hover:text-red-900 font-bold">Rejeitar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}