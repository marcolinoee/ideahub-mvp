import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import CommentsSection from '../components/CommentsSection';

export default function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('comunidade');

  // Estados dos Likes
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // ESTADOS DO MODAL DE SOLUÇÃO
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [solutionDesc, setSolutionDesc] = useState('');
  const [solutionLink, setSolutionLink] = useState('');
  const [solutionFile, setSolutionFile] = useState(null);
  const [submittingSolution, setSubmittingSolution] = useState(false);

  useEffect(() => {
    fetchProblemData();
  }, [id]);

  const fetchProblemData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile) setUserRole(profile.role);

      const { data: likeData } = await supabase.from('likes').select('id').eq('problem_id', id).eq('user_id', user.id).single();
      if (likeData) setHasLiked(true);
    }

    const { count } = await supabase.from('likes').select('id', { count: 'exact' }).eq('problem_id', id);
    setLikesCount(count || 0);

    const { data: problemData, error } = await supabase.from('problems').select('*').eq('id', id).single();
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
      const { error } = await supabase.from('likes').delete().eq('problem_id', id).eq('user_id', currentUser.id);
      if (!error) { setHasLiked(false); setLikesCount(prev => prev - 1); }
    } else {
      const { error } = await supabase.from('likes').insert({ problem_id: id, user_id: currentUser.id });
      if (!error) { setHasLiked(true); setLikesCount(prev => prev + 1); toast.success('Apoiado! 👍'); }
    }
  };

  const handleShare = async () => {
    const shareData = { title: `IdeaHub: ${problem.title}`, text: `Ajude a resolver: ${problem.title}`, url: window.location.href };
    if (navigator.share) { try { await navigator.share(shareData); } catch (err) {} } 
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copiado! 📋'); }
  };

  // --- FUNÇÃO NOVA: ENVIAR SOLUÇÃO ---
  const submitSolution = async (e) => {
    e.preventDefault();
    setSubmittingSolution(true);
    const toastId = toast.loading('Registrando solução...');

    try {
      let solutionImageUrl = null;

      // Upload da foto de solução (se houver)
      if (solutionFile) {
        const fileExt = solutionFile.name.split('.').pop();
        const fileName = `solution_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('problem-images').upload(fileName, solutionFile);
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from('problem-images').getPublicUrl(fileName);
        solutionImageUrl = publicData.publicUrl;
      }

      // Atualiza o problema
      const { error } = await supabase.from('problems').update({
        status: 'resolvido',
        solution_description: solutionDesc,
        solution_link: solutionLink,
        solution_image: solutionImageUrl
      }).eq('id', id);

      if (error) throw error;

      toast.dismiss(toastId);
      toast.success('Problema resolvido com sucesso! 🎉');
      setProblem({ ...problem, status: 'resolvido', solution_description: solutionDesc, solution_image: solutionImageUrl, solution_link: solutionLink });
      setShowResolveModal(false);

    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Erro ao salvar solução.');
      console.error(error);
    } finally {
      setSubmittingSolution(false);
    }
  };

  // Funções Admin Simples
  const updateStatusSimple = async (newStatus) => {
    const { error } = await supabase.from('problems').update({ status: newStatus }).eq('id', id);
    if (!error) { setProblem({ ...problem, status: newStatus }); toast.success(`Status: ${newStatus}`); }
  };
  
  const handleDelete = async () => {
    if(!window.confirm("EXCLUIR este problema?")) return;
    const { error } = await supabase.from('problems').delete().eq('id', id);
    if (!error) { toast.success('Excluído.'); navigate('/dashboard'); }
  };

  const isModerator = userRole === 'moderador';
  const isOwner = currentUser && problem && currentUser.id === problem.user_id;
  
  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!problem) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      
      {/* --- MODAL DE SOLUÇÃO --- */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ Registrar Solução</h2>
            <form onSubmit={submitSolution} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">O que foi feito?</label>
                <textarea required className="w-full border p-2 rounded" rows="3" value={solutionDesc} onChange={e => setSolutionDesc(e.target.value)} placeholder="Descreva como o problema foi resolvido..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Link do Projeto (Opcional)</label>
                <input type="url" className="w-full border p-2 rounded" value={solutionLink} onChange={e => setSolutionLink(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Foto do "Depois" (Opcional)</label>
                <input type="file" accept="image/*" onChange={e => setSolutionFile(e.target.files[0])} className="w-full text-sm text-gray-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowResolveModal(false)} className="flex-1 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button disabled={submittingSolution} className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">
                  {submittingSolution ? 'Salvando...' : 'Concluir Solução'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-gray-500 hover:text-ideahub-brand font-medium">← Voltar</Link>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            problem.status === 'resolvido' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>{problem.status}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 mt-6">
        
        {/* Painel Admin */}
        {isModerator && (
          <div className="bg-ideahub-brand text-white p-6 rounded-xl shadow-lg mb-8 border-l-4 border-ideahub-accent">
            <h3 className="font-bold mb-4">🛡️ Moderação</h3>
            <div className="flex gap-3">
              <button onClick={() => updateStatusSimple('aprovado')} className="bg-blue-600 px-4 py-2 rounded font-bold">Aprovar</button>
              <button onClick={() => updateStatusSimple('rejeitado')} className="bg-red-600 px-4 py-2 rounded font-bold">Rejeitar</button>
            </div>
          </div>
        )}

        {/* --- ÁREA DE SOLUÇÃO (SÓ APARECE SE RESOLVIDO) --- */}
        {problem.status === 'resolvido' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎉</span>
              <h2 className="text-2xl font-bold text-green-800">Problema Resolvido!</h2>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm mb-6">
              <h4 className="font-bold text-gray-700 mb-2">Relatório de Solução:</h4>
              <p className="text-gray-600 leading-relaxed">{problem.solution_description}</p>
              {problem.solution_link && (
                <a href={problem.solution_link} target="_blank" className="text-blue-600 font-bold hover:underline block mt-2 text-sm">
                  🔗 Ver documentação do projeto
                </a>
              )}
            </div>

            {/* Comparativo Antes/Depois */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Antes</span>
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                  {problem.image_url ? (
                    <img src={problem.image_url} className="w-full h-full object-cover" alt="Antes" />
                  ) : <div className="w-full h-full flex items-center justify-center text-gray-400">Sem foto</div>}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-green-600 uppercase">Depois (Solução)</span>
                <div className="aspect-video bg-green-100 rounded-lg overflow-hidden border-2 border-green-200 shadow-sm relative">
                  {problem.solution_image ? (
                    <img src={problem.solution_image} className="w-full h-full object-cover" alt="Depois" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-green-700 font-bold bg-green-50">
                      ✅ Resolvido
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detalhes do Problema (Original) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex justify-between mb-4">
              <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">{problem.category}</span>
              <div className="flex gap-2">
                <button onClick={handleShare} className="px-3 py-1 bg-gray-50 rounded-full border">📤</button>
                <button onClick={handleToggleLike} className={`px-4 py-1 rounded-full border font-bold ${hasLiked ? 'bg-ideahub-accent' : 'bg-white'}`}>
                  {hasLiked ? '👍 Apoiado' : '🤍 Apoiar'} <span className="text-sm font-normal ml-1">{likesCount}</span>
                </button>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{problem.title}</h1>
            <p className="text-lg text-gray-600">{problem.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Mapa */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-64">
              <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://www.openstreetmap.org/export/embed.html?bbox=${problem.longitude-0.005},${problem.latitude-0.005},${problem.longitude+0.005},${problem.latitude+0.005}&layer=mapnik&marker=${problem.latitude},${problem.longitude}`}></iframe>
            </div>
            {currentUser && <CommentsSection problemId={id} currentUser={currentUser} />}
          </div>

          <div className="flex flex-col gap-4">
            {/* Botão de Ação Principal */}
            {problem.status !== 'resolvido' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4">Gerenciar</h3>
                <button 
                  onClick={() => setShowResolveModal(true)} 
                  className="w-full bg-ideahub-accent text-ideahub-brand font-bold py-3 rounded-lg hover:brightness-90 shadow-lg transition-all"
                >
                  ✅ Registrar Solução
                </button>
              </div>
            )}
            {(isOwner || isModerator) && (
              <button onClick={handleDelete} className="w-full border-2 border-red-200 text-red-600 font-bold py-2 rounded-lg bg-red-50">🗑️ Excluir</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}