import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast'; // <--- Importamos o Toast

export default function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('comunidade');

  useEffect(() => {
    fetchProblemData();
  }, [id]);

  const fetchProblemData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile) setUserRole(profile.role);
    }

    const { data: problemData, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      toast.error('Problema não encontrado.');
      navigate('/dashboard');
    } else {
      setProblem(problemData);
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus) => {
    const { error } = await supabase
      .from('problems')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar status.');
    } else {
      setProblem({ ...problem, status: newStatus });
      toast.success(`Status alterado para: ${newStatus.toUpperCase()}`);
    }
  };

  const handleDelete = async () => {
    // Para exclusão, o 'confirm' nativo ainda é mais seguro que um toast simples
    const confirm = window.confirm("⚠️ Tem certeza que deseja EXCLUIR este problema?");
    if (!confirm) return;

    const toastId = toast.loading('Excluindo...');

    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('id', id);

    if (error) {
      toast.dismiss(toastId);
      toast.error('Erro ao excluir: ' + error.message);
    } else {
      toast.dismiss(toastId);
      toast.success('Problema excluído.');
      navigate('/dashboard');
    }
  };

  const isOwner = currentUser && problem && currentUser.id === problem.user_id;
  const isModerator = userRole === 'moderador';
  const canDelete = isOwner || isModerator;

  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!problem) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-500 hover:text-ideahub-brand font-medium">
              ← Voltar
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400 text-xs">ID: {id.slice(0, 8)}</span>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            problem.status === 'aprovado' ? 'bg-green-100 text-green-700' :
            problem.status === 'rejeitado' ? 'bg-red-100 text-red-700' :
            problem.status === 'resolvido' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {problem.status}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 mt-6">

        {isModerator && (
          <div className="bg-ideahub-brand text-white p-6 rounded-xl shadow-lg mb-8 border-l-4 border-ideahub-accent">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              🛡️ Painel do Moderador
            </h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => updateStatus('aprovado')} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold transition-colors">
                ✅ Aprovar
              </button>
              <button onClick={() => updateStatus('rejeitado')} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold transition-colors">
                🚫 Rejeitar
              </button>
              <button onClick={() => updateStatus('pendente')} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold transition-colors">
                ⏳ Pendente
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo Principal (Mantendo a estrutura visual anterior) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                {problem.category}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{problem.title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">{problem.description}</p>
            
            <div className="mt-6 flex gap-4 text-sm text-gray-500">
               <span><strong>Gravidade:</strong> {problem.severity}</span>
               <span><strong>Afeta:</strong> {problem.affected_scope?.join(', ')}</span>
            </div>
          </div>

          {problem.image_url && (
            <div className="w-full bg-gray-100 border-t border-gray-100">
              <img src={problem.image_url} alt="Problema" className="w-full max-h-[500px] object-contain mx-auto" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">📍 Localização</h3>
            {problem.latitude ? (
              <div className="rounded-xl overflow-hidden border border-gray-200 h-64">
                <iframe 
                  width="100%" height="100%" frameBorder="0" scrolling="no" 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${problem.longitude-0.005},${problem.latitude-0.005},${problem.longitude+0.005},${problem.latitude+0.005}&layer=mapnik&marker=${problem.latitude},${problem.longitude}`}
                ></iframe>
              </div>
            ) : (
               <div className="text-gray-400 bg-gray-50 h-32 flex items-center justify-center rounded-lg">Sem GPS</div>
            )}
            {problem.address_manual && <p className="mt-2 text-gray-600">{problem.address_manual}</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Gerenciar</h3>
              {problem.status !== 'resolvido' ? (
                <button 
                  onClick={() => updateStatus('resolvido')}
                  className="w-full bg-ideahub-accent text-ideahub-brand font-bold py-3 rounded-lg hover:brightness-90 transition-all"
                >
                  ✅ Marcar Resolvido
                </button>
              ) : (
                 <div className="text-center text-green-600 font-bold p-2 bg-green-50 rounded-lg">🎉 Problema Resolvido!</div>
              )}
            </div>

            {canDelete && (
              <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6">
                <h3 className="font-bold text-red-800 mb-2">Zona de Perigo</h3>
                <button onClick={handleDelete} className="w-full border-2 border-red-200 text-red-600 font-bold py-2 rounded-lg hover:bg-red-100 transition-all">
                  🗑️ Excluir Problema
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}