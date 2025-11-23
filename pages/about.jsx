"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Users, ShieldCheck, Target, Lightbulb, Heart } from 'lucide-react';
import InfoCard from '../components/InfoCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Header 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl font-bold mb-6">Sobre o Kalon OS</h1>
            <p className="text-xl text-white/90">
              Transformamos a gestão de saúde mental com tecnologia, empatia e excelência.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <InfoCard
              icon={<Rocket className="w-8 h-8" />}
              title="Nossa Missão"
              description="Facilitar a gestão profissional de terapias e eventos, conectando profissionais e pacientes de forma segura e eficiente."
              color="blue"
            />
            <InfoCard
              icon={<Target className="w-8 h-8" />}
              title="Nossa Visão"
              description="Ser a plataforma líder em gestão de saúde mental, reconhecida por inovação e impacto positivo na sociedade."
              color="purple"
            />
            <InfoCard
              icon={<Heart className="w-8 h-8" />}
              title="Nossos Valores"
              description="Empatia, segurança, inovação, qualidade e compromisso com o bem-estar mental de todos."
              color="pink"
            />
          </div>

          {/* Nossa Equipe */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Nossa Equipe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <InfoCard
                icon={<Users className="w-8 h-8" />}
                title="Desenvolvedores"
                description="Time especializado em criar soluções tecnológicas inovadoras."
                color="green"
              />
              <InfoCard
                icon={<Lightbulb className="w-8 h-8" />}
                title="Designers"
                description="Profissionais focados em experiência do usuário e acessibilidade."
                color="orange"
              />
              <InfoCard
                icon={<ShieldCheck className="w-8 h-8" />}
                title="Segurança"
                description="Especialistas em proteção de dados e privacidade."
                color="blue"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl mb-8 text-white/90">
            Experimente o Kalon OS e transforme sua gestão de consultas.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center space-x-2">
              <span>Começar Agora</span>
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors">
              Saber Mais
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

