import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function CommentsSection({ problemId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [problemId]);

  const fetchComments = async () => {
    // Busca comentários e QUEM comentou (join com profiles)
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(full_name, role)')
      .eq('problem_id', problemId)
      .order('created_at', { ascending: true });

    if (error) console.error(error);
    else setComments(data || []);
    setLoading(false);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const toastId = toast.loading('Enviando...');

    const { error } = await supabase
      .from('comments')
      .insert({
        problem_id: problemId,
        user_id: currentUser.id,
        content: newComment
      });

    if (error) {
      toast.dismiss(toastId);
      toast.error('Erro ao comentar.');
    } else {
      setNewComment('');
      await fetchComments(); // Atualiza a lista
      toast.dismiss(toastId);
      toast.success('Comentário enviado!');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Apagar comentário?')) return;
    
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) {
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Apagado.');
    }
  };

  if (loading) return <p className="text-gray-400 text-sm">Carregando comentários...</p>;

  return (
    <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        💬 Comentários ({comments.length})
      </h3>

      {/* Lista de Comentários */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-gray-500 text-sm italic">Seja o primeiro a comentar.</p>
        )}
        
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <span className={`font-bold text-sm mr-2 ${comment.profiles?.role === 'moderador' ? 'text-ideahub-brand' : 'text-gray-700'}`}>
                  {comment.profiles?.full_name || 'Usuário'}
                  {comment.profiles?.role === 'moderador' && ' 🛡️'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString()} às {new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              
              {/* Botão de excluir (Só para dono ou moderador) */}
              {(currentUser.id === comment.user_id) && (
                <button onClick={() => handleDelete(comment.id)} className="text-xs text-red-400 hover:text-red-600">
                  Excluir
                </button>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-1">{comment.content}</p>
          </div>
        ))}
      </div>

      {/* Formulário */}
      <form onSubmit={handlePostComment} className="flex gap-2">
        <input 
          type="text" 
          placeholder="Adicione um comentário..." 
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-ideahub-accent"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button 
          disabled={!newComment.trim()}
          className="bg-ideahub-brand text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}