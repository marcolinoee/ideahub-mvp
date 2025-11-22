import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      icon: "👀",
      title: "1. Identifique",
      desc: "Viu um buraco na rua, falta de iluminação ou outro problema? Tire uma foto e anote o local."
    },
    {
      icon: "📱",
      title: "2. Registre",
      desc: "Use o IdeaHub para reportar o problema. Use o GPS para marcar a localização exata e envie a foto."
    },
    {
      icon: "✅",
      title: "3. Resolva",
      desc: "A comunidade e a prefeitura visualizam o problema. Acompanhe o status até que seja resolvido!"
    }
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-ideahub-accent text-sm font-bold uppercase tracking-wider">Passo a Passo</span>
          <h2 className="text-3xl md:text-4xl font-bold text-ideahub-brand mt-2">Como a plataforma funciona?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:bg-ideahub-accent group-hover:shadow-lg transition-all">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}