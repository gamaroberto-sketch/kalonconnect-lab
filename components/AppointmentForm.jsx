"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Phone, 
  MapPin, 
  Save, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const AppointmentForm = ({ 
  isOpen, 
  onClose, 
  appointment = null, 
  onSave,
  userType = 'professional',
  professionals = [],
  clients = []
}) => {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'online',
    status: 'pending',
    professionalId: '',
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (appointment) {
      setFormData({
        id: appointment.id || '',
        title: appointment.title || '',
        description: appointment.description || '',
        date: appointment.date || '',
        time: appointment.time || '',
        duration: appointment.duration || 60,
        type: appointment.type || 'online',
        status: appointment.status || 'pending',
        professionalId: appointment.professionalId || '',
        clientId: appointment.clientId || '',
        clientName: appointment.clientName || '',
        clientEmail: appointment.clientEmail || '',
        clientPhone: appointment.clientPhone || '',
        notes: appointment.notes || ''
      });
    } else {
      // Reset form for new appointment
      setFormData({
        id: '',
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        type: 'online',
        status: 'pending',
        professionalId: '',
        clientId: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        notes: ''
      });
    }
  }, [appointment, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!formData.time) {
      newErrors.time = 'Horário é obrigatório';
    }

    if (!formData.duration || formData.duration < 15) {
      newErrors.duration = 'Duração deve ser pelo menos 15 minutos';
    }

    if (userType === 'professional' && !formData.clientName.trim()) {
      newErrors.clientName = 'Nome do cliente é obrigatório';
    }

    if (userType === 'client' && !formData.professionalId) {
      newErrors.professionalId = 'Profissional é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    } finally {
      setSaving(false);
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

  const timeSlots = [];
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="kalon-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: themeColors.primaryLight + '20' }}
                >
                  <Calendar 
                    className="w-6 h-6" 
                    style={{ color: themeColors.primary }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {userType === 'professional' ? 'Agendar sessão para cliente' : 'Agendar sua sessão'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título da Sessão *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`kalon-input ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="Ex: Sessão de Terapia Vibracional"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Sessão *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'online', label: 'Online', icon: <Video className="w-4 h-4" /> },
                      { type: 'phone', label: 'Telefone', icon: <Phone className="w-4 h-4" /> },
                      { type: 'presencial', label: 'Presencial', icon: <MapPin className="w-4 h-4" /> }
                    ].map((option) => (
                      <motion.button
                        key={option.type}
                        onClick={() => handleInputChange('type', option.type)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.type === option.type
                            ? 'border-gray-200 dark:border-gray-700'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                        style={formData.type === option.type ? {
                          borderColor: themeColors.primary,
                          backgroundColor: themeColors.primary,
                          color: 'white',
                          fontWeight: 'bold'
                        } : {}}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          {option.icon}
                          <span className="text-xs font-medium">{option.label}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`kalon-input ${errors.date ? 'border-red-500' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horário *
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className={`kalon-input ${errors.time ? 'border-red-500' : ''}`}
                  >
                    <option value="">Selecione o horário</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.time && (
                    <p className="text-red-500 text-xs mt-1">{errors.time}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duração (min) *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    className={`kalon-input ${errors.duration ? 'border-red-500' : ''}`}
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1h 30min</option>
                    <option value={120}>2 horas</option>
                    <option value={180}>3 horas</option>
                  </select>
                  {errors.duration && (
                    <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
                  )}
                </div>
              </div>

              {/* Cliente/Profissional */}
              {userType === 'professional' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange('clientName', e.target.value)}
                      className={`kalon-input ${errors.clientName ? 'border-red-500' : ''}`}
                      placeholder="Nome completo do cliente"
                    />
                    {errors.clientName && (
                      <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email do Cliente
                    </label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      className="kalon-input"
                      placeholder="cliente@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefone do Cliente
                    </label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      className="kalon-input"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profissional *
                  </label>
                  <select
                    value={formData.professionalId}
                    onChange={(e) => handleInputChange('professionalId', e.target.value)}
                    className={`kalon-input ${errors.professionalId ? 'border-red-500' : ''}`}
                  >
                    <option value="">Selecione o profissional</option>
                    {professionals.map(professional => (
                      <option key={professional.id} value={professional.id}>
                        {professional.name} - {professional.specialty}
                      </option>
                    ))}
                  </select>
                  {errors.professionalId && (
                    <p className="text-red-500 text-xs mt-1">{errors.professionalId}</p>
                  )}
                </div>
              )}

              {/* Descrição e Observações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="kalon-input"
                    rows="3"
                    placeholder="Descrição da sessão..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="kalon-input"
                    rows="3"
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>

              {/* Status (apenas para profissionais) */}
              {userType === 'professional' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { status: 'pending', label: 'Pendente', color: 'yellow' },
                      { status: 'confirmed', label: 'Confirmado', color: 'green' },
                      { status: 'cancelled', label: 'Cancelado', color: 'red' }
                    ].map((option) => (
                      <motion.button
                        key={option.status}
                        onClick={() => handleInputChange('status', option.status)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.status === option.status
                            ? 'border-gray-200 dark:border-gray-700'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                        style={formData.status === option.status ? {
                          borderColor: option.status === 'confirmed' ? themeColors.success : 
                                       option.status === 'pending' ? themeColors.warning : 
                                       themeColors.error,
                          backgroundColor: option.status === 'confirmed' ? themeColors.success : 
                                          option.status === 'pending' ? themeColors.warning : 
                                          themeColors.error,
                          color: 'white',
                          fontWeight: 'bold'
                        } : {}}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-center">
                          <div className="font-medium">{option.label}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-3 mt-8">
              <motion.button
                onClick={onClose}
                className="kalon-button-secondary flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200"
                style={{
                  backgroundColor: themeColors.primary,
                  color: 'white',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.target.style.backgroundColor = themeColors.primaryDark;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.target.style.backgroundColor = themeColors.primary;
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {appointment ? 'Atualizar' : 'Agendar'}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentForm;






