"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Mail, MessageSquare, Send, Clock, FileText, 
  Download, Upload, CheckCircle, XCircle, AlertCircle,
  Settings, BarChart, Shield, Edit, Trash2, Copy
} from 'lucide-react';

const MarketingAutomation = ({ event }) => {
  const [activeTab, setActiveTab] = useState('participants');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sendType, setSendType] = useState('invite'); // invite, reminder, post-event, replay, survey
  
  // Estados para participantes
  const [participants, setParticipants] = useState([
    { id: '1', name: 'João Silva', email: 'joao@example.com', phone: '11999999999', isSelected: false, status: 'pending' },
    { id: '2', name: 'Maria Santos', email: 'maria@example.com', phone: '11888888888', isSelected: false, status: 'sent' },
    { id: '3', name: 'Pedro Costa', email: 'pedro@example.com', phone: '11777777777', isSelected: false, status: 'attended' },
  ]);

  // Estados para templates
  const [templates, setTemplates] = useState({
    invite: {
      whatsapp: {
        title: 'Convite WhatsApp',
        message: '🎉 Olá {nome}! Você foi convidado para participar do evento "{evento}" em {data} às {hora}. Acesse: {link}',
        enabled: true
      },
      email: {
        subject: 'Convite para o evento: {evento}',
        body: '<h2>Olá {nome}!</h2><p>Você foi convidado para participar do evento <strong>{evento}</strong> que acontecerá em {data} às {hora}.</p><p><a href="{link}">Clique aqui para confirmar sua presença</a></p>',
        enabled: true
      }
    },
    reminder: {
      whatsapp: {
        title: 'Lembrete WhatsApp',
        message: '⏰ Lembrete: O evento "{evento}" começa em {horas} horas! Acesse: {link}',
        enabled: true
      },
      email: {
        subject: 'Lembrete: Evento {evento} em {horas}',
        body: '<h2>Olá {nome}!</h2><p>Lembrete: O evento <strong>{evento}</strong> começa em {horas} horas.</p><p><a href="{link}">Acessar evento</a></p>',
        enabled: true
      }
    },
    'post-event': {
      whatsapp: {
        title: 'Pós-Evento WhatsApp',
        message: '✅ Obrigado por participar do "{evento}"! Acesse o replay e materiais: {link}',
        enabled: true
      },
      email: {
        subject: 'Obrigado por participar de {evento}',
        body: '<h2>Olá {nome}!</h2><p>Obrigado por participar do evento <strong>{evento}</strong>!</p><p><a href="{link}">Acesse o replay e materiais</a></p>',
        enabled: true
      }
    },
    survey: {
      whatsapp: {
        title: 'Pesquisa WhatsApp',
        message: '📋 Que tal avaliar sua experiência no evento "{evento}"? Sua opinião é muito importante! Link: {link}',
        enabled: true
      },
      email: {
        subject: 'Pesquisa de Satisfação: {evento}',
        body: '<h2>Olá {nome}!</h2><p>Gostaríamos da sua opinião sobre o evento <strong>{evento}</strong>.</p><p><a href="{link}">Responder pesquisa</a></p>',
        enabled: true
      }
    }
  });

  // Estados para logs
  const [sendLogs, setSendLogs] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    error: 0
  });

  const handleAddParticipant = () => {
    const name = prompt('Nome do participante:');
    if (!name) return;
    
    const email = prompt('E-mail do participante:');
    const phone = prompt('Celular do participante (ex: 11999999999):');
    
    const newParticipant = {
      id: Date.now().toString(),
      name,
      email: email || '',
      phone: phone || '',
      isSelected: false,
      status: 'pending'
    };
    
    setParticipants([...participants, newParticipant]);
  };

  const handleImportCSV = () => {
    alert('Funcionalidade de importação CSV em desenvolvimento...\n\nUse o formato:\nNome, Email, Celular\nJoão Silva, joao@example.com, 11999999999');
  };

  const handleEditTemplate = (type, channel) => {
    setSelectedTemplate({ type, channel, template: templates[type][channel] });
    setShowTemplateModal(true);
  };

  const handleSendMessages = async () => {
    const selected = participants.filter(p => p.isSelected);
    if (selected.length === 0) {
      alert('Selecione ao menos um participante!');
      return;
    }

    setShowSendModal(true);
  };

  const executeSend = async () => {
    const selected = participants.filter(p => p.isSelected);
    let whatsappSent = 0;
    let emailSent = 0;
    let errors = 0;

    for (const participant of selected) {
      // Simular envio WhatsApp
      if (templates[sendType].whatsapp.enabled && participant.phone) {
        try {
          const message = replaceVariables(templates[sendType].whatsapp.message, participant);
          await simulateWhatsAppSend(participant.phone, message);
          whatsappSent++;
          
          setSendLogs([...sendLogs, {
            id: Date.now().toString(),
            participant: participant.name,
            channel: 'WhatsApp',
            status: 'sent',
            timestamp: new Date().toISOString()
          }]);
        } catch (error) {
          errors++;
          setSendLogs([...sendLogs, {
            id: Date.now().toString(),
            participant: participant.name,
            channel: 'WhatsApp',
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
          }]);
        }
      }

      // Simular envio E-mail
      if (templates[sendType].email.enabled && participant.email) {
        try {
          const subject = replaceVariables(templates[sendType].email.subject, participant);
          const body = replaceVariables(templates[sendType].email.body, participant);
          await simulateEmailSend(participant.email, subject, body);
          emailSent++;
          
          setSendLogs([...sendLogs, {
            id: Date.now().toString(),
            participant: participant.name,
            channel: 'E-mail',
            status: 'sent',
            timestamp: new Date().toISOString()
          }]);
        } catch (error) {
          errors++;
          setSendLogs([...sendLogs, {
            id: Date.now().toString(),
            participant: participant.name,
            channel: 'E-mail',
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
          }]);
        }
      }
    }

    alert(`✅ Envio concluído!\n\nWhatsApp: ${whatsappSent} enviados\nE-mail: ${emailSent} enviados\nErros: ${errors}`);
    setShowSendModal(false);
    setSendType('invite');
  };

  const replaceVariables = (text, participant) => {
    return text
      .replace(/{nome}/g, participant.name)
      .replace(/{evento}/g, event?.name || 'Evento')
      .replace(/{data}/g, '25/01/2024')
      .replace(/{hora}/g, '19:00')
      .replace(/{horas}/g, '1')
      .replace(/{link}/g, `https://kalon-os.com/event/${event?.id}`);
  };

  const simulateWhatsAppSend = async (phone, message) => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    // Aqui você integraria com WhatsApp Business API, Z-API ou Twilio
    console.log(`WhatsApp enviado para ${phone}:`, message);
  };

  const simulateEmailSend = async (email, subject, body) => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    // Aqui você integraria com SendGrid, Mailgun, Amazon SES, etc.
    console.log(`E-mail enviado para ${email}:`, subject);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('participants')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'participants' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Participantes
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'templates' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <Edit className="w-4 h-4 inline mr-2" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'logs' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <BarChart className="w-4 h-4 inline mr-2" />
          Logs & Analytics
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'settings' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Configurações
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'participants' && (
        <div className="space-y-4">
          {/* Ações */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddParticipant}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Adicionar Participante</span>
            </button>
            <button
              onClick={handleImportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Importar CSV</span>
            </button>
            <button
              onClick={handleSendMessages}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Mensagens</span>
            </button>
          </div>

          {/* Lista de Participantes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        setParticipants(participants.map(p => ({ ...p, isSelected: e.target.checked })));
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Celular</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {participants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={participant.isSelected}
                        onChange={(e) => {
                          setParticipants(participants.map(p => 
                            p.id === participant.id ? { ...p, isSelected: e.target.checked } : p
                          ));
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{participant.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{participant.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{participant.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        participant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        participant.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {participant.status === 'pending' ? 'Pendente' :
                         participant.status === 'sent' ? 'Enviado' : 'Participou'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          {Object.entries(templates).map(([type, channels]) => (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                {type === 'post-event' ? 'Pós-Evento' : type === 'invite' ? 'Convite' : type === 'reminder' ? 'Lembrete' : 'Pesquisa'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* WhatsApp Template */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900 dark:text-white">WhatsApp</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channels.whatsapp.enabled}
                        onChange={(e) => {
                          const newTemplates = { ...templates };
                          newTemplates[type].whatsapp.enabled = e.target.checked;
                          setTemplates(newTemplates);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                    {channels.whatsapp.message}
                  </p>
                  <button
                    onClick={() => handleEditTemplate(type, 'whatsapp')}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                </div>

                {/* Email Template */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900 dark:text-white">E-mail</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channels.email.enabled}
                        onChange={(e) => {
                          const newTemplates = { ...templates };
                          newTemplates[type].email.enabled = e.target.checked;
                          setTemplates(newTemplates);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <strong>Assunto:</strong> {channels.email.subject}
                  </p>
                  <button
                    onClick={() => handleEditTemplate(type, 'email')}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.total}</p>
                </div>
                <BarChart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enviados</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.sent}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lidos</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.read}</p>
                </div>
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Erros</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.error}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Participante</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Canal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sendLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{log.participant}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{log.channel}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.status === 'sent' ? 'bg-green-100 text-green-800' :
                        log.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.status === 'sent' ? 'Enviado' :
                         log.status === 'delivered' ? 'Entregue' : 'Erro'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Configurações de Integração
            </h3>
            
            <div className="space-y-4">
              {/* WhatsApp API */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">WhatsApp Business API</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">API Token</label>
                    <input
                      type="text"
                      placeholder="token-da-api"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                  </div>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Testar Conexão
                  </button>
                </div>
              </div>

              {/* E-mail SMTP */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">E-mail SMTP</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Servidor SMTP</label>
                    <input
                      type="text"
                      placeholder="smtp.example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Porta</label>
                    <input
                      type="number"
                      placeholder="587"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Testar Conexão
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* LGPD */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <Shield className="w-5 h-5 inline mr-2" />
              Privacidade e LGPD
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Incluir link de opt-out em todas as mensagens
                </label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Solicitar consentimento explícito antes do primeiro envio
                </label>
              </div>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Gerar Relatório LGPD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Envio */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Enviar Mensagens
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Mensagem
                  </label>
                  <select
                    value={sendType}
                    onChange={(e) => setSendType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  >
                    <option value="invite">Convite</option>
                    <option value="reminder">Lembrete</option>
                    <option value="post-event">Pós-Evento</option>
                    <option value="survey">Pesquisa</option>
                  </select>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Participantes selecionados:</strong> {participants.filter(p => p.isSelected).length}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={executeSend}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingAutomation;

