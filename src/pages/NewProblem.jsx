import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast'; // <--- Importamos o Toast

export default function NewProblem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Outros');
  const [severity, setSeverity] = useState('Médio');
  
  const [affected, setAffected] = useState([]);
  const [impact, setImpact] = useState([]);

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const toggleItem = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const getGPS = () => {
    if (!navigator.geolocation) return toast.error('Seu navegador não suporta GPS.');
    
    const toastId = toast.loading('Buscando satélites...'); // Notificação de carregamento

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude
        });
        toast.dismiss(toastId); // Remove o "Carregando"
        toast.success('Localização capturada!');
      },
      () => {
        toast.dismiss(toastId);
        toast.error('Erro ao pegar localização. Verifique as permissões.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Salvando problema...'); // Feedback imediato

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Você precisa estar logado.');

      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('problem-images')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        
        const { data: publicData } = supabase.storage
          .from('problem-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicData.publicUrl;
      }

      const { error: dbError } = await supabase.from('problems').insert({
        user_id: user.id,
        title,
        description,
        category,
        severity,
        affected_scope: affected,
        impact_type: impact,
        latitude: location?.lat,
        longitude: location?.long,
        address_manual: address,
        image_url: imageUrl
      });

      if (dbError) throw dbError;

      toast.dismiss(toastId);
      toast.success('Problema registrado com sucesso! 🎉');
      navigate('/dashboard');

    } catch (error) {
      toast.dismiss(toastId);
      console.error(error);
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-ideahub-brand mb-6">Registrar Problema</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block font-medium text-gray-700">Título do Problema</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-3 rounded-lg mt-1" placeholder="Ex: Buraco na rua X" />
          </div>
          
          <div>
            <label className="block font-medium text-gray-700">O que está acontecendo?</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-3 rounded-lg mt-1" rows="3" placeholder="Descreva os detalhes..." />
          </div>

          {/* Filtros de Categoria (Adicionei para ficar completo conforme wireframe) */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">Categoria</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-3 rounded-lg bg-white">
              {['Saúde', 'Educação', 'Transporte', 'Segurança', 'Trabalho', 'Meio Ambiente', 'Outros'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="block font-bold text-ideahub-brand mb-2">Onde acontece?</label>
            <div className="flex gap-3 mb-3">
              <button type="button" onClick={getGPS} className={`flex-1 py-2 rounded-lg font-medium transition-colors ${location ? 'bg-green-500 text-white' : 'bg-white border text-gray-600'}`}>
                {location ? '📍 GPS Capturado' : '📍 Usar GPS Atual'}
              </button>
            </div>
            <input value={address} onChange={e => setAddress(e.target.value)} className="w-full border p-3 rounded-lg" placeholder="Ou digite o endereço (Rua, Bairro...)" />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">Gravidade</label>
            <div className="flex gap-3">
              {['Leve', 'Médio', 'Grave'].map(nivel => (
                <button key={nivel} type="button"
                  onClick={() => setSeverity(nivel)}
                  className={`flex-1 py-2 rounded-full border transition-colors ${severity === nivel ? 'bg-ideahub-brand text-white' : 'bg-white text-gray-600'}`}
                >
                  {nivel}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">Quem é afetado?</label>
            <div className="flex flex-wrap gap-2">
              {['Eu', 'Minha família', 'Vizinhos', 'Comunidade'].map(item => (
                <button key={item} type="button"
                  onClick={() => toggleItem(item, affected, setAffected)}
                  className={`px-4 py-1 rounded-full border text-sm ${affected.includes(item) ? 'bg-ideahub-accent text-ideahub-brand font-bold' : 'bg-white text-gray-600'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">Foto (Opcional)</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          </div>

          <button disabled={loading} className="w-full bg-ideahub-accent text-ideahub-brand font-bold py-4 rounded-xl text-lg hover:shadow-lg transition-all">
            {loading ? 'Salvando...' : 'Registrar Problema'}
          </button>

        </form>
      </div>
    </div>
  );
}