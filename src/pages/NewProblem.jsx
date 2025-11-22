import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function NewProblem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Dados do Formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Outros');
  const [severity, setSeverity] = useState('Médio');
  
  // Arrays para múltipla escolha
  const [affected, setAffected] = useState([]);
  const [impact, setImpact] = useState([]);

  // Localização e Imagem
  const [location, setLocation] = useState(null); // { lat, long }
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Funções Auxiliares
  const toggleItem = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const getGPS = () => {
    if (!navigator.geolocation) return alert('Seu navegador não suporta GPS.');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude
        });
        alert('Localização capturada com sucesso!');
      },
      () => alert('Erro ao pegar localização. Verifique as permissões.')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Pegar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Você precisa estar logado.');

      let imageUrl = null;

      // 2. Upload da Imagem (se houver)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('problem-images')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        
        // Pegar URL pública
        const { data: publicData } = supabase.storage
          .from('problem-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicData.publicUrl;
      }

      // 3. Salvar no Banco
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

      alert('Problema registrado com sucesso!');
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-ideahub-brand mb-6">Registrar Problema</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Título e Descrição */}
          <div>
            <label className="block font-medium text-gray-700">Título do Problema</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-3 rounded-lg mt-1" placeholder="Ex: Buraco na rua X" />
          </div>
          
          <div>
            <label className="block font-medium text-gray-700">O que está acontecendo?</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-3 rounded-lg mt-1" rows="3" placeholder="Descreva os detalhes..." />
          </div>

          {/* Localização (GPS vs Manual) */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="block font-bold text-ideahub-brand mb-2">Onde acontece?</label>
            <div className="flex gap-3 mb-3">
              <button type="button" onClick={getGPS} className={`flex-1 py-2 rounded-lg font-medium transition-colors ${location ? 'bg-green-500 text-white' : 'bg-white border text-gray-600'}`}>
                {location ? '📍 GPS Capturado' : '📍 Usar GPS Atual'}
              </button>
            </div>
            <input value={address} onChange={e => setAddress(e.target.value)} className="w-full border p-3 rounded-lg" placeholder="Ou digite o endereço (Rua, Bairro...)" />
          </div>

          {/* Gravidade (Seleção Única) */}
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

          {/* Quem é afetado? (Múltipla Escolha) */}
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

          {/* Upload de Foto */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">Foto (Opcional)</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          </div>

          {/* Botão Enviar */}
          <button disabled={loading} className="w-full bg-ideahub-accent text-ideahub-brand font-bold py-4 rounded-xl text-lg hover:shadow-lg transition-all">
            {loading ? 'Enviando...' : 'Registrar Problema'}
          </button>

        </form>
      </div>
    </div>
  );
}