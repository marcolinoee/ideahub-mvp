import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  
  // Estado para troca de senha (opcional)
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return navigate('/login');
      setUser(user);

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error && error.status !== 406) throw error;

      if (data) {
        setFullName(data.full_name);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUpdating(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Pega a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('Foto carregada! Clique em Salvar para confirmar.');
    } catch (error) {
      toast.error('Erro no upload: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // 1. Atualiza dados do perfil (Nome e Foto)
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      });

      if (error) throw error;

      // 2. Atualiza senha (se o usuário digitou algo)
      if (newPassword) {
        const { error: passError } = await supabase.auth.updateUser({ password: newPassword });
        if (passError) throw passError;
        toast.success('Senha atualizada!');
      }

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-ideahub-brand">Voltar ao Painel</button>
        </div>

        <form onSubmit={updateProfile} className="space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-sm" />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400">👤</div>
              )}
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-ideahub-brand text-white p-2 rounded-full cursor-pointer hover:bg-opacity-90 shadow-md">
                📷
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                onChange={uploadAvatar} 
                className="hidden" 
                disabled={updating}
              />
            </div>
            <p className="text-xs text-gray-500">Clique na câmera para alterar</p>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ideahub-accent focus:border-ideahub-accent sm:text-sm"
            />
          </div>

          {/* Email (Apenas Leitura) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input 
              type="text" 
              value={user.email} 
              disabled 
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500 sm:text-sm cursor-not-allowed"
            />
          </div>

          {/* Nova Senha */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700">Nova Senha (Opcional)</label>
            <input 
              type="password" 
              placeholder="Deixe em branco para manter a atual"
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ideahub-accent focus:border-ideahub-accent sm:text-sm"
            />
          </div>

          <button 
            type="submit" 
            disabled={updating}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ideahub-brand hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ideahub-accent transition-colors"
          >
            {updating ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}