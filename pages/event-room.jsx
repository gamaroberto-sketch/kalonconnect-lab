"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Users, Video, MessageSquare, BarChart3, UserPlus, Bell, FileDown, Award, CheckCircle2, Cloud, FileText, Circle, Upload, Share2, Star, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/router';
import { VideoPanelProvider } from '../components/VideoPanelContext';
import VideoSurfaceEvent from '../components/VideoSurfaceEvent';
import VideoControls from '../components/VideoControls';
import { useTranslation } from '../hooks/useTranslation';

const EventRoom = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [event, setEvent] = useState(null);
  const [activeChatTab, setActiveChatTab] = useState('public');
  const [participants, setParticipants] = useState([
    { id: '1', name: 'Profissional', role: 'moderador', isSpeaking: true },
    { id: '2', name: 'Participante 1', role: 'convidado', isSpeaking: false },
    { id: '3', name: 'Participante 2', role: 'convidado', isSpeaking: false },
    { id: '4', name: 'Participante 3', role: 'convidado', isSpeaking: false },
  ]);
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Profissional', text: 'Bem-vindos ao evento!', time: '19:00', isModerator: true },
    { id: '2', sender: 'Participante 1', text: 'Obrigado pela oportunidade!', time: '19:01', isModerator: false },
  ]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [hasUnreadPrivate, setHasUnreadPrivate] = useState(false);
  const isModerator = true;

  // Estados para Lista de Presença
  const [attendance, setAttendance] = useState([
    { id: '1', name: 'Profissional', email: 'prof@example.com', entryTime: '19:00', exitTime: null, duration: 120, status: 'integral', present: true, entryTimestamp: Date.now() - 7200000 },
    { id: '2', name: 'Participante 1', email: 'p1@example.com', entryTime: '19:05', exitTime: null, duration: 90, status: 'parcial', present: true, entryTimestamp: Date.now() - 5400000 },
  ]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // Estado para visualização de certificado
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [certificateToPreview, setCertificateToPreview] = useState(null);

  // Critério mínimo de presença
  const [minAttendancePercentage, setMinAttendancePercentage] = useState(80);

  // Estados para Certificado
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [eventHours, setEventHours] = useState('2');
  const [eventTheme, setEventTheme] = useState('');

  // Estados para criação de enquete
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '', '']);

  // Estados para Google Drive
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveFiles, setDriveFiles] = useState([]);
  const [selectedDriveFile, setSelectedDriveFile] = useState(null);
  const [shareMode, setShareMode] = useState('public'); // 'public' ou 'private'

  // Estados para Gravação e Replay
  const [isRecording, setIsRecording] = useState(false);
  const [showRecordingWarning, setShowRecordingWarning] = useState(false);
  const [recordedSession, setRecordedSession] = useState(null);
  const [showReplayModal, setShowReplayModal] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [replayExpiration, setReplayExpiration] = useState(30); // dias
  const [postEventMaterials, setPostEventMaterials] = useState([]);

  // Estados para Pesquisa de Satisfação
  const [showSatisfactionSurvey, setShowSatisfactionSurvey] = useState(false);
  const [surveyRating, setSurveyRating] = useState(0);
  const [surveyComment, setSurveyComment] = useState('');
  const [surveyAdditional, setSurveyAdditional] = useState({
    wouldRecommend: '',
    metExpectations: '',
    suggestions: ''
  });
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [allSurveyResults, setAllSurveyResults] = useState([]);

  // Estado para participantes LiveKit (online em tempo real)
  const [liveKitParticipants, setLiveKitParticipants] = useState(0);

  useEffect(() => {
    // 1. Tentar pegar ID da URL (Prioridade Máxima logicamente para casar com o Cliente)
    const urlParams = new URL(window.location.href).searchParams;
    const urlId = urlParams.get('id') || urlParams.get('slug');

    const currentEventData = localStorage.getItem('currentEvent');
    let eventData = currentEventData ? JSON.parse(currentEventData) : null;

    if (urlId) {
      console.log("🔗 Event Room: Usando ID da URL:", urlId);
      // Se não tiver evento ou o ID for diferente, cria um stub ou atualiza
      if (!eventData || eventData.id !== urlId) {
        eventData = {
          ...eventData,
          id: urlId, // FORÇA O ID DA URL
          name: eventData?.name || `Sala de ${urlId}`
        };
      }
    }

    if (eventData) {
      // Se o evento não tem videoLink, busca das configurações gerais
      if (!eventData.videoLink || eventData.videoLink.trim() === '') {
        const settings = localStorage.getItem('kalonAdvancedSettings');
        if (settings) {
          const parsedSettings = JSON.parse(settings);
          if (parsedSettings.videoConferenceLink) {
            eventData.videoLink = parsedSettings.videoConferenceLink;
          }
        }
      }

      setEvent(eventData);

      // Verifica se já existe gravação anterior
      if (eventData.recording) {
        setRecordedSession(eventData.recording);
      }
    } else {
      // Fallback seguro se não tiver nada
      setEvent({ id: '1', name: 'Sala de Evento' });
    }

    // Registro automático de entrada
    const entryTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const entryTimestamp = Date.now();

    // Atualiza duração em tempo real
    const interval = setInterval(() => {
      setAttendance(prev => prev.map(p => {
        if (p.present) {
          const duration = Math.floor((Date.now() - p.entryTimestamp) / 60000);
          return { ...p, duration, status: duration >= 90 ? 'integral' : 'parcial' };
        }
        return p;
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLeaveRoom = () => {
    // Para gravação ao sair
    if (isRecording) {
      const recordingData = JSON.parse(localStorage.getItem('eventRecording') || '{}');
      recordingData.endTime = new Date().toISOString();
      recordingData.isActive = false;
      recordingData.duration = recordingData.duration || '60 min';
      setRecordedSession(recordingData);
      localStorage.setItem('eventRecording', JSON.stringify(recordingData));
      setIsRecording(false);
    }

    // Abre pesquisa de satisfação ao sair
    setShowSatisfactionSurvey(true);
  };

  const handleSubmitSurvey = () => {
    if (surveyRating === 0) {
      alert('Por favor, avalie o evento com estrelas!');
      return;
    }

    const surveyData = {
      id: Date.now().toString(),
      eventId: event?.id,
      rating: surveyRating,
      comment: surveyComment,
      wouldRecommend: surveyAdditional.wouldRecommend,
      metExpectations: surveyAdditional.metExpectations,
      suggestions: surveyAdditional.suggestions,
      timestamp: new Date().toISOString()
    };

    // Salva resultados
    const existingSurveys = JSON.parse(localStorage.getItem('eventSurveys') || '[]');
    existingSurveys.push(surveyData);
    localStorage.setItem('eventSurveys', JSON.stringify(existingSurveys));

    setAllSurveyResults(existingSurveys);
    setSurveySubmitted(true);

    // Fecha modal após 2 segundos
    setTimeout(() => {
      setShowSatisfactionSurvey(false);
      router.push('/events');
    }, 2000);
  };

  const handleSkipSurvey = () => {
    setShowSatisfactionSurvey(false);
    router.push('/events');
  };

  const calculateAverageRating = () => {
    if (allSurveyResults.length === 0) return 0;
    const sum = allSurveyResults.reduce((acc, survey) => acc + survey.rating, 0);
    return (sum / allSurveyResults.length).toFixed(1);
  };

  const exportSurveyResults = () => {
    const csvContent = [
      ['ID', 'Data', 'Avaliação (estrelas)', 'Comentário', 'Recomendaria?', 'Atendeu expectativas?', 'Sugestões'].join(','),
      ...allSurveyResults.map(s => [
        s.id,
        new Date(s.timestamp).toLocaleDateString('pt-BR'),
        s.rating + ' estrelas',
        s.comment || '-',
        s.wouldRecommend || '-',
        s.metExpectations || '-',
        s.suggestions || '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pesquisa-satisfacao-${event?.name || 'evento'}.csv`;
    link.click();
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    const recordingData = {
      eventId: event?.id || '1',
      startTime: new Date().toISOString(),
      isActive: true,
      participants: attendance.length
    };
    localStorage.setItem('eventRecording', JSON.stringify(recordingData));
    alert(t('eventRoom.recording.started'));
  };

  const handleStopRecording = () => {
    const recordingData = JSON.parse(localStorage.getItem('eventRecording') || '{}');
    recordingData.endTime = new Date().toISOString();
    recordingData.isActive = false;
    recordingData.duration = '45 min'; // Exemplo
    setRecordedSession(recordingData);
    localStorage.setItem('eventRecording', JSON.stringify(recordingData));
    setIsRecording(false);
    alert(t('eventRoom.recording.stopped'));
  };

  const handleUploadReplay = () => {
    alert('Abrindo seletor de arquivo para upload manual da gravação...\n\n(Implementar upload real aqui)');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'Você',
        text: newMessage,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isModerator: isModerator
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleStartPrivateChat = (userId) => {
    const user = participants.find(p => p.id === userId);
    if (user) {
      setSelectedUser(user);
      setActiveChatTab('private');
    }
  };

  const handleSendPrivateMessage = () => {
    if (newMessage.trim() && selectedUser) {
      const message = {
        id: Date.now().toString(),
        from: 'me',
        fromName: 'Você',
        to: selectedUser.id,
        toName: selectedUser.name,
        text: newMessage,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setPrivateMessages([...privateMessages, message]);
      setNewMessage('');
    }
  };

  const handleCreatePoll = () => {
    if (pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
      const newPoll = {
        id: Date.now().toString(),
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim()).map((opt, idx) => ({
          id: idx,
          text: opt,
          votes: 0
        })),
        votes: {}
      };
      setPolls([...polls, newPoll]);
      setActivePoll(newPoll);
      setShowPollModal(false);
      setPollQuestion('');
      setPollOptions(['', '', '', '']);
    }
  };

  const handleVote = (optionId) => {
    if (activePoll && !activePoll.votes['me']) {
      const updatedPoll = {
        ...activePoll,
        options: activePoll.options.map(opt =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        ),
        votes: { ...activePoll.votes, 'me': optionId }
      };
      setActivePoll(updatedPoll);
      setPolls(polls.map(p => p.id === activePoll.id ? updatedPoll : p));
    }
  };

  const handleExportAttendance = () => {
    const csvContent = [
      [t('eventRoom.modals.attendance.headers.name'), t('eventRoom.modals.attendance.headers.email'), t('eventRoom.modals.attendance.headers.entry'), t('eventRoom.modals.attendance.headers.exit'), t('eventRoom.modals.attendance.headers.duration'), t('eventRoom.modals.attendance.headers.status')].join(','),
      ...attendance.map(a => [
        a.name,
        a.email,
        a.entryTime,
        a.exitTime || t('eventRoom.modals.attendance.present'),
        a.duration,
        a.status === 'integral' ? t('eventRoom.modals.attendance.status.full') : a.status === 'parcial' ? t('eventRoom.modals.attendance.status.partial') : t('eventRoom.modals.attendance.status.absent')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lista-presenca-${event?.name || 'evento'}.csv`;
    link.click();
  };

  const generateCertificatePDF = (participant) => {
    const certificateNumber = `CERT-${Date.now()}-${participant.id}`;
    const validationLink = `https://kalon-os.com/validate/${certificateNumber}`;

    // Aqui você usaria uma biblioteca como jsPDF para gerar o PDF real
    // Por enquanto, vamos simular com um alerta mais detalhado

    return {
      certificateNumber,
      validationLink,
      data: {
        eventName: event?.name || 'Evento',
        participantName: participant.name,
        date: new Date().toLocaleDateString('pt-BR'),
        hours: eventHours,
        theme: eventTheme || event?.description || '',
        professionalName: 'Dr. Profissional',
        city: 'São Paulo, SP'
      }
    };
  };

  const handleGenerateCertificate = (participantId) => {
    const participant = attendance.find(p => p.id === participantId);
    if (!participant) return;

    const certificate = generateCertificatePDF(participant);
    setCertificateToPreview(certificate);
    setShowCertificatePreview(true);
  };

  const handleGenerateAllCertificates = () => {
    const eligibleParticipants = attendance.filter(p => p.present && p.status === 'integral');
    const certificates = eligibleParticipants.map(p => generateCertificatePDF(p));

    // Simula download de ZIP com todos os certificados
    alert(`Gerando ${certificates.length} certificados em lote...\n\nOs arquivos serão baixados automaticamente em ZIP.\n\n(Implementar geração real de ZIP aqui)`);
  };

  const handleSendCertificatesByEmail = () => {
    const eligibleParticipants = attendance.filter(p => p.present && p.status === 'integral');
    alert(`Enviando ${eligibleParticipants.length} certificados por e-mail...\n\nOs certificados serão enviados automaticamente para o e-mail de cada participante.\n\n(Implementar envio real de e-mail aqui)`);
  };

  // Funções Google Drive
  const handleGoogleAuth = async () => {
    alert('Redirecionando para autenticação Google OAuth 2.0...\n\n(Implementar OAuth real com Google API aqui)');
    // Simulação de arquivos após autenticação
    setDriveFiles([
      { id: '1', name: 'Apresentacao_Mindfulness.pdf', type: 'application/pdf', icon: '📄', sharedLink: null },
      { id: '2', name: 'Exercicio_Respiratorio.mp3', type: 'audio/mpeg', icon: '🎵', sharedLink: null },
      { id: '3', name: 'Video_Relaxamento.mp4', type: 'video/mp4', icon: '🎬', sharedLink: null },
      { id: '4', name: 'Checklist_Avaliacao.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: '📝', sharedLink: null },
    ]);
  };

  const handleGenerateShareLink = (file) => {
    // Simula geração de link compartilhável
    const shareLink = `https://drive.google.com/file/d/${file.id}/view?usp=sharing`;
    return shareLink;
  };

  const handleShareDriveFile = (file, mode) => {
    const shareLink = handleGenerateShareLink(file);

    // Verifica se precisa ajustar permissões
    if (!file.sharedLink) {
      alert('⚠️ Arquivo precisa de permissão!\n\nConfigure o arquivo no Google Drive para "Qualquer pessoa com o link pode visualizar".');
    }

    if (mode === 'public') {
      // Adiciona ao chat público
      const publicMessage = {
        id: Date.now().toString(),
        sender: 'Sistema',
        text: `📎 Arquivo compartilhado: ${file.name}`,
        file: { ...file, shareLink },
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isModerator: true
      };
      setMessages([...messages, publicMessage]);
      alert('✅ Arquivo compartilhado no chat público!');
    } else {
      // Compartilha no chat privado
      if (selectedUser) {
        const privateMessage = {
          id: Date.now().toString(),
          from: 'me',
          fromName: 'Você',
          to: selectedUser.id,
          toName: selectedUser.name,
          text: `📎 Arquivo compartilhado: ${file.name}`,
          file: { ...file, shareLink },
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        setPrivateMessages([...privateMessages, privateMessage]);
        alert(`✅ Arquivo compartilhado com ${selectedUser.name} em chat privado!`);
      } else {
        alert('⚠️ Selecione um participante para compartilhar arquivo privadamente');
      }
    }

    setShowDriveModal(false);
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-center">
            <p className="text-white text-xl">{t('eventRoom.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Video className="w-6 h-6 text-green-500" />
          <h1 className="text-xl font-bold text-white">
            {event.name}
          </h1>
          {isRecording && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-600 rounded-lg animate-pulse">
              <Circle className="w-3 h-3 text-white fill-white" />
              <span className="text-xs font-medium text-white">{t('eventRoom.recording.status')}</span>
            </div>
          )}
          {/* Indicador de participantes online (LiveKit) */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 rounded-lg">
            <Users className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              {liveKitParticipants} {t('eventRoom.online')}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isModerator && (
            <>
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                title="Lista de Presença"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('eventRoom.buttons.attendance')}</span>
              </button>
              <button
                onClick={() => setShowPollModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                title="Criar Enquete"
              >
                <BarChart3 className="w-5 h-5" />
                <span>{t('eventRoom.buttons.poll')}</span>
              </button>
              <button
                onClick={() => setShowCertificateModal(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                title="Gerar Certificados"
              >
                <Award className="w-5 h-5" />
                <span>{t('eventRoom.buttons.certificates')}</span>
              </button>
              <button
                onClick={() => setShowDriveModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center space-x-2"
                title="Abrir Google Drive"
              >
                <Cloud className="w-5 h-5" />
                <span>{t('eventRoom.buttons.drive')}</span>
              </button>
              <button
                onClick={() => setShowReplayModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                title="Assistir Replay"
              >
                <Video className="w-5 h-5" />
                <span>{t('eventRoom.buttons.replay')}</span>
              </button>
              {!isRecording && (
                <button
                  onClick={handleStartRecording}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                  title="Iniciar Gravação"
                >
                  <Circle className="w-5 h-5 fill-white" />
                  <span>{t('eventRoom.recording.start')}</span>
                </button>
              )}
              {isRecording && (
                <button
                  onClick={handleStopRecording}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                  title="Parar Gravação"
                >
                  <Circle className="w-5 h-5 fill-white" />
                  <span>{t('eventRoom.recording.stop')}</span>
                </button>
              )}
            </>
          )}
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('eventRoom.buttons.leave')}</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Vídeo Principal */}
        <div className="flex-1 flex flex-col bg-gray-800">
          <VideoPanelProvider
            isProfessional={true}
            sessionDuration={60}
            elapsedTime={0}
            warningThreshold={5}
          >
            <div className="flex-1 flex flex-col p-2 space-y-2">
              <div className="mb-2">
                <VideoControls />
              </div>

              <div className="flex-1 flex items-center justify-center">
                <section
                  id="videoArea"
                  className="relative w-full"
                  style={{ height: '75vh' }}
                >
                  <div className="h-full w-full rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-slate-950/90 overflow-hidden">
                    <VideoSurfaceEvent
                      eventId={event?.id || '1'}
                      isModerator={isModerator}
                      onParticipantsChange={(count) => setLiveKitParticipants(count)}
                    />
                  </div>
                </section>
              </div>
            </div>
          </VideoPanelProvider>

          {/* Chat */}
          <div className="bg-gray-900 border-t border-gray-700 flex flex-col" style={{ height: '300px' }}>
            {/* Abas */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveChatTab('public')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeChatTab === 'public' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                {t('eventRoom.chat.public')}
              </button>
              <button
                onClick={() => setActiveChatTab('private')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors relative ${activeChatTab === 'private' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'
                  }`}
              >
                {t('eventRoom.chat.private')}
                {hasUnreadPrivate && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />}
              </button>
            </div>

            {/* Conteúdo */}
            {activeChatTab === 'public' ? (

              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={msg.isModerator ? 'bg-blue-900/20 p-2 rounded' : ''}>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-blue-400">{msg.sender}</span>
                        {msg.isModerator && <span>👑</span>}
                        <span className="text-xs text-gray-500">{msg.time}</span>
                      </div>
                      <p className="text-sm text-gray-300">{msg.text}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-700 flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t('eventRoom.chat.placeholder')}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {t('eventRoom.buttons.send')}
                  </button>
                </div>
              </>
            ) : (
              <>
                {selectedUser ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {privateMessages.filter(m =>
                        (m.from === selectedUser.id && m.to === 'me') ||
                        (m.from === 'me' && m.to === selectedUser.id)
                      ).map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.from === 'me' ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-purple-400">{msg.from === 'me' ? t('eventRoom.chat.you') : msg.fromName}</span>
                            <span className="text-xs text-gray-500">{msg.time}</span>
                          </div>
                          <p className={`text-sm text-gray-300 max-w-[70%] ${msg.from === 'me' ? 'bg-purple-600' : 'bg-gray-700'} p-2 rounded-lg`}>
                            {msg.text}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-700 flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendPrivateMessage()}
                        placeholder={t('eventRoom.chat.privatePlaceholder', { name: selectedUser.name })}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                      <button onClick={handleSendPrivateMessage} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        {t('eventRoom.buttons.send')}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                      <UserPlus className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">{t('eventRoom.chat.selectUser')}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Lista de Participantes */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">
                {t('eventRoom.participants.title')} ({participants.length})
              </h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {participants.map((participant) => (
              <button
                key={participant.id}
                onClick={() => isModerator && participant.role === 'convidado' && handleStartPrivateChat(participant.id)}
                className={`w-full p-3 bg-gray-700 rounded-lg text-left ${isModerator && participant.role === 'convidado' ? 'hover:bg-gray-600 cursor-pointer' : 'cursor-default'
                  }`}
              >
                <p className="text-sm text-white">{participant.name}</p>
                <p className="text-xs text-gray-400">{participant.role === 'moderador' ? `👑 ${t('eventRoom.chat.moderator')}` : `👤 ${t('eventRoom.chat.guest')}`}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Enquete */}
      {
        showPollModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">{t('eventRoom.modals.poll.title')}</h2>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder={t('eventRoom.modals.poll.questionPlaceholder')}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg mb-4"
              />
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...pollOptions];
                    newOptions[idx] = e.target.value;
                    setPollOptions(newOptions);
                  }}
                  placeholder={t('eventRoom.modals.poll.optionPlaceholder', { index: idx + 1 })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg mb-2"
                />
              ))}
              <div className="flex space-x-2">
                <button onClick={handleCreatePoll} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  {t('eventRoom.buttons.create')}
                </button>
                <button onClick={() => setShowPollModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  {t('eventRoom.buttons.cancel')}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Enquete Ativa */}
      {
        activePoll && (
          <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm">
            <h3 className="font-bold text-white mb-2">{activePoll.question}</h3>
            <div className="space-y-2">
              {activePoll.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  disabled={activePoll.votes['me'] !== undefined}
                  className="w-full p-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-left disabled:opacity-50"
                >
                  {opt.text} - {opt.votes} voto(s)
                </button>
              ))}
            </div>
          </div>
        )
      }

      {/* Modal Lista de Presença */}
      {
        showAttendanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{t('eventRoom.modals.attendance.title')}</h2>
                <button onClick={() => setShowAttendanceModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <p className="text-sm text-gray-400 mb-4 bg-blue-900/20 p-3 rounded">
                {t('eventRoom.modals.attendance.info')}
              </p>
              <button onClick={handleExportAttendance} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <FileDown className="w-5 h-5" />
                <span>{t('eventRoom.buttons.exportCsv')}</span>
              </button>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-2 text-white">{t('eventRoom.modals.attendance.headers.name')}</th>
                    <th className="pb-2 text-white">{t('eventRoom.modals.attendance.headers.email')}</th>
                    <th className="pb-2 text-white">{t('eventRoom.modals.attendance.headers.entry')}</th>
                    <th className="pb-2 text-white">{t('eventRoom.modals.attendance.headers.duration')}</th>
                    <th className="pb-2 text-white">{t('eventRoom.modals.attendance.headers.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((p) => (
                    <tr key={p.id} className="border-b border-gray-700">
                      <td className="py-2 text-white">{p.name}</td>
                      <td className="py-2 text-gray-400">{p.email}</td>
                      <td className="py-2 text-gray-400">{p.entryTime}</td>
                      <td className="py-2 text-gray-400">{p.duration} min</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded ${p.status === 'integral' ? 'bg-green-900 text-green-300' :
                          p.status === 'parcial' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                          {p.status === 'integral' ? t('eventRoom.modals.attendance.status.full') :
                            p.status === 'parcial' ? t('eventRoom.modals.attendance.status.partial') :
                              t('eventRoom.modals.attendance.status.absent')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {/* Modal Certificados */}
      {
        showCertificateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">{t('eventRoom.modals.certificates.title')}</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">{t('eventRoom.modals.certificates.hoursLabel')}</label>
                  <input
                    type="text"
                    value={eventHours}
                    onChange={(e) => setEventHours(e.target.value)}
                    placeholder={t('eventRoom.modals.certificates.hoursPlaceholder')}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">{t('eventRoom.modals.certificates.themeLabel')}</label>
                  <input
                    type="text"
                    value={eventTheme}
                    onChange={(e) => setEventTheme(e.target.value)}
                    placeholder={t('eventRoom.modals.certificates.themePlaceholder')}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">{t('eventRoom.modals.certificates.minAttendanceLabel', { percentage: minAttendancePercentage })}</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={minAttendancePercentage}
                    onChange={(e) => setMinAttendancePercentage(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Botões de ação em lote */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={handleGenerateAllCertificates}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <FileDown className="w-5 h-5" />
                  <span>{t('eventRoom.modals.certificates.generateAll')}</span>
                </button>
                <button
                  onClick={handleSendCertificatesByEmail}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                >
                  <Award className="w-5 h-5" />
                  <span>{t('eventRoom.modals.certificates.sendEmail')}</span>
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-3">{t('eventRoom.modals.certificates.eligibleParticipants', { count: attendance.filter(p => p.present && p.status === 'integral').length, total: attendance.length })}</p>

              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {attendance.filter(p => p.present && p.status === 'integral').map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <span className="text-white">{p.name}</span>
                      <span className="text-xs text-gray-400 ml-2">({p.duration} min)</span>
                    </div>
                    <button
                      onClick={() => handleGenerateCertificate(p.id)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      {t('eventRoom.modals.certificates.preview')}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowCertificateModal(false)} className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                {t('eventRoom.buttons.close')}
              </button>
            </div>
          </div>
        )
      }

      {/* Modal Preview do Certificado */}
      {
        showCertificatePreview && certificateToPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="text-center border-4 border-gray-800 p-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">{t('eventRoom.modals.certificatePreview.title')}</h1>

                <p className="text-lg mb-6 text-gray-700">
                  {t('eventRoom.modals.certificatePreview.certifiedThat')} <strong className="text-xl">{certificateToPreview.data.participantName}</strong>
                </p>

                <p className="text-base mb-4 text-gray-600">
                  {t('eventRoom.modals.certificatePreview.participatedIn')} <strong>{certificateToPreview.data.eventName}</strong>
                </p>

                {certificateToPreview.data.theme && (
                  <p className="text-base mb-4 text-gray-600">
                    <strong>{t('eventRoom.modals.certificatePreview.theme')}:</strong> {certificateToPreview.data.theme}
                  </p>
                )}

                <p className="text-base mb-4 text-gray-600">
                  {t('eventRoom.modals.certificatePreview.heldOn')} <strong>{certificateToPreview.data.date}</strong>, {t('eventRoom.modals.certificatePreview.withDurationOf')} <strong>{certificateToPreview.data.hours} {t('eventRoom.modals.certificatePreview.hours')}</strong>
                </p>

                <p className="text-base mb-4 text-gray-600">
                  {t('eventRoom.modals.certificatePreview.promotedBy')} <strong>{certificateToPreview.data.professionalName}</strong>
                </p>

                <p className="text-sm text-gray-500 mt-8">
                  {certificateToPreview.data.city}, {certificateToPreview.data.date}
                </p>

                <div className="mt-8 flex justify-between items-end">
                  <div className="text-center">
                    <div className="border-t-2 border-gray-800 w-48 mx-auto mt-4"></div>
                    <p className="text-sm text-gray-600 mt-2">{t('eventRoom.modals.certificatePreview.digitalSignature')}</p>
                  </div>
                  <div className="border border-gray-400 p-4 bg-gray-100">
                    <p className="text-xs text-gray-600">{t('eventRoom.modals.certificatePreview.qrCode')}</p>
                    <div className="w-20 h-20 bg-gray-200 mt-2"></div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  {t('eventRoom.modals.certificatePreview.certificateNumber')}: {certificateToPreview.certificateNumber}
                </p>
                <p className="text-xs text-gray-400">
                  {t('eventRoom.modals.certificatePreview.validation')}: {certificateToPreview.validationLink}
                </p>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={() => {
                    alert('Gerando PDF... (Implementar geração real aqui)');
                    setShowCertificatePreview(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('eventRoom.modals.certificatePreview.downloadPdf')}
                </button>
                <button
                  onClick={() => {
                    alert('Enviando por e-mail... (Implementar envio real aqui)');
                    setShowCertificatePreview(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {t('eventRoom.modals.certificatePreview.sendEmail')}
                </button>
                <button
                  onClick={() => setShowCertificatePreview(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  {t('eventRoom.buttons.close')}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Google Drive */}
      {
        showDriveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Cloud className="w-6 h-6 text-orange-400" />
                  <h2 className="text-2xl font-bold text-white">{t('eventRoom.modals.drive.title')}</h2>
                </div>
                <button onClick={() => setShowDriveModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              {driveFiles.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Cloud className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">{t('eventRoom.modals.drive.connectTitle')}</h3>
                    <p className="text-gray-400 mb-6">
                      {t('eventRoom.modals.drive.connectInfo')}
                    </p>
                    <button
                      onClick={handleGoogleAuth}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                    >
                      <Cloud className="w-5 h-5" />
                      <span>{t('eventRoom.modals.drive.connectButton')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 bg-gray-700 rounded-lg p-2">
                        <input
                          type="text"
                          placeholder={t('eventRoom.modals.drive.searchPlaceholder')}
                          className="w-full bg-transparent text-white px-2 outline-none"
                        />
                      </div>
                      <select
                        value={shareMode}
                        onChange={(e) => setShareMode(e.target.value)}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                      >
                        <option value="public">{t('eventRoom.modals.drive.sharePublic')}</option>
                        <option value="private">{t('eventRoom.modals.drive.sharePrivate')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{file.icon}</span>
                          <div>
                            <p className="text-white font-medium">{file.name}</p>
                            <p className="text-xs text-gray-400">{file.type}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleShareDriveFile(file, shareMode)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                          {shareMode === 'public' ? t('eventRoom.modals.drive.share') : t('eventRoom.modals.drive.send')}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }

      {/* Modal Aviso de Gravação */}
      {
        showRecordingWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg max-w-md">
              <div className="flex items-center space-x-3 mb-4">
                <Circle className="w-8 h-8 text-red-500 fill-red-500" />
                <h3 className="text-2xl font-bold text-white">{t('eventRoom.modals.recordingWarning.title')}</h3>
              </div>
              <p className="text-gray-300 mb-6">
                {t('eventRoom.modals.recordingWarning.description')}
              </p>
              <p className="text-sm text-gray-400 mb-6 bg-blue-900/20 p-4 rounded-lg">
                ⚖️ <strong>{t('eventRoom.modals.recordingWarning.legalNoticeTitle')}:</strong> {t('eventRoom.modals.recordingWarning.legalNoticeText')}
              </p>
              <button
                onClick={() => setShowRecordingWarning(false)}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                {t('eventRoom.modals.recordingWarning.continueButton')}
              </button>
            </div>
          </div>
        )
      }

      {/* Modal Replay */}
      {
        showReplayModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Video className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">{t('eventRoom.modals.replay.title')}</h2>
                </div>
                <button onClick={() => setShowReplayModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              {recordedSession ? (
                <>
                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <div className="bg-gray-700 w-full h-96 rounded-lg flex items-center justify-center">
                      <Video className="w-20 h-20 text-gray-500" />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{event?.name || t('eventRoom.modals.replay.recordedSession')}</p>
                        <p className="text-sm text-gray-400">
                          {recordedSession.duration} • {new Date(recordedSession.startTime).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                          ⏯️ {t('eventRoom.modals.replay.play')}
                        </button>
                        {allowDownload && (
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <FileDown className="w-4 h-4" />
                            <span>{t('eventRoom.modals.replay.download')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <h3 className="text-lg font-bold text-white mb-3">{t('eventRoom.modals.replay.postEventMaterials')}</h3>
                    <div className="space-y-2">
                      {postEventMaterials.map((material, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{material.icon}</span>
                            <div>
                              <p className="text-white">{material.name}</p>
                              <p className="text-xs text-gray-400">{material.date}</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Acessar
                          </button>
                        </div>
                      ))}
                    </div>

                    {isModerator && (
                      <button
                        onClick={() => alert('Upload de material...')}
                        className="mt-4 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Adicionar Material</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Nenhuma Gravação Disponível</h3>
                    <p className="text-gray-400 mb-6">Ainda não há replay disponível.</p>
                    {isModerator && (
                      <button
                        onClick={handleUploadReplay}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2 mx-auto"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Upload de Gravação</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }

      {/* Modal Pesquisa de Satisfação */}
      {
        showSatisfactionSurvey && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              {surveySubmitted ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Obrigado!</h2>
                  <p className="text-lg text-gray-300 mb-2">Sua opinião foi registrada.</p>
                  <p className="text-sm text-gray-400">Obrigado por ajudar a melhorar nossos eventos!</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 mb-6">
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">Como foi sua experiência?</h2>
                  </div>

                  {/* Avaliação por Estrelas */}
                  <div className="mb-6">
                    <p className="text-gray-300 mb-3">Avalie de 1 a 5 estrelas:</p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setSurveyRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${star <= surveyRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-500'
                              } hover:text-yellow-400 hover:fill-yellow-400 transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comentário Livre */}
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Comentário (opcional):</label>
                    <textarea
                      value={surveyComment}
                      onChange={(e) => setSurveyComment(e.target.value)}
                      placeholder="Compartilhe sua opinião sobre o evento..."
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                      rows="4"
                    />
                  </div>

                  {/* Perguntas Adicionais */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-gray-300 mb-2">Você recomendaria este evento?</label>
                      <select
                        value={surveyAdditional.wouldRecommend}
                        onChange={(e) => setSurveyAdditional({ ...surveyAdditional, wouldRecommend: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                      >
                        <option value="">Selecione...</option>
                        <option value="sim">Sim, definitivamente</option>
                        <option value="talvez">Talvez</option>
                        <option value="nao">Não</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">O conteúdo atendeu suas expectativas?</label>
                      <select
                        value={surveyAdditional.metExpectations}
                        onChange={(e) => setSurveyAdditional({ ...surveyAdditional, metExpectations: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                      >
                        <option value="">Selecione...</option>
                        <option value="superou">Superou</option>
                        <option value="atendeu">Atendeu</option>
                        <option value="nao-atendeu">Não atendeu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Sugestões para próximos temas (opcional):</label>
                      <textarea
                        value={surveyAdditional.suggestions}
                        onChange={(e) => setSurveyAdditional({ ...surveyAdditional, suggestions: e.target.value })}
                        placeholder="Temas que gostaria de ver em futuros eventos..."
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                        rows="2"
                      />
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSkipSurvey}
                      className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                    >
                      Pular
                    </button>
                    <button
                      onClick={handleSubmitSurvey}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Enviar Avaliação
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }

      {/* Botão de Ver Resultados da Pesquisa (Moderador) */}
      {
        isModerator && allSurveyResults.length > 0 && (
          <div className="fixed bottom-4 left-4">
            <button
              onClick={() => setShowSatisfactionSurvey(true)}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 shadow-lg"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Ver Resultados ({allSurveyResults.length})</span>
            </button>
          </div>
        )
      }
    </div >
  );
};

export default EventRoom;

