import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import CommentsSection from '../components/CommentsSection'; // <--- Importamos o componente novo

export default function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('comunidade');

  // Estado dos Likes
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

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

      // Verifica se eu dei like
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('problem_id', id)
        .eq('user_id', user.id)
        .single();
      
      if (likeData) setHasLiked(true);
    }

    // Conta total de likes
    const { count } = await supabase
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('problem_id', id);
    
    setLikesCount(count || 0);

    // Pega dados do problema
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

  const handleToggleLike = async () => {
    if (!currentUser) return toast.error('Faça login para apoiar.');

    if (hasLiked) {
      // Remover Like
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('problem_id', id)
        .eq('user_id', currentUser.id);
      
      if (!error) {
        setHasLiked(false);
        setLikesCount(prev => prev - 1);
      }
    } else {
      // Adicionar Like
      const { error } = await supabase
        .from('likes')
        .insert({ problem_id: id, user_id: currentUser.id });
      
      if (!error) {
        setHasLiked(true);
        setLikesCount(prev => prev + 1);
        toast.success('Você apoiou este problema! 👍');
      }
    }
  };

  const updateStatus = async (newStatus) => {
    const { error } = await supabase.from('problems').update({ status: newStatus }).eq('id', id);
    if (error) toast.error('Erro ao atualizar.');
    else {
      setProblem({ ...problem, status: newStatus });
      toast.success(`Status: ${newStatus}`);
    }
  };

  const handleDelete = async () => {
    if(!window.confirm("EXCLUIR este problema?")) return;
    const { error } = await supabase.from('problems').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Excluído.');
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
      {/* Header e Navegação (Igual anterior) */}
      <div className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-500 hover:text-ideahub-brand font-medium">← Voltar</Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400 text-xs">ID: {id.slice(0, 8)}</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            problem.status === 'aprovado' ? 'bg-green-100 text-green-700' :
            problem.status === 'rejeitado' ? 'bg-red-100 text-red-700' :
            problem.status === 'resolvido' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
          }`}>{problem.status}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 mt-6">
        
        {/* Painel Admin (Se for moderador) */}
        {isModerator && (
          <div className="bg-ideahub-brand text-white p-6 rounded-xl shadow-lg mb-8 border-l-4 border-ideahub-accent">
            <h3 className="font-bold mb-4">🛡️ Moderação</h3>
            <div className="flex gap-3">
              <button onClick={() => updateStatus('aprovado')} className="bg-green-600 px-4 py-2 rounded font-bold">✅ Aprovar</button>
              <button onClick={() => updateStatus('rejeitado')} className="bg-red-600 px-4 py-2 rounded font-bold">🚫 Rejeitar</button>
            </div>
          </div>
        )}

        {/* Cartão Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                {problem.category}
              </span>
              
              {/* BOTÃO DE LIKE/APOIAR */}
              <button 
                onClick={handleToggleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all border ${
                  hasLiked 
                    ? 'bg-ideahub-accent text-ideahub-brand border-ideahub-accent' 
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{hasLiked ? '👍 Apoiado' : '🤍 Apoiar'}</span>
                <span className="bg-white/50 px-2 rounded text-sm">{likesCount}</span>
              </button>
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

        {/* Grid: Mapa + Comentários + Ações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Coluna Principal (Mapa + Comentários) */}
          <div className="md:col-span-2 space-y-6">
            {/* Mapa */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4">📍 Localização</h3>
              {problem.latitude ? (
                <div className="rounded-xl overflow-hidden border border-gray-200 h-64">
                  <iframe width="100%" height="100%" frameBorder="0" scrolling="no" 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${problem.longitude-0.005},${problem.latitude-0.005},${problem.longitude+0.005},${problem.latitude+0.005}&layer=mapnik&marker=${problem.latitude},${problem.longitude}`}
                  ></iframe>
                </div>
              ) : (<div className="text-gray-400 bg-gray-50 h-32 flex items-center justify-center rounded-lg">Sem GPS</div>)}
            </div>

            {/* SEÇÃO DE COMENTÁRIOS (NOVA) */}
            {currentUser && <CommentsSection problemId={id} currentUser={currentUser} />}
          </div>

          {/* Coluna Lateral (Ações) */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Gerenciar</h3>
              {problem.status !== 'resolvido' ? (
                <button onClick={() => updateStatus('resolvido')} className="w-full bg-ideahub-accent text-ideahub-brand font-bold py-3 rounded-lg hover:brightness-90 transition-all">
                  ✅ Marcar Resolvido
                </button>
              ) : (
                 <div className="text-center text-green-600 font-bold p-2 bg-green-50 rounded-lg">🎉 Resolvido!</div>
              )}
            </div>

            {canDelete && (
              <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6">
                <button onClick={handleDelete} className="w-full border-2 border-red-200 text-red-600 font-bold py-2 rounded-lg hover:bg-red-100 transition-all">
                  🗑️ Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
