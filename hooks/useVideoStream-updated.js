import { useRef, useCallback, useEffect } from 'react';

export const useVideoStream = () => {
  const streamRef = useRef(null);
  const isCreatingStreamRef = useRef(false);
  const activeAssignmentsRef = useRef(new Set());

  /**
   * 🔴 FUNÇÃO AUXILIAR: Obter ref imutável do vídeo
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

    console.log(`🎯 === INICIANDO assignStreamToVideo para ${elementName} ===`);
    console.log('📋 Parâmetros recebidos:', {
      videoRef: !!videoRef,
      stream: !!stream,
      streamId: stream?.id?.substring(0, 8) || 'no-stream',
      streamActive: stream?.active,
      autoPlay,
      waitForReady,
      maxWaitTime,
      elementName
    });

    // 1. VALIDAÇÕES INICIAIS
    if (!videoRef) {
      console.error(`❌ ${elementName}: videoRef é null ou undefined`);
      return false;
    }

    if (!stream) {
      console.error(`❌ ${elementName}: stream é null ou undefined`);
      return false;
    }

    if (!stream.active) {
      console.error(`❌ ${elementName}: stream não está ativo`);
      return false;
    }

    // 2. AGUARDAR ELEMENTO ESTAR PRONTO (SE SOLICITADO)
    let videoElement = videoRef.current;
    
    if (waitForReady && !videoElement) {
      console.log(`⏳ ${elementName}: Aguardando elemento ficar disponível...`);
      const isReady = await waitForVideoElement(videoRef, maxWaitTime, elementName);
      
      if (!isReady) {
        console.error(`❌ ${elementName}: Elemento não ficou pronto no tempo limite`);
        return false;
      }
      
      videoElement = videoRef.current;
    }

    if (!videoElement) {
      console.error(`❌ ${elementName}: Elemento ainda não está disponível`);
      return false;
    }

    // 3. VERIFICAR SE JÁ ESTÁ SENDO PROCESSADO
    if (activeAssignmentsRef.current.has(videoElement)) {
      console.warn(`⚠️ ${elementName}: Atribuição já em andamento, aguardando...`);
      
      // Aguardar atribuição atual terminar
      let attempts = 0;
      while (activeAssignmentsRef.current.has(videoElement) && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (activeAssignmentsRef.current.has(videoElement)) {
        console.error(`❌ ${elementName}: Timeout aguardando atribuição anterior`);
        return false;
      }
    }

    // 4. MARCAR COMO EM PROCESSAMENTO
    activeAssignmentsRef.current.add(videoElement);
    console.log(`🔒 ${elementName} marcado como em processamento`);

    try {
      // 5. LOGS PRÉ-ATRIBUIÇÃO
      console.log(`📊 ${elementName} - Estado PRÉ-atribuição:`, {
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
        readyState: videoElement.readyState,
        paused: videoElement.paused,
        currentSrcObject: !!videoElement.srcObject,
        currentSrcObjectId: videoElement.srcObject?.id?.substring(0, 8) || 'none'
      });

      // 6. LOGS DO STREAM PRÉ-ATRIBUIÇÃO
      console.log(`📊 Stream - Detalhes PRÉ-atribuição:`, {
        id: stream.id?.substring(0, 8) || 'no-id',
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoTrackDetails: stream.getVideoTracks().map(track => ({
          id: track.id?.substring(0, 8) || 'no-id',
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          settings: track.getSettings ? track.getSettings() : 'N/A'
        })),
        audioTrackDetails: stream.getAudioTracks().map(track => ({
          id: track.id?.substring(0, 8) || 'no-id',
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState
        }))
      });

      // 7. ATRIBUIÇÃO CRÍTICA DO srcObject
      console.log(`🔗 === EXECUTANDO ATRIBUIÇÃO CRÍTICA ===`);
      console.log(`🎯 EXECUTANDO: videoElement.srcObject = stream`);
      videoElement.srcObject = stream;
      console.log(`✅ Linha de atribuição executada! Validando IMEDIATAMENTE...`);

      // 8. VALIDAÇÃO IMEDIATA PÓS-ATRIBUIÇÃO
      const immediateValidation = {
        srcObjectSet: videoElement.srcObject === stream,
        srcObjectExists: !!videoElement.srcObject,
        srcObjectActive: videoElement.srcObject?.active,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
        readyState: videoElement.readyState,
        paused: videoElement.paused
      };
      console.log('📋 Validação imediata após srcObject = stream:', immediateValidation);

      if (!immediateValidation.srcObjectSet) {
        const errorMsg = `❌ FALHA CRÍTICA: srcObject NÃO foi atribuído corretamente!`;
        console.error(errorMsg);
        showUserFriendlyError('Erro na atribuição do vídeo', 'Falha técnica ao conectar o stream. Tente novamente.');
        return false;
      }

      // 9. ADICIONAR EVENTOS EXTRAS AO VÍDEO
      console.log(`🎧 Adicionando eventos extras ao ${elementName}...`);
      
      // Eventos de erro
      videoElement.onerror = (event) => {
        console.error(`❌ ${elementName} - Evento ERROR:`, event);
        console.error('   Detalhes do erro:', {
          error: videoElement.error,
          networkState: videoElement.networkState,
          readyState: videoElement.readyState
        });
      };

      // Eventos de carregamento
      videoElement.onwaiting = () => {
        console.warn(`⏳ ${elementName} - Evento WAITING: Aguardando dados`);
      };

      videoElement.onstalled = () => {
        console.warn(`🚫 ${elementName} - Evento STALLED: Download travado`);
      };

      videoElement.oncanplay = () => {
        console.log(`✅ ${elementName} - Evento CANPLAY: Pode reproduzir`);
        console.log(`   📐 Dimensões após canplay: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
      };

      videoElement.onloadeddata = () => {
        console.log(`📊 ${elementName} - Evento LOADEDDATA: Dados carregados`);
        console.log(`   📐 Dimensões após loadeddata: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
      };

      videoElement.onplaying = () => {
        console.log(`🎬 ${elementName} - Evento PLAYING: Reproduzindo`);
        console.log(`   📐 Dimensões durante playing: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
      };

      // 10. AUTOPLAY (SE SOLICITADO)
      if (autoPlay) {
        console.log(`▶️ ${elementName}: Iniciando autoplay...`);
        const playSuccess = await handleVideoPlay(videoElement, elementName);
        
        if (playSuccess) {
          console.log(`✅ ${elementName}: Autoplay bem-sucedido`);
        } else {
          console.warn(`⚠️ ${elementName}: Autoplay falhou, mas srcObject foi atribuído`);
        }
      }

      // 11. LOGS FINAIS PÓS-ATRIBUIÇÃO
      console.log(`📊 ${elementName} - Estado FINAL:`, {
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
        readyState: videoElement.readyState,
        paused: videoElement.paused,
        srcObject: !!videoElement.srcObject,
        srcObjectId: videoElement.srcObject?.id?.substring(0, 8) || 'none',
        srcObjectActive: videoElement.srcObject?.active
      });

      console.log(`✅ === assignStreamToVideo CONCLUÍDO COM SUCESSO para ${elementName} ===`);
      return true;

    } catch (error) {
      console.error(`❌ Erro durante assignStreamToVideo para ${elementName}:`, error);
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
    
    while (!videoRef.current && (Date.now() - startTime) < maxWaitTime) {
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
  const handleVideoPlay = useCallback(async (videoElement, elementName = 'video', maxAttempts = 20) => {
    console.log(`▶️ ${elementName}: Iniciando handleVideoPlay...`);

    return new Promise((resolve) => {
      let resolved = false;
      let attempts = 0;

      const resolveOnce = (success, reason) => {
        if (!resolved) {
          resolved = true;
          console.log(`🎯 ${elementName}: handleVideoPlay ${success ? 'SUCESSO' : 'FALHOU'} - ${reason}`);
          resolve(success);
        }
      };

      const checkDimensions = () => {
        attempts++;
        console.log(`🔍 ${elementName}: Tentativa ${attempts}/${maxAttempts} - Dimensões: ${videoElement.videoWidth}x${videoElement.videoHeight}`);

        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          resolveOnce(true, `dimensões válidas: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
          return;
        }

        if (attempts >= maxAttempts) {
          resolveOnce(false, `timeout após ${maxAttempts} tentativas`);
          return;
        }

        // Próxima tentativa
        setTimeout(checkDimensions, 50);
      };

      // Event listeners para acelerar detecção
      const onLoadedMetadata = () => {
        console.log(`📊 ${elementName}: loadedmetadata - ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          resolveOnce(true, `loadedmetadata com dimensões: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        }
      };

      const onCanPlay = () => {
        console.log(`✅ ${elementName}: canplay - ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          resolveOnce(true, `canplay com dimensões: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        }
      };

      const onPlaying = () => {
        console.log(`🎬 ${elementName}: playing - ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          resolveOnce(true, `playing com dimensões: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        }
      };

      // Adicionar listeners temporários
      videoElement.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
      videoElement.addEventListener('canplay', onCanPlay, { once: true });
      videoElement.addEventListener('playing', onPlaying, { once: true });

      // Tentar play
      const playPromise = videoElement.play();
      
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            console.log(`▶️ ${elementName}: play() promise resolvida`);
            // Iniciar verificação de dimensões
            setTimeout(checkDimensions, 10);
          })
          .catch((error) => {
            console.error(`❌ ${elementName}: play() promise rejeitada:`, error);
            resolveOnce(false, `play() falhou: ${error.message}`);
          });
      } else {
        console.log(`▶️ ${elementName}: play() sem promise`);
        // Iniciar verificação de dimensões
        setTimeout(checkDimensions, 10);
      }

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
    console.log(`🧹 Limpando srcObject do ${elementName}...`);
    
    try {
      if (!videoRef || !videoRef.current) {
        console.warn(`⚠️ ${elementName}: Ref não disponível para limpeza`);
        return false;
      }

      const videoElement = videoRef.current;
      
      if (videoElement.srcObject) {
        console.log(`🔗 ${elementName}: Removendo srcObject atual`);
        videoElement.srcObject = null;
        console.log(`✅ ${elementName}: srcObject removido`);
      } else {
        console.log(`ℹ️ ${elementName}: Nenhum srcObject para remover`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Erro ao limpar srcObject do ${elementName}:`, error);
      return false;
    }
  }, []);

  /**
   * 🔴 FUNÇÃO AUXILIAR: Criar MediaStream com testes de constraints variadas
   */
  const createMediaStream = useCallback(async (constraints = { video: true, audio: true }) => {
    console.log('🎯 === INICIANDO TESTE COMPLETO DE CONSTRAINTS ===');
    
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

      // 🔬 4. CONSTRAINTS DE TESTE VARIADAS CONFORME SOLICITADO
      const testConstraints = [
        { name: 'HD 720p', constraints: { video: { width: 1280, height: 720 }, audio: true } },
        { name: 'VGA 480p', constraints: { video: { width: 640, height: 480 }, audio: true } },
        { name: 'Básico Width True', constraints: { video: { width: true }, audio: true } },
        { name: 'User Facing', constraints: { video: { facingMode: "user" }, audio: true } },
        { name: 'Full HD 1080p', constraints: { video: { width: 1920, height: 1080 }, audio: true } }
      ];

      let successfulStream = null;
      const testResults = [];
      let cameraLightStatus = 'Desconhecido';

      console.log('\n🧪 === INICIANDO TESTES DE CONSTRAINTS VARIADAS ===');
      
      for (const test of testConstraints) {
        try {
          console.log(`\n🔄 TESTANDO: ${test.name}`);
          console.log('📋 Constraints:', JSON.stringify(test.constraints, null, 2));
          
          const testStartTime = Date.now();
          
          // Timeout de 15 segundos para cada teste
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('getUserMedia timeout após 15 segundos')), 15000)
          );
          
          const streamPromise = navigator.mediaDevices.getUserMedia(test.constraints);
          const stream = await Promise.race([streamPromise, timeoutPromise]);
          const testDuration = Date.now() - testStartTime;
          
          console.log(`✅ SUCESSO: ${test.name} em ${testDuration}ms`);
          
          // 📊 ANÁLISE DETALHADA DO STREAM
          const videoTracks = stream.getVideoTracks();
          const audioTracks = stream.getAudioTracks();
          
          const streamAnalysis = {
            name: test.name,
            success: true,
            duration: testDuration,
            stream: {
              id: stream.id?.substring(0, 8) || 'no-id',
              active: stream.active,
              videoTracks: videoTracks.length,
              audioTracks: audioTracks.length
            },
            videoTrackDetails: videoTracks.map(track => {
              const settings = track.getSettings ? track.getSettings() : {};
              return {
                id: track.id?.substring(0, 8) || 'no-id',
                kind: track.kind,
                label: track.label,
                enabled: track.enabled,
                muted: track.muted,
                readyState: track.readyState,
                settings: settings,
                dimensions: settings.width && settings.height ? `${settings.width}x${settings.height}` : 'N/A',
                frameRate: settings.frameRate || 'N/A'
              };
            }),
            audioTrackDetails: audioTracks.map(track => ({
              id: track.id?.substring(0, 8) || 'no-id',
              kind: track.kind,
              label: track.label,
              enabled: track.enabled,
              muted: track.muted,
              readyState: track.readyState
            }))
          };

          console.log('📊 Análise Detalhada do Stream:', streamAnalysis);
          
          // Verificar se a luz da câmera acendeu (heurística baseada em tracks ativos)
          if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
            cameraLightStatus = '🟢 Luz da câmera ACESA (track ativo)';
          } else {
            cameraLightStatus = '🔴 Luz da câmera APAGADA (track inativo)';
          }
          
          console.log(`💡 Status da câmera: ${cameraLightStatus}`);
          streamAnalysis.cameraLightStatus = cameraLightStatus;
          
          testResults.push(streamAnalysis);

          // Usar o primeiro stream bem-sucedido
          if (!successfulStream) {
            successfulStream = stream;
            console.log(`🎯 USANDO STREAM: ${test.name} como stream principal`);
            
            // Desabilitar áudio por padrão
            stream.getAudioTracks().forEach(track => {
              track.enabled = false;
              console.log('🔇 Track de áudio desabilitado por padrão');
            });
            
            // Atualizar referência
            streamRef.current = stream;
          } else {
            // Parar streams de teste adicionais
            stream.getTracks().forEach(track => track.stop());
            console.log(`🛑 Stream de teste ${test.name} parado (não é o principal)`);
          }

        } catch (error) {
          const testResult = {
            name: test.name,
            success: false,
            error: {
              name: error.name,
              message: error.message,
              code: error.code || 'N/A'
            },
            cameraLightStatus: '🔴 Luz da câmera APAGADA (erro no teste)'
          };
          
          console.error(`❌ FALHOU: ${test.name}`, error);
          testResults.push(testResult);
          
          // Erros fatais - parar todos os testes
          if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
            console.error('🚫 ERRO FATAL - Parando todos os testes');
            handleUserMediaError(error);
            break;
          }
        }
      }

      // 📋 RELATÓRIO FINAL DOS TESTES
      console.log('\n📋 === RELATÓRIO FINAL DOS TESTES DE CONSTRAINTS ===');
      let hasSuccessfulVideo = false;
      let bestDimensions = '0x0';
      
      testResults.forEach((result, index) => {
        if (result.success) {
          console.log(`✅ ${index + 1}. ${result.name}: SUCESSO (${result.duration}ms)`);
          console.log(`   💡 ${result.cameraLightStatus}`);
          
          if (result.videoTrackDetails[0]?.settings) {
            const settings = result.videoTrackDetails[0].settings;
            const dimensions = `${settings.width || 0}x${settings.height || 0}`;
            console.log(`   📐 Dimensões: ${dimensions}`);
            console.log(`   🎥 Frame Rate: ${settings.frameRate || 'N/A'} fps`);
            
            // Verificar se trouxe vídeo real (dimensões > 2x2)
            if (settings.width > 2 && settings.height > 2) {
              hasSuccessfulVideo = true;
              if (settings.width * settings.height > parseInt(bestDimensions.split('x')[0]) * parseInt(bestDimensions.split('x')[1])) {
                bestDimensions = dimensions;
              }
            }
          }
        } else {
          console.log(`❌ ${index + 1}. ${result.name}: FALHOU - ${result.error.message}`);
          console.log(`   💡 ${result.cameraLightStatus}`);
        }
      });

      // 🎯 ANÁLISE FINAL E RECOMENDAÇÕES
      console.log('\n🎯 === ANÁLISE FINAL ===');
      if (hasSuccessfulVideo) {
        console.log(`✅ SUCESSO: Vídeo real obtido com dimensões máximas: ${bestDimensions}`);
      } else {
        console.log('❌ FALHA: Nenhum teste trouxe vídeo com dimensões > 2x2');
        console.log('🔧 RECOMENDAÇÕES:');
        console.log('   1. Testar outro dispositivo/câmera');
        console.log('   2. Atualizar drivers da câmera');
        console.log('   3. Reiniciar o sistema antes de nova rodada');
        console.log('   4. Verificar se outra aplicação está usando a câmera');
        console.log('   5. Testar em outro navegador (Chrome, Firefox, Edge)');
      }

      if (successfulStream) {
        console.log('✅ === createMediaStream CONCLUÍDO COM SUCESSO ===');
        console.log('🎯 Stream final selecionado:', successfulStream.id?.substring(0, 8) || 'no-id');
        return successfulStream;
      } else {
        console.error('❌ NENHUM TESTE FOI BEM-SUCEDIDO');
        handleUserMediaError(new Error('AbortError: Todos os testes de constraints falharam.'));
        return null;
      }
      
    } catch (error) {
      console.error('❌ ERRO INESPERADO em createMediaStream:', error);
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
    console.error('❌ Erro em getUserMedia:', error);
    
    switch (error.name) {
      case 'NotAllowedError':
        showUserFriendlyError(
          'Permissão negada',
          'Acesso à câmera foi negado. Clique no ícone da câmera na barra de endereços e permita o acesso.'
        );
        break;
        
      case 'NotFoundError':
        showUserFriendlyError(
          'Câmera não encontrada',
          'Nenhuma câmera foi detectada. Verifique se sua câmera está conectada e funcionando.'
        );
        break;
        
      case 'NotReadableError':
        showUserFriendlyError(
          'Câmera em uso',
          'A câmera está sendo usada por outro aplicativo. Feche outros programas que possam estar usando a câmera.'
        );
        break;
        
      case 'OverconstrainedError':
        showUserFriendlyError(
          'Configuração não suportada',
          'As configurações de vídeo solicitadas não são suportadas pela sua câmera. Tentando configurações alternativas...'
        );
        break;
        
      case 'SecurityError':
        showUserFriendlyError(
          'Erro de segurança',
          'Acesso à câmera bloqueado por questões de segurança. Verifique se está usando HTTPS ou localhost.'
        );
        break;
        
      default:
        if (error.message && error.message.includes('timeout')) {
          showUserFriendlyError(
            'Timeout na câmera',
            'A câmera demorou muito para responder. Tente novamente ou reinicie o navegador.'
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
    console.error(`🚨 ${title}: ${message}`);
    
    if (typeof window !== 'undefined') {
      // Criar overlay de erro
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: #dc2626; color: white; padding: 16px; border-radius: 8px;
        max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: system-ui, -apple-system, sans-serif; font-size: 14px;
      `;
      overlay.innerHTML = `<strong>${title}</strong><br>${message}`;
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
    console.log(`✅ ${message}`);
    
    if (typeof window !== 'undefined') {
      // Criar overlay de sucesso
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: #16a34a; color: white; padding: 16px; border-radius: 8px;
        max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: system-ui, -apple-system, sans-serif; font-size: 14px;
      `;
      overlay.innerHTML = message;
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
    console.log(`🔍 Validando atribuição do ${elementName}...`);
    
    if (!videoRef || !videoRef.current) {
      return { success: false, reason: 'Ref não disponível', validation: null };
    }

    const videoElement = videoRef.current;
    const validation = {
      srcObjectExists: !!videoElement.srcObject,
      srcObjectMatches: videoElement.srcObject === stream,
      srcObjectActive: videoElement.srcObject?.active || false,
      videoWidth: videoElement.videoWidth,
      videoHeight: videoElement.videoHeight,
      readyState: videoElement.readyState,
      paused: videoElement.paused
    };

    const success = validation.srcObjectExists && 
                   validation.srcObjectMatches && 
                   validation.srcObjectActive;

    console.log(`📋 Validação do ${elementName}:`, validation);
    
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
      console.log('🧹 Limpando useVideoStream...');
      
      // Parar stream atual
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`🛑 Track ${track.kind} parado`);
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
    
    // Funções de UI
    showUserFriendlyError,
    showUserFriendlySuccess
  };
};


