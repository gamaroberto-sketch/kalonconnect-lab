"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Upload, Calendar, Clock, Users, Globe, Lock, FileText } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import EventCard from '../components/EventCard';
import MarketingAutomation from '../components/MarketingAutomation';
import ModernButton from '../components/ModernButton';
import { useTheme } from '../components/ThemeProvider';

const Events = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [marketingEvent, setMarketingEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [events, setEvents] = useState([
    {
      id: '1',
      name: 'Workshop de Mindfulness',
      description: 'Aprenda técnicas práticas de mindfulness para reduzir estresse e ansiedade.',
      type: 'curso',
      status: 'agendado',
      startDate: '25/01/2024',
      startTime: '19:00',
      banner: null,
      videoLink: 'https://whereby.com/kalon-os-eventos',
      participants: []
    },
    {
      id: '2',
      name: 'Palestra sobre Terapia Breve',
      description: 'Descubra os benefícios e aplicações da terapia breve em contextos terapêuticos.',
      type: 'palestra',
      status: 'passado',
      startDate: '15/01/2024',
      startTime: '14:00',
      banner: null,
      videoLink: '',
      participants: []
    }
  ]);

  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  React.useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Carregar eventos salvos
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    
    // Marcar como carregamento inicial concluído após um pequeno delay
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  React.useEffect(() => {
    // Evitar salvar durante carregamento inicial
    if (isInitialLoad) return;
    
    // Salvar eventos sempre que mudarem
    localStorage.setItem('events', JSON.stringify(events));
  }, [events, isInitialLoad]);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleEditEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (confirm('Tem certeza que deseja deletar este evento?')) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const handleViewReport = (eventId) => {
    alert(`Relatório do evento: ${eventId}`);
  };

  const handleEnterEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      localStorage.setItem('currentEvent', JSON.stringify(event));
      window.location.href = `/event-room?id=${eventId}`;
    }
  };

  const handleMarketing = (eventId) => {
    const event = events.find(e => e.id === eventId);
    setMarketingEvent(event);
    setShowMarketingModal(true);
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'curso',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    videoLink: '',
    format: 'aberto',
    banner: null,
    recurring: false
  });

  // Initialize form when editing
  React.useEffect(() => {
    if (editingEvent) {
      setFormData({
        name: editingEvent.name || '',
        description: editingEvent.description || '',
        type: editingEvent.type || 'curso',
        startDate: editingEvent.startDate || '',
        startTime: editingEvent.startTime || '',
        endDate: '',
        endTime: '',
        videoLink: editingEvent.videoLink || '',
        format: 'aberto',
        banner: editingEvent.banner || null,
        recurring: false
      });
    } else if (!showModal) {
      setFormData({
        name: '',
        description: '',
        type: 'curso',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        videoLink: '',
        format: 'aberto',
        banner: null,
        recurring: false
      });
    }
  }, [editingEvent, showModal]);

  const handleSaveEvent = () => {
    // Basic validation
    if (!formData.name || !formData.startDate || !formData.startTime) {
      alert('Por favor, preencha todos os campos obrigatórios (nome, data e hora).');
      return;
    }

    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now().toString(),
      name: formData.name,
      description: formData.description,
      type: formData.type,
      status: editingEvent ? editingEvent.status : 'agendado',
      startDate: formData.startDate,
      startTime: formData.startTime,
      banner: formData.banner,
      videoLink: formData.videoLink,
      participants: editingEvent ? editingEvent.participants : []
    };

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? newEvent : e));
    } else {
      setEvents([...events, newEvent]);
    }

    setShowModal(false);
    setEditingEvent(null);
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, banner: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ProtectedRoute>
      <div 
        className="min-h-screen transition-colors duration-300"
        style={{
          background: `linear-gradient(135deg, ${themeColors.backgroundSecondary}, ${themeColors.secondaryLight})`
        }}
      >
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <Sidebar 
          activeSection="events"
          setActiveSection={() => {}}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />

        <div className={`relative z-10 transition-all duration-300 pt-28 ${
          sidebarOpen ? 'lg:ml-64' : ''
        }`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Eventos | Cursos | Palestras
              </h1>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ModernButton
                  icon={<Plus className="w-5 h-5" />}
                  onClick={handleCreateEvent}
                  variant="primary"
                  size="lg"
                  className="shadow-lg"
                >
                  Novo Evento
                </ModernButton>
              </motion.div>
            </div>

            {/* Lista de animações */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={() => handleEditEvent(event.id)}
                  onDelete={() => handleDeleteEvent(event.id)}
                  onViewReport={() => handleViewReport(event.id)}
                  onEnter={() => handleEnterEvent(event.id)}
                  onMarketing={() => handleMarketing(event.id)}
                />
              ))}
            </div>

            {events.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Nenhum evento cadastrado. Clique em "Novo Evento" para começar.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ModernButton
                    icon={<Plus className="w-5 h-5" />}
                    onClick={handleCreateEvent}
                    variant="primary"
                    size="lg"
                    className="shadow-lg"
                  >
                    Criar Primeiro Evento
                  </ModernButton>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Criar/Editar Evento */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingEvent ? 'Editar Evento' : 'Criar Novo Evento'}
                </h2>
                <ModernButton
                  icon={<X className="w-6 h-6" />}
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  size="sm"
                />
              </div>

              <div className="p-6 space-y-6">
                {/* Nome do Evento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do Evento *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Workshop de Mindfulness"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o evento..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent"
                  />
                </div>

                {/* Tipo e Formato */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent"
                    >
                      <option value="curso">Curso</option>
                      <option value="palestra">Palestra</option>
                      <option value="workshop">Workshop</option>
                      <option value="webinar">Webinar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Formato
                    </label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent"
                    >
                      <option value="aberto">Aberto</option>
                      <option value="fechado">Fechado</option>
                    </select>
                  </div>
                </div>

                {/* Data e Hora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Hora de Início *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Link de Vídeo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link da Sala de Vídeo (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.videoLink}
                    onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                    placeholder="https://whereby.com/..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Se deixar vazio, será usado o link das Configurações Gerais
                  </p>
                </div>

                {/* Banner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banner/Ícone (opcional)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label
                      htmlFor="banner-upload"
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Banner</span>
                    </label>
                    {formData.banner && (
                      <img src={formData.banner} alt="Preview" className="w-20 h-20 object-cover rounded" />
                    )}
                  </div>
                </div>

                {/* Botões */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <ModernButton
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    size="md"
                    className="flex-1"
                  >
                    Cancelar
                  </ModernButton>
                  <ModernButton
                    onClick={handleSaveEvent}
                    variant="primary"
                    size="md"
                    className="flex-1"
                  >
                    {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
                  </ModernButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Marketing Automation */}
        {showMarketingModal && marketingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Marketing Automation
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {marketingEvent.name}
                  </p>
                </div>
                <ModernButton
                  icon={<X className="w-6 h-6" />}
                  onClick={() => setShowMarketingModal(false)}
                  variant="outline"
                  size="sm"
                />
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                <MarketingAutomation event={marketingEvent} />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Events;

