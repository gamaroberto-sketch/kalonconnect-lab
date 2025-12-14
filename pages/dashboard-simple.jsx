"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Sparkles,
  User,
  LogOut,
  Calendar,
  Video,
  FileText,
  Radio,
  Users,
  Briefcase,
  DollarSign,
  Settings
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'next/router';

export default function DashboardSimple() {
  const { user, userType, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNovaConsulta = () => {
    router.push('/consultations');
  };

  const handleAgendamentos = () => {
    router.push('/agendamentos');
  };

  const handleConsultas = () => {
    router.push('/consultations');
  };

  const handleHome = () => {
    router.push('/home');
  };

  const handleManageTestUsers = () => {
    router.push('/admin/test-users');
  };

  const isAdmin = user?.email === 'bobgama@uol.com.br';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Heart className="w-8 h-8 text-pink-500" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 brand">KalonConnect</h1>
                <p className="text-sm text-gray-600">Sistema de Consciência Integrada</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <motion.h2
            className="text-3xl font-bold text-gray-800 mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            🌅 Bem-vindo(a), {user?.name}!
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            O sol da manhã desperta novas possibilidades.
          </motion.p>
        </div>

        {/* Ações Rápidas */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-6 max-w-6xl mx-auto`}>
          <motion.button
            onClick={handleHome}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-pink-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-pink-100 rounded-xl">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Início</div>
                <div className="text-sm text-gray-500">Página inicial</div>
              </div>
            </div>
          </motion.button>
          {/* 1. Perfil */}
          <motion.button
            onClick={() => router.push('/profile')}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-pink-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-pink-100 rounded-xl">
                <Briefcase className="w-6 h-6 text-pink-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Perfil</div>
                <div className="text-sm text-gray-500">Seus dados</div>
              </div>
            </div>
          </motion.button>

          {/* 2. Pacientes */}
          <motion.button
            onClick={() => router.push('/client-registration')}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Pacientes</div>
                <div className="text-sm text-gray-500">Gerenciar clientes</div>
              </div>
            </div>
          </motion.button>

          {/* 3. Consultas */}
          <motion.button
            onClick={handleConsultas}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Consultas</div>
                <div className="text-sm text-gray-500">Sessões de vídeo</div>
              </div>
            </div>
          </motion.button>

          {/* 4. Agendamentos */}
          <motion.button
            onClick={handleAgendamentos}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Agendamentos</div>
                <div className="text-sm text-gray-500">Ver calendário</div>
              </div>
            </div>
          </motion.button>

          {/* 5. Eventos */}
          <motion.button
            onClick={() => router.push('/events')}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Eventos</div>
                <div className="text-sm text-gray-500">Workshops e aulas</div>
              </div>
            </div>
          </motion.button>

          {/* 6. Documentos */}
          <motion.button
            onClick={() => router.push('/documents')}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-yellow-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Documentos</div>
                <div className="text-sm text-gray-500">Arquivos e contratos</div>
              </div>
            </div>
          </motion.button>

          {/* 7. Financeiro */}
          <motion.button
            onClick={() => router.push('/financial')}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-emerald-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Financeiro</div>
                <div className="text-sm text-gray-500">Gestão financeira</div>
              </div>
            </div>
          </motion.button>

          {/* 8. Configurações */}
          <motion.button
            onClick={() => router.push('/settings')}
            className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gray-200"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">Configurações</div>
                <div className="text-sm text-gray-500">Ajustes do sistema</div>
              </div>
            </div>
          </motion.button>

          {isAdmin && (
            <motion.button
              onClick={handleManageTestUsers}
              className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Gerenciar Terapeutas</div>
                  <div className="text-sm text-gray-500">Acesso de testes</div>
                </div>
              </div>
            </motion.button>
          )}

        </div>

        {/* Status */}
        <motion.div
          className="mt-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status do Sistema</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-gray-600">Autenticação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-gray-600">Sistema Online</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
