"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Video,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../components/AuthContext';
import ModernButton from '../components/ModernButton';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';
import { useClients } from '../hooks/useClients';

export default function ClientRegistration() {
  const { user, userType } = useAuth();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredLanguage: 'pt-BR'
  });

  useEffect(() => {
    setMounted(true);
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingClient) {
      // Editar cliente existente
      await updateClient(editingClient.id, formData);
    } else {
      // Adicionar novo cliente
      await addClient(formData);
    }
    setShowForm(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', preferredLanguage: 'pt-BR' });
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      preferredLanguage: client.preferredLanguage
    });
    setShowForm(true);
  };

  const handleDelete = async (clientId) => {
    if (confirm(t('common.confirmDelete') || 'Tem certeza que deseja excluir?')) {
      await deleteClient(clientId);
    }
  };

  const handleConsultation = (client) => {
    window.location.href = '/consultations';
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${themeColors.primary} transparent transparent transparent` }}
          ></div>
          <p className="text-gray-600">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

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
          activeSection="client-registration"
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
                style={{
                  backgroundColor: themeColors.background || 'rgba(255, 255, 255, 0.8)'
                }}
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
                      <User className="w-8 h-8" style={{ color: 'white' }} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {t('clients.title')}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t('clients.description')}
                      </p>
                    </div>
                  </div>

                  <ModernButton
                    icon={<Plus className="w-5 h-5" />}
                    onClick={() => setShowForm(true)}
                    variant="primary"
                    size="lg"
                  >
                    {t('clients.newClient')}
                  </ModernButton>
                </div>
              </motion.div>

              {/* Lista de Clientes */}
              <motion.div
                className="kalon-card p-6"
                style={{
                  backgroundColor: themeColors.background || 'rgba(255, 255, 255, 0.8)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  {t('clients.clientList')} ({clients.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clients.map((client) => (
                    <motion.div
                      key={client.id}
                      className="rounded-lg p-6 border hover:shadow-lg transition-all duration-300"
                      style={{
                        backgroundColor: themeColors.background || 'white',
                        borderColor: themeColors.border || themeColors.primary + '40'
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: themeColors.primary
                            }}
                          >
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              {client.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {client.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <ModernButton
                            icon={<Edit className="w-4 h-4" />}
                            onClick={() => handleEdit(client)}
                            variant="secondary"
                            size="sm"
                          />
                          <ModernButton
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleDelete(client.id)}
                            variant="secondary"
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{t('clients.registeredOn')} {new Date(client.registrationDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{t('clients.lastSession')}: {client.lastSession}</span>
                        </div>
                      </div>

                      <ModernButton
                        icon={<Video className="w-4 h-4" />}
                        onClick={() => handleConsultation(client)}
                        variant="primary"
                        size="lg"
                        className="w-full justify-center"
                      >
                        {t('clients.goToConsultation')}
                      </ModernButton>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Formulário de Cliente */}
              {showForm && (
                <motion.div
                  className="kalon-card p-6"
                  style={{
                    backgroundColor: themeColors.background || 'rgba(255, 255, 255, 0.8)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {editingClient ? t('clients.editClient') : t('clients.newClient')}
                    </h2>
                    <ModernButton
                      icon={<X className="w-4 h-4" />}
                      onClick={() => {
                        setShowForm(false);
                        setEditingClient(null);
                        setFormData({ name: '', email: '', phone: '', preferredLanguage: 'pt-BR' });
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('common.name')}
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-800 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('common.email')}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-800 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('common.phone')}
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-800 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('common.preferredLanguage')}
                        </label>
                        <select
                          value={formData.preferredLanguage}
                          onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        >
                          <option value="pt-BR">{t('common.portugueseBR')}</option>
                          <option value="es">{t('common.spanish')}</option>
                          <option value="en">{t('common.english')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <ModernButton
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingClient(null);
                          setFormData({ name: '', email: '', phone: '', preferredLanguage: 'pt-BR' });
                        }}
                        variant="outline"
                        size="lg"
                      >
                        {t('common.cancel')}
                      </ModernButton>
                      <ModernButton
                        type="submit"
                        variant="primary"
                        size="lg"
                      >
                        {editingClient ? t('common.update') : t('common.register')}
                      </ModernButton>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}



