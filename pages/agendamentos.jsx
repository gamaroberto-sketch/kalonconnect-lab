"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Video,
  Phone,
  MapPin,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Download,
  Send
} from 'lucide-react';
import Calendar from '../components/Calendar';
import AppointmentForm from '../components/AppointmentForm';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../components/AuthContext';
import ModernButton from '../components/ModernButton';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';
import { useAppointments } from '../hooks/useAppointments';
import HelpButton from '../components/HelpButton';
import HelpModal from '../components/HelpModal';

import { helpSections } from '../lib/helpContent';
import { useFeedback } from '../contexts/FeedbackContext';

const Agendamentos = () => {
  const { user, userType } = useAuth();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t, language } = useTranslation();
  const { showFeedback } = useFeedback();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { appointments, loading, addAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'list'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Dados mockados para demonstração
  const mockAppointments = [
    {
      id: '1',
      title: 'Sessão de Terapia Vibracional',
      description: 'Sessão focada em equilíbrio energético',
      date: '2024-01-15',
      time: '14:00',
      duration: 60,
      type: 'online',
      status: 'confirmed',
      professionalId: '1',
      professionalName: 'Maria Silva',
      clientId: '2',
      clientName: 'Roberto Santos',
      clientEmail: 'roberto@email.com',
      clientPhone: '+55 11 98888-8888',
      notes: 'Cliente relatou ansiedade recente'
    },
    {
      id: '2',
      title: 'Consulta de Biofrequências',
      description: 'Aplicação de frequências específicas',
      date: '2024-01-16',
      time: '10:00',
      duration: 90,
      type: 'presencial',
      status: 'pending',
      professionalId: '1',
      professionalName: 'Maria Silva',
      clientId: '3',
      clientName: 'Ana Costa',
      clientEmail: 'ana@email.com',
      clientPhone: '+55 11 97777-7777',
      notes: 'Primeira sessão'
    },
    {
      id: '3',
      title: 'Sessão de Relaxamento',
      description: 'Técnicas de respiração e meditação',
      date: '2024-01-17',
      time: '16:00',
      duration: 45,
      type: 'phone',
      status: 'confirmed',
      professionalId: '1',
      professionalName: 'Maria Silva',
      clientId: '4',
      clientName: 'Carlos Lima',
      clientEmail: 'carlos@email.com',
      clientPhone: '+55 11 96666-6666',
      notes: 'Sessão de acompanhamento'
    }
  ];

  const mockProfessionals = [
    {
      id: '1',
      name: 'Maria Silva',
      specialty: 'Terapeuta Vibracional',
      email: 'maria@kalon.com'
    },
    {
      id: '2',
      name: 'João Santos',
      specialty: 'Biofrequências',
      email: 'joao@kalon.com'
    }
  ];

  useEffect(() => {
    // Aplicar filtros
    let filtered = appointments;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, filterStatus, searchTerm]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleSaveAppointment = async (formData) => {
    if (selectedAppointment) {
      // Editar agendamento existente
      await updateAppointment(selectedAppointment.id, formData);
    } else {
      // Novo agendamento
      await addAppointment(formData);
    }

    setShowAppointmentForm(false);
    setSelectedAppointment(null);

    // Feedback Emocional Positivo
    if (!selectedAppointment) {
      showFeedback({
        title: t('feedback.consultationScheduled.title'),
        message: t('feedback.consultationScheduled.message'),
        type: 'success',
        cta: {
          label: t('feedback.consultationScheduled.cta'),
          action: () => window.location.href = '/consultations'
        }
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (confirm(t('appointments.confirmDelete'))) {
      await deleteAppointment(appointmentId);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    await updateAppointment(appointmentId, { status: newStatus });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return {
          backgroundColor: themeColors.success + '20',
          color: themeColors.success
        };
      case 'pending':
        return {
          backgroundColor: themeColors.warning + '20',
          color: themeColors.warning
        };
      case 'cancelled':
        return {
          backgroundColor: themeColors.error + '20',
          color: themeColors.error
        };
      default:
        return {
          backgroundColor: themeColors.textSecondary + '20',
          color: themeColors.textSecondary
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'online': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'presencial': return <MapPin className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Map internal language codes to standard locale strings if necessary
    const localeMap = {
      'pt-BR': 'pt-BR',
      'en-US': 'en-US',
      'es-ES': 'es-ES',
      'fr-FR': 'fr-FR'
    };
    const locale = localeMap[language] || 'pt-BR';

    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time.substring(0, 5);
  };

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: themeColors.secondary || themeColors.secondaryLight || '#f0f9f9'
        }}
      >
        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Sidebar */}
        <Sidebar
          activeSection="agendamentos"
          setActiveSection={() => { }}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />

        {/* Main Content */}
        <div className={`relative z-10 min-h-screen transition-all duration-300 pt-28 ${sidebarOpen ? 'lg:ml-64' : ''
          }`}>
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <motion.div
                className="kalon-card p-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: themeColors.primary }}
                    >
                      <CalendarIcon className="w-8 h-8" style={{ color: 'white' }} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {t('appointments.title')}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        {userType === 'professional'
                          ? t('appointments.manageSessions')
                          : t('appointments.viewAppointments')
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <ModernButton
                      icon={viewMode === 'calendar' ? <Filter className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                      onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
                      variant="secondary"
                      size="md"
                    >
                      {viewMode === 'calendar' ? t('common.list') : t('common.calendar')}
                    </ModernButton>

                    <ModernButton
                      icon={<Plus className="w-5 h-5" />}
                      onClick={handleAddAppointment}
                      variant="primary"
                      size="md"
                    >
                      {t('appointments.newAppointment')}
                    </ModernButton>
                  </div>
                </div>
              </motion.div>

              {/* Filtros e Busca */}
              <motion.div
                className="kalon-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Busca */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('appointments.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="kalon-input pl-10"
                      />
                    </div>
                  </div>

                  {/* Filtro de Status */}
                  <div className="flex space-x-2">
                    {[
                      { value: 'all', label: t('common.all') },
                      { value: 'pending', label: t('appointments.status.pending') },
                      { value: 'confirmed', label: t('appointments.status.confirmed') },
                      { value: 'cancelled', label: t('appointments.status.cancelled') }
                    ].map((filter) => (
                      <ModernButton
                        key={filter.value}
                        onClick={() => setFilterStatus(filter.value)}
                        variant={filterStatus === filter.value ? "primary" : "outline"}
                        size="sm"
                      >
                        {filter.label}
                      </ModernButton>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Conteúdo Principal */}
              {viewMode === 'calendar' ? (
                <Calendar
                  appointments={filteredAppointments}
                  onDateSelect={handleDateSelect}
                  onAppointmentClick={handleAppointmentClick}
                  onAddAppointment={handleAddAppointment}
                  userType={userType}
                  selectedDate={selectedDate}
                />
              ) : (
                <motion.div
                  className="kalon-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    {t('appointments.listTitle')}
                  </h2>

                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: themeColors.primary }}
                            >
                              <div style={{ color: 'white' }}>
                                {getTypeIcon(appointment.type)}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold text-gray-800 dark:text-white">
                                {appointment.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(appointment.date)} às {formatTime(appointment.time)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                {appointment.duration} min • {appointment.type}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div
                              className="px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1"
                              style={getStatusColor(appointment.status)}
                            >
                              {getStatusIcon(appointment.status)}
                              <span className="capitalize">{t(`appointments.status.${appointment.status}`)}</span>
                            </div>

                            <div className="flex space-x-2">
                              <ModernButton
                                icon={<Video className="w-4 h-4" />}
                                onClick={() => window.location.href = '/consultations'}
                                variant="success"
                                size="sm"
                                title="Ir para Consulta"
                              />

                              <ModernButton
                                icon={<Edit className="w-4 h-4" />}
                                onClick={() => handleEditAppointment(appointment)}
                                variant="secondary"
                                size="sm"
                              />

                              <ModernButton
                                icon={<Trash2 className="w-4 h-4" />}
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                variant="danger"
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {filteredAppointments.length === 0 && (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('appointments.noAppointments')}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Agendamento */}
        <AppointmentForm
          isOpen={showAppointmentForm}
          onClose={() => {
            setShowAppointmentForm(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSave={handleSaveAppointment}
          userType={userType}
          professionals={mockProfessionals}
        />
      </div>
      {/* Help Button */}
      <HelpButton onClick={() => setShowHelp(true)} />

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        section={helpSections.agendamentos}
      />
    </ProtectedRoute>
  );
};

export default Agendamentos;


