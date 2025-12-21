"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  Video,
  MessageSquare,
  FileText,
  UserCircle,
  Upload,
  LogOut,
  Settings,
  Clock
} from 'lucide-react';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../components/AuthContext';
import { formatDate, formatDateObject } from '../utils/formatDate';

const ConsultationUnified = () => {
  const router = useRouter();
  const { user, userType } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [videoConferenceLink, setVideoConferenceLink] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Profissional', text: 'Bem-vindo à consulta! Como posso ajudar?', time: '10:00' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [files, setFiles] = useState([]);
  const [patientData, setPatientData] = useState({
    id: '82c8a8ba-TEST-DRIVE', // Mock ID for testing matching the folder '82c8a8ba'
    name: 'Teste Drive',
    age: 35,
    email: 'teste@example.com',
    phone: '(11) 99999-9999',
    lastVisit: '15/01/2024'
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Dark mode
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);

    // Marcar como carregamento inicial concluído após um pequeno delay
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Evitar salvar durante carregamento inicial
    if (isInitialLoad) return;
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode, isInitialLoad]);

  // Carregar link de videoconferência
  useEffect(() => {
    const settings = localStorage.getItem('kalonAdvancedSettings');
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      if (parsedSettings.videoConferenceLink) {
        setVideoConferenceLink(parsedSettings.videoConferenceLink);
      }
    }
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'Você',
        text: newMessage,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  // --- Integration Logic ---

  const getAuthToken = () => {
    const supabaseAuth = localStorage.getItem('sb-lpnzpimxwtexazokytjo-auth-token');
    return supabaseAuth ? JSON.parse(supabaseAuth).access_token : null;
  };

  const saveNotesToDrive = async (notes) => {
    const token = getAuthToken();
    if (!token) return;

    // Prioritize Router ID (Real scenario), fallback to PatientData ID (Mock/State)
    const clientId = router.query.id || patientData.id;

    if (!clientId) {
      console.warn('Cannot save notes: No Client ID');
      return;
    }

    try {
      const res = await fetch('/api/consultations/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId,
          notes,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (!res.ok) throw new Error('Failed to save');
    } catch (error) {
      console.error('Failed to save notes to Drive:', error);
    }
  };

  const uploadFileToDrive = async (file) => {
    const token = getAuthToken();
    if (!token) {
      alert('Erro de autenticação');
      return null;
    }

    const clientId = router.query.id || patientData.id;
    if (!clientId) {
      alert('Erro: Cliente não identificado para upload');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', clientId);

    // Determine folder based on file type
    let folder = 'Receitas';
    if (file.type.startsWith('audio/')) folder = 'Player';
    formData.append('targetFolder', folder);

    try {
      const response = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Form data headers handled automatically
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      alert(`Arquivo salvo com sucesso em: ${folder}`);
      return data.file;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Falha no upload para o Drive: ' + error.message);
      return null;
    }
  };

  // --- Event Handlers ---

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);

    // Process each file
    for (const file of uploadedFiles) {
      // Optimistic UI update
      const tempId = `temp-${Date.now()}`;
      setFiles(prev => [...prev, {
        id: tempId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: formatDateObject(new Date()),
        status: 'uploading'
      }]);

      // Real Upload
      const driveFile = await uploadFileToDrive(file);

      // Update UI with real result
      setFiles(prev => prev.map(f => f.id === tempId ? {
        ...f,
        id: driveFile ? driveFile.id : f.id,
        status: driveFile ? 'done' : 'error',
        driveLink: driveFile ? driveFile.webViewLink : null
      } : f));
    }
  };

  // Auto-save notes (debounced)
  useEffect(() => {
    if (isInitialLoad || !patientNotes) return;

    setNotesSaved(false);
    const timer = setTimeout(async () => {
      await saveNotesToDrive(patientNotes);
      setNotesSaved(true);
    }, 2000); // 2s debounce

    return () => clearTimeout(timer);
  }, [patientNotes, isInitialLoad]);

  // Manual Save
  const handleSaveNotes = async () => {
    setIsSaving(true);
    await saveNotesToDrive(patientNotes);
    setNotesSaved(true);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 dark:bg-gray-900">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className={`relative z-10 transition-all duration-300 pt-28 ${sidebarOpen ? 'lg:ml-64' : ''
          }`}>
          <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header da Consulta */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Video className="w-6 h-6 text-green-500" />
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Consulta Online - {patientData.name}
                  </h1>
                  <p className="text-sm text-gray-400">
                    ID: C{Date.now().toString().slice(-6)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button
                  onClick={() => router.push('/consultations')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair da Consulta</span>
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-gray-800 border-b border-gray-700 flex items-center space-x-1 px-4">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-6 py-3 flex items-center space-x-2 rounded-t-lg transition-colors ${activeTab === 'video'
                  ? 'bg-gray-900 text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                <Video className="w-5 h-5" />
                <span>Vídeo</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-3 flex items-center space-x-2 rounded-t-lg transition-colors ${activeTab === 'chat'
                  ? 'bg-gray-900 text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`px-6 py-3 flex items-center space-x-2 rounded-t-lg transition-colors ${activeTab === 'files'
                  ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                <Upload className="w-5 h-5" />
                <span>Arquivos</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-6 py-3 flex items-center space-x-2 rounded-t-lg transition-colors ${activeTab === 'notes'
                  ? 'bg-gray-900 text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                <FileText className="w-5 h-5" />
                <span>Anotações</span>
              </button>
              <button
                onClick={() => setActiveTab('patient')}
                className={`px-6 py-3 flex items-center space-x-2 rounded-t-lg transition-colors ${activeTab === 'patient'
                  ? 'bg-gray-900 text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                <UserCircle className="w-5 h-5" />
                <span>Paciente</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col bg-gray-900">
                {activeTab === 'video' && (
                  <div className="flex-1 flex items-center justify-center p-4">
                    {videoConferenceLink && videoConferenceLink.trim() ? (
                      <iframe
                        src={videoConferenceLink}
                        allow="camera; microphone; fullscreen; speaker; display-capture"
                        className="w-full h-full rounded-lg border-2 border-gray-700"
                        style={{ minHeight: '600px' }}
                        title="Consulta Online Kalon OS"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg border-2 border-gray-700">
                        <div className="text-center p-8">
                          <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-white mb-2">
                            Link de vídeo não configurado
                          </h3>
                          <p className="text-gray-400 max-w-md">
                            Configure seu link de videoconferência em <strong className="text-white">Configurações</strong> para iniciar.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="flex-1 flex flex-col bg-gray-800">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-blue-400">{msg.sender}</span>
                            <span className="text-xs text-gray-500">{msg.time}</span>
                          </div>
                          <p className="text-sm text-gray-200 bg-gray-700 p-2 rounded-lg">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-700 flex items-center space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="flex-1 p-6 overflow-y-auto bg-gray-800">
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-2xl font-bold text-white mb-4">Arquivos Compartilhados</h2>

                      <div className="mb-6 p-6 border-2 border-dashed border-gray-600 rounded-lg text-center bg-gray-700">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-300 mb-3">Envie arquivos para compartilhar com o paciente</p>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                        >
                          Selecionar Arquivos
                        </label>
                      </div>

                      {files.length > 0 ? (
                        <div className="space-y-2">
                          {files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                              <div>
                                <p className="text-white font-medium">{file.name}</p>
                                <p className="text-sm text-gray-400">{file.uploadDate}</p>
                              </div>
                              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                Remover
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center">Nenhum arquivo compartilhado ainda.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="flex-1 p-6 bg-gray-800">
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-2xl font-bold text-white mb-4">Anotações da Consulta</h2>
                      <textarea
                        value={patientNotes}
                        onChange={(e) => setPatientNotes(e.target.value)}
                        placeholder="Digite suas anotações sobre a consulta aqui..."
                        className="w-full h-[calc(100vh-400px)] px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isSaving ? (
                            <span className="text-sm text-gray-400">Salvando...</span>
                          ) : notesSaved ? (
                            <span className="text-sm text-green-400">✓ Salvo automaticamente</span>
                          ) : (
                            <span className="text-sm text-gray-400">Salvando...</span>
                          )}
                        </div>
                        <button
                          onClick={handleSaveNotes}
                          disabled={isSaving}
                          className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? 'Salvando...' : 'Salvar Agora'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'patient' && (
                  <div className="flex-1 p-6 overflow-y-auto bg-gray-800">
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-2xl font-bold text-white mb-6">Ficha do Paciente</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-700 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4">Informações Básicas</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-gray-400">Nome Completo</label>
                              <p className="text-white">{patientData.name}</p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-400">Idade</label>
                              <p className="text-white">{patientData.age} anos</p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-400">E-mail</label>
                              <p className="text-white">{patientData.email}</p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-400">Telefone</label>
                              <p className="text-white">{patientData.phone}</p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-400">Última Visita</label>
                              <p className="text-white">{formatDate(patientData.lastVisit)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-700 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4">Histórico</h3>
                          <div className="space-y-3">
                            <div className="text-gray-400">
                              <p>Sem histórico disponível no momento.</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-700 p-6 rounded-lg col-span-1 md:col-span-2">
                          <h3 className="text-lg font-semibold text-white mb-4">Observações</h3>
                          <textarea
                            className="w-full h-32 px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Adicione observações sobre o paciente..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute >
  );
};

export default ConsultationUnified;

