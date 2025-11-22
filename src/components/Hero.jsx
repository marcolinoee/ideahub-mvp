import React from 'react';

export default function Hero() {
  return (
    <section className="w-full bg-ideahub-light min-h-[80vh] flex flex-col md:flex-row items-center justify-between px-8 py-16 md:px-20">
      
      {/* Lado Esquerdo: Texto */}
      <div className="flex-1 max-w-xl space-y-6">
        <span className="text-ideahub-brand font-bold tracking-wider uppercase text-sm bg-blue-100 px-3 py-1 rounded-full">
          Ideias na Prática
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-ideahub-brand leading-tight">
          Transforme problemas em <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-ideahub-brand">soluções reais.</span>
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Conectamos os desafios da sua comunidade com o potencial de inovação da universidade. Registre um problema, inspire um projeto.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button className="bg-ideahub-brand text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all shadow-xl">
            Registrar Problema
          </button>
          <button className="border-2 border-ideahub-brand text-ideahub-brand px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all">
            Ver Projetos
          </button>
        </div>
      </div>

      {/* Lado Direito: "Imagem" (Por enquanto um Placeholder) */}
      <div className="flex-1 mt-10 md:mt-0 flex justify-center relative">
        {/* Círculo decorativo verde atrás */}
        <div className="absolute top-0 right-10 w-72 h-72 bg-ideahub-accent rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        
        {/* Caixa simulando a imagem da ilustração */}
        <div className="relative bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 max-w-sm rotate-3 hover:rotate-0 transition-transform duration-500">
           <div className="h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400">
             (Ilustração aqui)
           </div>
           <div className="space-y-3">
             <div className="h-4 bg-gray-200 rounded w-3/4"></div>
             <div className="h-4 bg-gray-200 rounded w-1/2"></div>
           </div>
        </div>
      </div>

    </section>
  );
}