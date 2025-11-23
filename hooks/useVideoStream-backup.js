import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook centralizado para gerenciamento de MediaStream e srcObject
 * Resolve problemas de dupla atribuição, race conditions e polling
 */
export const useVideoStream = () => {
  const streamRef = useRef(null);
  const isCreatingStreamRef = useRef(false);
  const activeAssignmentsRef = useRef(new Set());

  /**
   * 🔴 FUNÇÃO AUXILIAR: Obter ref do vídeo imutável
   */
  const getImmutableVideoRef = useCallback(() => {
    if (typeof window !== 'undefined' && window.kalonVideoRef) {
      return window.kalonVideoRef;
    }
    return null;
  }, []);

  /**
   * 🔴 FUNÇÃO PRINCIPAL: Única responsável por atribuir srcObject
   * Substitui todas as atribuições diretas no projeto
   */
  const assignStreamToVideo = useCallback(async (videoRef, stream, options = {}) => {
    const { 
      autoPlay = true, 
      waitForReady = true,
      maxWaitTime = 5000,
      elementName = 'video'
    } = options;

    console.log(`🎯 === INICIANDO assignStreamToVideo(${elementName}) ===`);
    console.log(`📋 Parâmetros:`, {
      hasVideoRef: !!videoRef,
      hasStream: !!stream,
      streamActive: stream?.active,
      streamId: stream?.id?.substring(0, 8),
      autoPlay,
      waitForReady,
      maxWaitTime
    });

    // Validação de parâmetros
    if (!stream) {
      console.warn(`⚠️ assignStreamToVideo(${elementName}): stream é null/undefined`);
      return false;
    }

    if (!stream.active) {
      console.warn(`⚠️ assignStreamToVideo(${elementName}): stream não está ativo`);
      return false;
    }

    if (!videoRef) {
      console.error(`❌ assignStreamToVideo(${elementName}): videoRef é null/undefined`);
      return false;
    }

    console.log(`🔍 Verificando videoRef.current...`);
    console.log(`📋 videoRef.current:`, {
      exists: !!videoRef.current,
      tagName: videoRef.current?.tagName,
      className: videoRef.current?.className,
      id: videoRef.current?.id,
      isConnected: videoRef.current ? document.contains(videoRef.current) : false
    });

    // Aguardar elemento estar pronto se solicitado
    if (waitForReady) {
      console.log(`⏳ Aguardando elemento ${elementName} ficar pronto...`);
      const isReady = await waitForVideoElement(videoRef, maxWaitTime, elementName);
      if (!isReady) {
        console.error(`❌ ${elementName} não ficou pronto em ${maxWaitTime}ms`);
        return false;
      }
    }

    const videoElement = videoRef.current;
    if (!videoElement) {
      console.error(`❌ ${elementName}.current é null após waitForReady`);
      return false;
    }

    console.log(`🔍 Estado do elemento antes da atribuição:`, {
      tagName: videoElement.tagName,
      currentSrcObject: videoElement.srcObject,
      readyState: videoElement.readyState,
      paused: videoElement.paused,
      videoWidth: videoElement.videoWidth,
      videoHeight: videoElement.videoHeight
    });

    // 🔴 VERIFICAÇÃO CRÍTICA: Evitar atribuição desnecessária
    if (videoElement.srcObject === stream) {
      console.log(`✅ ${elementName} srcObject já é o mesmo stream, pulando atribuição`);
      return true;
    }

    // Verificar se já há uma atribuição em andamento para este elemento
    if (activeAssignmentsRef.current.has(videoElement)) {
      console.warn(`⚠️ ${elementName} já tem atribuição em andamento, aguardando...`);
      return false;
    }

    try {
      // Marcar como em atribuição
      activeAssignmentsRef.current.add(videoElement);

      // 🔴 ATRIBUIÇÃO ÚNICA E CENTRALIZADA - COM VALIDAÇÃO ROBUSTA
      console.log(`🔗 === EXECUTANDO ATRIBUIÇÃO CRÍTICA ===`);
      console.log(`📋 Stream details PRÉ-ATRIBUIÇÃO:`, {
        id: stream.id,
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        tracks: stream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
          label: t.label
        }))
      });

      console.log(`🎯 EXECUTANDO: videoElement.srcObject = stream`);
      
      // Executar atribuição
      videoElement.srcObject = stream;
      
      console.log(`✅ Linha de atribuição executada! Validando IMEDIATAMENTE...`);
      
      // VALIDAÇÃO IMEDIATA E CRÍTICA
      const immediateValidation = {
        srcObjectSet: videoElement.srcObject === stream,
        srcObjectExists: !!videoElement.srcObject,
        srcObjectActive: videoElement.srcObject?.active,
        srcObjectId: videoElement.srcObject?.id?.substring(0, 8),
        readyState: videoElement.readyState,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
        paused: videoElement.paused,
        currentTime: videoElement.currentTime
      };
      
      console.log(`🔍 VALIDAÇÃO IMEDIATA PÓS-ATRIBUIÇÃO:`, immediateValidation);
      
      // VERIFICAR SE ATRIBUIÇÃO FOI BEM-SUCEDIDA
      if (!immediateValidation.srcObjectSet) {
        const errorMsg = `❌ FALHA CRÍTICA: srcObject NÃO foi atribuído corretamente!`;
        console.error(errorMsg);
        console.error(`📋 Detalhes do erro:`, {
          expectedStream: stream.id?.substring(0, 8),
          actualSrcObject: videoElement.srcObject,
          videoElementValid: !!videoElement,
          streamValid: !!stream && stream.active
        });
        
        showUserFriendlyError(
          'Erro na atribuição do vídeo',
          'Falha técnica ao conectar o stream ao elemento de vídeo. Tente recarregar a página.'
        );
        
        return false;
      }
      
      console.log(`🎉 SUCESSO: srcObject atribuído corretamente!`);
      
      // AGUARDAR E VERIFICAR EVENTOS DE VÍDEO
      console.log(`⏳ Aguardando eventos de vídeo (loadedmetadata, dimensões)...`);
      
      // Configurar listeners para eventos críticos
      let metadataLoaded = false;
      let dimensionsValid = false;
      
      const onLoadedMetadata = () => {
        metadataLoaded = true;
        console.log(`📺 EVENTO loadedmetadata disparado!`);
        console.log(`📐 Dimensões após loadedmetadata: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          dimensionsValid = true;
          console.log(`🎉 DIMENSÕES VÁLIDAS OBTIDAS!`);
        }
      };
      
      const onCanPlay = () => {
        console.log(`▶️ EVENTO canplay disparado! ReadyState: ${videoElement.readyState}`);
      };
      
      const onPlaying = () => {
        console.log(`🎬 EVENTO playing disparado! Vídeo reproduzindo.`);
      };
      
      // Registrar listeners temporários
      videoElement.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
      videoElement.addEventListener('canplay', onCanPlay, { once: true });
      videoElement.addEventListener('playing', onPlaying, { once: true });
      
      // Timeout para remover listeners se não dispararem
      setTimeout(() => {
        videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
        videoElement.removeEventListener('canplay', onCanPlay);
        videoElement.removeEventListener('playing', onPlaying);
        
        console.log(`📊 RELATÓRIO FINAL DE EVENTOS:`, {
          metadataLoaded,
          dimensionsValid,
          finalDimensions: `${videoElement.videoWidth}x${videoElement.videoHeight}`,
          finalReadyState: videoElement.readyState,
          finalPaused: videoElement.paused
        });
      }, 3000);

      // Auto-play se solicitado
      if (autoPlay) {
        console.log(`▶️ Iniciando auto-play...`);
        const playSuccess = await handleVideoPlay(videoElement, elementName);
        console.log(`🎬 Auto-play resultado: ${playSuccess ? 'SUCESSO' : 'FALHOU'}`);
        return playSuccess;
      }

      console.log(`✅ assignStreamToVideo(${elementName}) CONCLUÍDO COM SUCESSO`);
      return true;
    } catch (error) {
      console.error(`❌ ERRO CRÍTICO ao atribuir srcObject ao ${elementName}:`, error);
      console.error(`📋 Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return false;
    } finally {
      // Remover da lista de atribuições ativas
      activeAssignmentsRef.current.delete(videoElement);
      console.log(`🧹 ${elementName} removido da lista de atribuições ativas`);
    }
  }, []);

  /**
   * 🔴 FUNÇÃO AUXILIAR: Aguardar elemento estar pronto no DOM
   */
  const waitForVideoElement = useCallback(async (videoRef, maxWaitTime, elementName) => {
    const startTime = Date.now();
    let attempts = 0;

    while (Date.now() - startTime < maxWaitTime) {
      if (videoRef.current && videoRef.current.tagName === 'VIDEO') {
        console.log(`✅ ${elementName} está pronto após ${attempts} tentativas`);
        return true;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.error(`❌ ${elementName} não ficou pronto após ${attempts} tentativas em ${maxWaitTime}ms`);
    return false;
  }, []);

  /**
   * 🔴 FUNÇÃO AUXILIAR: Play com aguardo de dimensões (SEM POLLING)
   * Substitui o polling infinito por event-driven approach
   */
  const handleVideoPlay = useCallback(async (videoElement, elementName = 'video') => {
    return new Promise((resolve) => {
      let timeoutId;
      let attempts = 0;
      const maxAttempts = 60; // 3 segundos com intervalos de 50ms
      let resolved = false;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
        videoElement.removeEventListener('resize', onResize);
        videoElement.removeEventListener('canplay', onCanPlay);
      };

      const resolveOnce = (success, reason) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        
        if (success) {
          console.log(`✅ ${elementName} play() sucesso: ${reason}`);
        } else {
          console.warn(`⚠️ ${elementName} play() falhou: ${reason}`);
        }
        
        resolve(success);
      };

      const tryPlay = async () => {
        if (resolved) return;

        try {
          // Verificar se tem dimensões
          if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
            console.log(`📐 ${elementName} dimensões: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
            await videoElement.play();
            resolveOnce(true, 'dimensões válidas');
            return;
          }

          // Verificar se pode reproduzir
          if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
            console.log(`📊 ${elementName} readyState: ${videoElement.readyState}`);
            await videoElement.play();
            resolveOnce(true, 'readyState adequado');
            return;
          }

          // Tentar novamente se ainda há tentativas
          if (attempts < maxAttempts) {
            attempts++;
            timeoutId = setTimeout(tryPlay, 50);
          } else {
            // Timeout: tentar play() mesmo sem dimensões
            console.warn(`⏰ ${elementName} timeout aguardando dimensões, forçando play()`);
            try {
              await videoElement.play();
              resolveOnce(true, 'play() forçado após timeout');
            } catch (error) {
              resolveOnce(false, `play() forçado falhou: ${error.message}`);
            }
          }
        } catch (error) {
          if (attempts < maxAttempts) {
            attempts++;
            timeoutId = setTimeout(tryPlay, 50);
          } else {
            resolveOnce(false, `play() falhou após ${maxAttempts} tentativas: ${error.message}`);
          }
        }
      };

      // 🔴 EVENT LISTENERS: Método principal (substitui polling)
      const onLoadedMetadata = () => {
        console.log(`📺 ${elementName} loadedmetadata event`);
        tryPlay();
      };

      const onResize = () => {
        console.log(`📏 ${elementName} resize event`);
        tryPlay();
      };

      const onCanPlay = () => {
        console.log(`▶️ ${elementName} canplay event`);
        tryPlay();
      };

      // Registrar event listeners
      videoElement.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
      videoElement.addEventListener('resize', onResize, { once: true });
      videoElement.addEventListener('canplay', onCanPlay, { once: true });

      // Iniciar primeira tentativa
      tryPlay();

      // Timeout de segurança
      setTimeout(() => {
        if (!resolved) {
          resolveOnce(false, 'timeout geral de segurança');
        }
      }, maxAttempts * 50 + 1000);
    });
  }, []);

  /**
   * 🔴 FUNÇÃO AUXILIAR: Limpar srcObject de forma segura
   */
  const clearVideoStream = useCallback((videoRef, elementName = 'video') => {
    if (!videoRef?.current) {
      console.warn(`⚠️ clearVideoStream(${elementName}): videoRef é null`);
      return false;
    }

    try {
      console.log(`🧹 Limpando srcObject do ${elementName}`);
      
      // Parar reprodução se estiver ativa
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      }

      // Limpar srcObject
      videoRef.current.srcObject = null;
      
      // Remover da lista de atribuições ativas
      activeAssignmentsRef.current.delete(videoRef.current);
      
      return true;
    } catch (error) {
      console.error(`❌ Erro ao limpar srcObject do ${elementName}:`, error);
      return false;
    }
  }, []);

  /**
   * 🔴 FUNÇÃO AUXILIAR: Criar MediaStream com proteção robusta e fallbacks
   */
  const createMediaStream = useCallback(async (constraints = { video: true, audio: true }) => {
    console.log('🎯 === INICIANDO createMediaStream ROBUSTO ===');
    
    // 1. PROTEÇÃO CONTRA MÚLTIPLAS CHAMADAS SIMULTÂNEAS
    if (isCreatingStreamRef.current) {
      console.log('⏳ Stream já está sendo criado, aguardando conclusão...');
      
      // Aguardar criação atual terminar com timeout
      let attempts = 0;
      while (isCreatingStreamRef.current && attempts < 100) { // 10 segundos
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (streamRef.current && streamRef.current.active) {
        console.log('✅ Stream criado por outra chamada, reutilizando');
        return streamRef.current;
      }
      
      console.warn('⚠️ Chamada anterior não concluiu, prosseguindo...');
    }

    // 2. REUTILIZAR STREAM EXISTENTE SE AINDA ESTIVER ATIVO
    if (streamRef.current && streamRef.current.active) {
      console.log('✅ Stream já existe e está ativo, reutilizando');
      return streamRef.current;
    }

    try {
      isCreatingStreamRef.current = true;
      
      // 3. DIAGNOSTICAR DISPOSITIVOS ANTES DE TENTAR STREAM
      console.log('🔍 Diagnosticando dispositivos disponíveis...');
      let devices = [];
      try {
        devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        const audioDevices = devices.filter(d => d.kind === 'audioinput');
        
        console.log('📋 Dispositivos encontrados:', {
          total: devices.length,
          video: videoDevices.length,
          audio: audioDevices.length,
          videoDevices: videoDevices.map(d => ({
            label: d.label || 'Dispositivo sem nome',
            deviceId: d.deviceId.substring(0, 8) + '...'
          }))
        });
        
        if (videoDevices.length === 0) {
          const errorMsg = '❌ ERRO CRÍTICO: Nenhum dispositivo de vídeo encontrado';
          console.error(errorMsg);
          showUserFriendlyError('Nenhuma câmera detectada', 'Verifique se sua câmera está conectada e funcionando.');
          return null;
        }
      } catch (deviceError) {
        console.warn('⚠️ Não foi possível enumerar dispositivos:', deviceError.message);
      }

      // 4. FALLBACK PROGRESSIVO COM DIFERENTES CONSTRAINTS
      const fallbackConstraints = [
        { video: true, audio: true }, // Tentativa original
        { video: true, audio: false }, // Só vídeo
        { video: { width: 1280, height: 720 }, audio: false }, // HD específico
        { video: { width: 640, height: 480 }, audio: false }, // SD específico
        { video: { width: 320, height: 240 }, audio: false }, // Baixa resolução
        { video: { facingMode: 'user' }, audio: false }, // Câmera frontal específica
      ];

      let stream = null;
      let lastError = null;

      for (let i = 0; i < fallbackConstraints.length; i++) {
        const currentConstraints = fallbackConstraints[i];
        console.log(`🎯 Tentativa ${i + 1}/${fallbackConstraints.length}:`, currentConstraints);

        try {
          // 5. IMPLEMENTAR TIMEOUT ROBUSTO
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('getUserMedia timeout após 10 segundos')), 10000)
          );
          
          const streamPromise = navigator.mediaDevices.getUserMedia(currentConstraints);
          
          console.log('⏳ Aguardando getUserMedia com timeout de 10s...');
          stream = await Promise.race([streamPromise, timeoutPromise]);
          
          console.log(`✅ getUserMedia SUCESSO na tentativa ${i + 1}:`, {
            streamId: stream.id?.substring(0, 8) || 'no-id',
            active: stream.active,
            videoTracks: stream.getVideoTracks().length,
            audioTracks: stream.getAudioTracks().length
          });
          
          break; // Sucesso, sair do loop
          
        } catch (error) {
          lastError = error;
          console.warn(`⚠️ Tentativa ${i + 1} falhou:`, {
            name: error.name,
            message: error.message,
            constraints: currentConstraints
          });
          
          // Aguardar um pouco antes da próxima tentativa
          if (i < fallbackConstraints.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      // 6. VERIFICAR SE OBTIVEMOS STREAM
      if (!stream) {
        const errorMsg = '❌ FALHA CRÍTICA: Todas as tentativas de getUserMedia falharam';
        console.error(errorMsg, lastError);
        
        // Mostrar erro user-friendly baseado no tipo de erro
        if (lastError) {
          handleUserMediaError(lastError);
        } else {
          showUserFriendlyError('Erro desconhecido', 'Não foi possível acessar a câmera. Tente recarregar a página.');
        }
        
        return null;
      }

      // 7. CONFIGURAR TRACKS (DESABILITADOS INICIALMENTE)
      console.log('🔧 Configurando tracks do stream...');
      stream.getVideoTracks().forEach((track, index) => {
        track.enabled = false;
        console.log(`📹 Video track ${index + 1} configurado:`, {
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: track.getSettings()
        });
      });
      
      stream.getAudioTracks().forEach((track, index) => {
        track.enabled = false;
        console.log(`🎤 Audio track ${index + 1} configurado:`, {
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState
        });
      });

      // 8. SALVAR E RETORNAR STREAM
      streamRef.current = stream;
      console.log('🎉 MediaStream criado com SUCESSO TOTAL:', {
        id: stream.id?.substring(0, 8) || 'no-id',
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });

      // TEMPORARIAMENTE DESABILITADO - OVERLAY AUTOMÁTICO
      // showUserFriendlySuccess('Câmera ativada com sucesso!');
      return stream;

    } catch (error) {
      console.error('❌ ERRO CRÍTICO INESPERADO em createMediaStream:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      handleUserMediaError(error);
      return null;
      
    } finally {
      isCreatingStreamRef.current = false;
      console.log('🧹 createMediaStream finalizado, flag limpa');
    }
  }, []);

  /**
   * 🔴 FUNÇÃO AUXILIAR: Tratar erros do getUserMedia de forma user-friendly
   */
  const handleUserMediaError = useCallback((error) => {
    console.log('🔍 Analisando erro getUserMedia:', error);
    
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        showUserFriendlyError(
          'Permissão negada',
          'Clique no ícone da câmera na barra de endereços e permita o acesso à câmera e microfone.'
        );
        break;
        
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        showUserFriendlyError(
          'Câmera não encontrada',
          'Verifique se sua câmera está conectada e funcionando. Tente reiniciar o navegador.'
        );
        break;
        
      case 'NotReadableError':
      case 'TrackStartError':
        showUserFriendlyError(
          'Câmera em uso',
          'Feche outros aplicativos que possam estar usando a câmera (Zoom, Teams, Skype, etc.).'
        );
        break;
        
      case 'OverconstrainedError':
      case 'ConstraintNotSatisfiedError':
        showUserFriendlyError(
          'Configuração não suportada',
          'Sua câmera não suporta as configurações solicitadas. Tente usar um navegador diferente.'
        );
        break;
        
      case 'NotSupportedError':
        showUserFriendlyError(
          'Navegador não suportado',
          'Use Chrome, Firefox, Safari ou Edge mais recentes. Evite navegadores muito antigos.'
        );
        break;
        
      case 'AbortError':
        showUserFriendlyError(
          'Operação cancelada',
          'A ativação da câmera foi interrompida. Tente novamente.'
        );
        break;
        
      default:
        if (error.message.includes('timeout')) {
          showUserFriendlyError(
            'Timeout da câmera',
            'A câmera demorou muito para responder. Verifique se não há outros apps usando a câmera.'
          );
        } else {
          showUserFriendlyError(
            'Erro desconhecido',
            `Erro técnico: ${error.message}. Tente recarregar a página ou usar outro navegador.`
          );
        }
    }
  }, []);

  /**
   * 🔴 FUNÇÃO AUXILIAR: Mostrar erro user-friendly
   */
  const showUserFriendlyError = useCallback((title, message) => {
    console.error(`🚨 ERRO PARA USUÁRIO: ${title} - ${message}`);
    
    // Tentar mostrar no diagnóstico visual se disponível
    if (typeof window !== 'undefined') {
      // Criar overlay temporário se não houver diagnóstico
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #ef4444; color: white; padding: 16px; border-radius: 8px;
        max-width: 300px; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      overlay.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">❌ ${title}</div>
        <div>${message}</div>
      `;
      
      document.body.appendChild(overlay);
      
      // Remover após 10 segundos
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 10000);
    }
  }, []);

  /**
   * 🔴 FUNÇÃO AUXILIAR: Mostrar sucesso user-friendly
   */
  const showUserFriendlySuccess = useCallback((message) => {
    console.log(`🎉 SUCESSO PARA USUÁRIO: ${message}`);
    
    if (typeof window !== 'undefined') {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #10b981; color: white; padding: 16px; border-radius: 8px;
        max-width: 300px; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      overlay.innerHTML = `
        <div style="font-weight: bold;">✅ ${message}</div>
      `;
      
      document.body.appendChild(overlay);
      
      // Remover após 3 segundos
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 3000);
    }
  }, []);

  /**
   * 🔴 FUNÇÃO AUXILIAR: Obter stream atual
   */
  const getCurrentStream = useCallback(() => {
    return streamRef.current;
  }, []);

  /**
   * 🔴 FUNÇÃO AUXILIAR: Verificar se stream está ativo
   */
  const isStreamActive = useCallback(() => {
    return streamRef.current && streamRef.current.active;
  }, []);

  /**
   * 🔴 FUNÇÃO AUXILIAR: Validar se atribuição foi bem-sucedida
   */
  const validateStreamAssignment = useCallback((videoRef, stream, elementName = 'video') => {
    if (!videoRef?.current || !stream) {
      return { success: false, reason: 'Parâmetros inválidos' };
    }

    const videoElement = videoRef.current;
    const validation = {
      srcObjectMatches: videoElement.srcObject === stream,
      srcObjectActive: videoElement.srcObject?.active,
      streamActive: stream.active,
      hasVideoTracks: stream.getVideoTracks().length > 0,
      hasAudioTracks: stream.getAudioTracks().length > 0,
      readyState: videoElement.readyState,
      videoWidth: videoElement.videoWidth,
      videoHeight: videoElement.videoHeight,
      paused: videoElement.paused,
      currentTime: videoElement.currentTime
    };

    const success = validation.srcObjectMatches && validation.srcObjectActive && validation.streamActive;
    
    console.log(`🔍 Validação de atribuição ${elementName}:`, {
      success,
      ...validation
    });

    return {
      success,
      validation,
      reason: success ? 'Atribuição válida' : 'Falha na validação'
    };
  }, []);

  /**
   * 🔴 CLEANUP: Limpar recursos ao desmontar
   */
  useEffect(() => {
    return () => {
      console.log('🧹 useVideoStream cleanup iniciado');
      
      // Parar todos os tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Track parado:', track.kind, track.label);
        });
        streamRef.current = null;
      }

      // Limpar flags
      isCreatingStreamRef.current = false;
      activeAssignmentsRef.current.clear();
      
      console.log('✅ useVideoStream cleanup concluído');
    };
  }, []);

  return {
    // Refs
    streamRef,
    
    // Funções principais
    assignStreamToVideo,
    clearVideoStream,
    createMediaStream,
    
    // Funções auxiliares
    getCurrentStream,
    isStreamActive,
    getImmutableVideoRef,
    validateStreamAssignment,
    
    // Funções de UI/UX
    showUserFriendlyError,
    showUserFriendlySuccess,
    handleUserMediaError,
    
    // Para debugging
    _internal: {
      isCreatingStream: () => isCreatingStreamRef.current,
      activeAssignments: () => Array.from(activeAssignmentsRef.current)
    }
  };
};
