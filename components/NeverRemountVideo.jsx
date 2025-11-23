"use client";

import React, { useEffect, useRef } from "react";

// 🔥 STREAM GLOBAL ULTRA-PERSISTENTE - Sobrevive a TUDO
let ultraGlobalStream = null;
let ultraGlobalVideoElement = null;
let isUltraStreamActive = false;

/**
 * 🔥 COMPONENTE QUE NUNCA REMONTA
 * - Usa DOM direto para evitar React re-renders
 * - Stream persiste independentemente de qualquer mudança
 * - Imune a HMR, Fast Refresh, e qualquer re-render
 */
const NeverRemountVideo = () => {
  const containerRef = useRef(null);
  const videoElementRef = useRef(null);

  useEffect(() => {
    console.log('🔥 NeverRemountVideo: Inicializando (deve ser APENAS UMA VEZ)');
    
    // Criar elemento de vídeo diretamente no DOM
    if (!videoElementRef.current && containerRef.current) {
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      // Estilos ultra-forçados para garantir visibilidade
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.background = '#000';
      video.style.borderRadius = '12px';
      video.style.display = 'block !important';
      video.style.visibility = 'visible !important';
      video.style.opacity = '1 !important';
      video.style.zIndex = '9999 !important';
      video.style.position = 'relative !important';
      video.style.minWidth = '320px';
      video.style.minHeight = '240px';
      video.style.maxWidth = '100%';
      video.style.maxHeight = '100%';
      
      containerRef.current.appendChild(video);
      videoElementRef.current = video;
      ultraGlobalVideoElement = video;
      
      console.log('🔥 Elemento de vídeo criado diretamente no DOM');
    }
    
    // Função de ativação ultra-persistente com controle de conflitos
    const ultraActivateCamera = async () => {
      console.log('🔥 === ATIVAÇÃO ULTRA-PERSISTENTE COM CONTROLE DE CONFLITOS ===');
      
      try {
        // Verificar se já existe stream ativo
        if (ultraGlobalStream && ultraGlobalStream.active) {
          console.log('♻️ Reutilizando stream ultra-global existente');
          if (ultraGlobalVideoElement) {
            ultraGlobalVideoElement.srcObject = ultraGlobalStream;
            await ultraGlobalVideoElement.play();
            console.log('🔥 Stream reutilizado com sucesso');
          }
          return ultraGlobalStream;
        }
        
        console.log('🔄 Iniciando criação de novo stream...');
        
        // Estratégias específicas para câmeras Logitech (evitar conflitos)
        const strategies = [
          // Estratégia 1: Logitech otimizada - configuração estável
          { 
            video: { 
              width: { exact: 640 }, 
              height: { exact: 480 },
              frameRate: { exact: 15 }, // Frame rate baixo para estabilidade
              deviceId: undefined // Deixar o navegador escolher
            }, 
            audio: false 
          },
          // Estratégia 2: Logitech compatibilidade - sem restrições de resolução
          { 
            video: { 
              frameRate: { max: 30 },
              aspectRatio: { ideal: 1.33333 } // 4:3 padrão Logitech
            }, 
            audio: false 
          },
          // Estratégia 3: Configuração mínima universal
          { 
            video: {
              width: { min: 160, ideal: 320 },
              height: { min: 120, ideal: 240 }
            }, 
            audio: false 
          },
          // Estratégia 4: Apenas vídeo básico (fallback final)
          { 
            video: true, 
            audio: false 
          }
        ];
        
        let stream = null;
        let lastError = null;
        
        for (let i = 0; i < strategies.length; i++) {
          const strategy = strategies[i];
          console.log(`🔄 Tentativa ${i + 1}/${strategies.length}:`, strategy);
          
          try {
            // Timeout de 10 segundos por tentativa
            stream = await Promise.race([
              navigator.mediaDevices.getUserMedia(strategy),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout na obtenção da câmera')), 10000)
              )
            ]);
            
            console.log(`✅ Sucesso na estratégia ${i + 1}!`);
            console.log('📹 Stream obtido:', {
              id: stream.id,
              active: stream.active,
              tracks: stream.getTracks().length
            });
            
            // Verificar se o stream tem tracks de vídeo válidos
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
              const track = videoTracks[0];
              console.log('📹 Track de vídeo:', {
                kind: track.kind,
                label: track.label,
                enabled: track.enabled,
                readyState: track.readyState,
                muted: track.muted
              });
              
              // Adicionar listeners para detectar quando o track é interrompido
              track.addEventListener('ended', () => {
                console.warn('⚠️ Track de vídeo foi interrompido!');
                // Tentar reativar automaticamente após 1 segundo
                setTimeout(() => {
                  console.log('🔄 Tentando reativar câmera automaticamente...');
                  ultraActivateCamera();
                }, 1000);
              });
              
              track.addEventListener('mute', () => {
                console.warn('⚠️ Track de vídeo foi mutado!');
              });
              
              track.addEventListener('unmute', () => {
                console.log('🔊 Track de vídeo foi desmutado!');
              });
            }
            
            break; // Sucesso, sair do loop
            
          } catch (error) {
            lastError = error;
            console.warn(`❌ Estratégia ${i + 1} falhou:`, error.message);
            
            // Se não é a última tentativa, continuar
            if (i < strategies.length - 1) {
              console.log('🔄 Tentando próxima estratégia...');
              await new Promise(resolve => setTimeout(resolve, 500)); // Pausa entre tentativas
            }
          }
        }
        
        if (!stream) {
          throw lastError || new Error('Todas as estratégias de acesso à câmera falharam');
        }
        
        // Armazenar o stream globalmente
        ultraGlobalStream = stream;
        isUltraStreamActive = true;
        
        console.log('🔥 Atribuindo stream ao elemento de vídeo...');
        
        if (ultraGlobalVideoElement) {
          // Limpar qualquer srcObject anterior
          if (ultraGlobalVideoElement.srcObject) {
            console.log('🧹 Limpando srcObject anterior...');
            ultraGlobalVideoElement.srcObject = null;
          }
          
          // Atribuir novo stream de forma ultra-agressiva
          console.log('🔥 Atribuindo stream de forma ULTRA-AGRESSIVA...');
          ultraGlobalVideoElement.srcObject = stream;
          
          // Forçar estilos novamente após atribuição
          ultraGlobalVideoElement.style.display = 'block !important';
          ultraGlobalVideoElement.style.visibility = 'visible !important';
          ultraGlobalVideoElement.style.opacity = '1 !important';
          ultraGlobalVideoElement.style.zIndex = '9999 !important';
          
          // Verificação imediata
          setTimeout(() => {
            if (ultraGlobalVideoElement.srcObject !== stream) {
              console.warn('⚠️ srcObject foi perdido! Reassignando...');
              ultraGlobalVideoElement.srcObject = stream;
            }
          }, 100);
          
          // PROTEÇÃO ANTI-PISCAMENTO ESPECÍFICA PARA LOGITECH
          let flickerProtectionCount = 0;
          const keepAliveInterval = setInterval(() => {
            if (!ultraGlobalStream || !ultraGlobalStream.active) {
              clearInterval(keepAliveInterval);
              return;
            }
            
            // Verificar se srcObject foi perdido (causa do piscamento)
            if (ultraGlobalVideoElement.srcObject !== stream) {
              flickerProtectionCount++;
              console.warn(`🔄 ANTI-FLICKER ${flickerProtectionCount}: Reassignando srcObject perdido...`);
              ultraGlobalVideoElement.srcObject = stream;
              
              // Forçar play imediatamente após reassignar
              ultraGlobalVideoElement.play().catch(e => console.warn('Play pós-reassign falhou:', e.message));
            }
            
            // Verificar se vídeo pausou (comum em Logitech)
            if (ultraGlobalVideoElement.paused) {
              flickerProtectionCount++;
              console.warn(`🔄 ANTI-FLICKER ${flickerProtectionCount}: Vídeo pausou, reativando...`);
              ultraGlobalVideoElement.play().catch(e => console.warn('Play falhou:', e.message));
            }
            
            // Verificar se perdeu dimensões (indicativo de perda de stream)
            if (ultraGlobalVideoElement.videoWidth === 0 || ultraGlobalVideoElement.videoHeight === 0) {
              if (ultraGlobalVideoElement.srcObject === stream) {
                flickerProtectionCount++;
                console.warn(`🔄 ANTI-FLICKER ${flickerProtectionCount}: Dimensões perdidas, forçando reload...`);
                
                // Técnica específica para Logitech: remover e reassignar
                ultraGlobalVideoElement.srcObject = null;
                setTimeout(() => {
                  ultraGlobalVideoElement.srcObject = stream;
                  ultraGlobalVideoElement.play().catch(e => console.warn('Play pós-reload falhou:', e.message));
                }, 50);
              }
            }
            
            // Forçar estilos CSS (proteção contra CSS que oculta)
            ultraGlobalVideoElement.style.display = 'block !important';
            ultraGlobalVideoElement.style.visibility = 'visible !important';
            ultraGlobalVideoElement.style.opacity = '1 !important';
            ultraGlobalVideoElement.style.zIndex = '9999 !important';
            
            // Log de debug a cada 10 verificações (5 segundos)
            if (flickerProtectionCount > 0 && flickerProtectionCount % 10 === 0) {
              console.log(`🔄 ANTI-FLICKER STATUS: ${flickerProtectionCount} correções aplicadas`);
            }
            
          }, 500); // Verificar a cada 500ms
          
          // Proteção adicional: verificação mais frequente nos primeiros 10 segundos
          const intensiveProtection = setInterval(() => {
            if (!ultraGlobalStream || !ultraGlobalStream.active) {
              clearInterval(intensiveProtection);
              return;
            }
            
            // Verificação ultra-rápida para Logitech nos primeiros segundos
            if (ultraGlobalVideoElement.srcObject !== stream) {
              console.warn('⚡ PROTEÇÃO INTENSIVA: Corrigindo srcObject...');
              ultraGlobalVideoElement.srcObject = stream;
            }
          }, 100); // Verificar a cada 100ms
          
          // Parar proteção intensiva após 10 segundos
          setTimeout(() => {
            clearInterval(intensiveProtection);
            console.log('⚡ Proteção intensiva finalizada, mantendo proteção normal');
          }, 10000);
          
          // Configurar eventos detalhados
          ultraGlobalVideoElement.onloadedmetadata = () => {
            const w = ultraGlobalVideoElement.videoWidth;
            const h = ultraGlobalVideoElement.videoHeight;
            console.log(`🔥 METADATA CARREGADA: ${w}x${h}`);
            
            if (w > 0 && h > 0) {
              console.log('✅ Dimensões válidas obtidas!');
            } else {
              console.warn('⚠️ Dimensões inválidas, pode haver problema com o stream');
            }
          };
          
          ultraGlobalVideoElement.onloadeddata = () => {
            console.log('🔥 DADOS DE VÍDEO CARREGADOS');
          };
          
          ultraGlobalVideoElement.oncanplay = () => {
            console.log('🔥 VÍDEO PRONTO PARA REPRODUZIR');
          };
          
          ultraGlobalVideoElement.onplaying = () => {
            const w = ultraGlobalVideoElement.videoWidth;
            const h = ultraGlobalVideoElement.videoHeight;
            console.log(`🔥 VÍDEO REPRODUZINDO: ${w}x${h}`);
            console.log('🎉 CÂMERA FUNCIONANDO PERFEITAMENTE!');
          };
          
          ultraGlobalVideoElement.onpause = () => {
            console.warn('⚠️ Vídeo foi pausado');
          };
          
          ultraGlobalVideoElement.onended = () => {
            console.warn('⚠️ Vídeo terminou');
          };
          
          ultraGlobalVideoElement.onerror = (error) => {
            console.error('❌ Erro no elemento de vídeo:', error);
          };
          
          ultraGlobalVideoElement.onstalled = () => {
            console.warn('⚠️ Vídeo travou (stalled)');
          };
          
          ultraGlobalVideoElement.onwaiting = () => {
            console.warn('⚠️ Vídeo aguardando dados (waiting)');
          };
          
          // Tentar reproduzir o vídeo
          console.log('🔥 Iniciando reprodução...');
          try {
            await ultraGlobalVideoElement.play();
            console.log('✅ Reprodução iniciada com sucesso!');
          } catch (playError) {
            console.error('❌ Erro ao iniciar reprodução:', playError.message);
            
            // Tentar novamente após um breve delay
            setTimeout(async () => {
              try {
                console.log('🔄 Tentativa adicional de reprodução...');
                await ultraGlobalVideoElement.play();
                console.log('✅ Reprodução iniciada na segunda tentativa!');
              } catch (retryError) {
                console.error('❌ Falha na segunda tentativa:', retryError.message);
              }
            }, 1000);
          }
          
          // Monitoramento contínuo para detectar perda de stream
          const monitorInterval = setInterval(() => {
            if (!ultraGlobalStream || !ultraGlobalStream.active) {
              console.warn('⚠️ Stream perdido durante monitoramento!');
              clearInterval(monitorInterval);
              return;
            }
            
            const videoTracks = ultraGlobalStream.getVideoTracks();
            if (videoTracks.length === 0 || videoTracks[0].readyState === 'ended') {
              console.warn('⚠️ Track de vídeo perdido durante monitoramento!');
              clearInterval(monitorInterval);
              
              // Tentar reativar
              setTimeout(() => {
                console.log('🔄 Reativando câmera após perda de track...');
                ultraActivateCamera();
              }, 1000);
            }
          }, 2000); // Verificar a cada 2 segundos
          
          // Limpar monitoramento após 60 segundos (evitar vazamentos)
          setTimeout(() => {
            clearInterval(monitorInterval);
          }, 60000);
        }
        
        console.log('🔥 Stream ultra-persistente criado com sucesso!');
        return stream;
        
      } catch (error) {
        console.error('🔥 Erro crítico na ativação ultra-persistente:', error.message);
        console.error('🔥 Stack trace:', error.stack);
        
        // Tentar diagnóstico adicional
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          console.log('📹 Dispositivos de vídeo disponíveis:', videoDevices.length);
          videoDevices.forEach((device, index) => {
            console.log(`📹 Dispositivo ${index + 1}:`, {
              deviceId: device.deviceId,
              label: device.label || 'Sem rótulo',
              groupId: device.groupId
            });
          });
        } catch (enumError) {
          console.error('❌ Erro ao enumerar dispositivos:', enumError.message);
        }
        
        return null;
      }
    };
    
    const ultraDeactivateCamera = () => {
      console.log('🔥 === DESATIVAÇÃO ULTRA-PERSISTENTE ===');
      
      try {
        if (ultraGlobalStream) {
          console.log('🔥 Parando todas as tracks do stream...');
          const tracks = ultraGlobalStream.getTracks();
          
          tracks.forEach((track, index) => {
            console.log(`🔥 Parando track ${index + 1}/${tracks.length}: ${track.kind} - ${track.label || 'Sem rótulo'}`);
            console.log(`   Estado antes: enabled=${track.enabled}, readyState=${track.readyState}, muted=${track.muted}`);
            
            try {
              track.stop();
              console.log(`   ✅ Track ${track.kind} parado com sucesso`);
            } catch (trackError) {
              console.error(`   ❌ Erro ao parar track ${track.kind}:`, trackError.message);
            }
          });
          
          // Aguardar um pouco para garantir que as tracks foram liberadas
          setTimeout(() => {
            console.log('🔥 Verificando se tracks foram realmente liberadas...');
            tracks.forEach((track, index) => {
              console.log(`   Track ${index + 1}: readyState=${track.readyState}`);
            });
          }, 500);
          
          ultraGlobalStream = null;
          console.log('🔥 Referência do stream removida');
        } else {
          console.log('ℹ️ Nenhum stream ativo para desativar');
        }
        
        if (ultraGlobalVideoElement) {
          console.log('🔥 Limpando elemento de vídeo...');
          
          // Pausar primeiro
          if (!ultraGlobalVideoElement.paused) {
            ultraGlobalVideoElement.pause();
            console.log('⏸️ Vídeo pausado');
          }
          
          // Remover srcObject
          if (ultraGlobalVideoElement.srcObject) {
            ultraGlobalVideoElement.srcObject = null;
            console.log('🧹 srcObject removido');
          }
          
          // Resetar propriedades
          ultraGlobalVideoElement.currentTime = 0;
          console.log('⏮️ Tempo resetado para 0');
          
          // Verificar estado final
          setTimeout(() => {
            console.log('🔍 Estado final do vídeo:', {
              paused: ultraGlobalVideoElement.paused,
              currentTime: ultraGlobalVideoElement.currentTime,
              videoWidth: ultraGlobalVideoElement.videoWidth,
              videoHeight: ultraGlobalVideoElement.videoHeight,
              srcObject: !!ultraGlobalVideoElement.srcObject
            });
          }, 100);
        }
        
        isUltraStreamActive = false;
        console.log('🔥 === DESATIVAÇÃO COMPLETA ===');
        
        // Forçar garbage collection se disponível
        if (window.gc) {
          console.log('🗑️ Forçando garbage collection...');
          window.gc();
        }
        
      } catch (error) {
        console.error('❌ Erro durante desativação:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
        // Mesmo com erro, tentar limpar o que for possível
        ultraGlobalStream = null;
        isUltraStreamActive = false;
        
        if (ultraGlobalVideoElement) {
          try {
            ultraGlobalVideoElement.srcObject = null;
            ultraGlobalVideoElement.pause();
          } catch (cleanupError) {
            console.error('❌ Erro na limpeza de emergência:', cleanupError.message);
          }
        }
      }
    };
    
    // Função para diagnosticar conflitos de câmera
    const ultraDiagnoseCameraConflicts = async () => {
      console.log('🔍 === DIAGNÓSTICO DE CONFLITOS DE CÂMERA ===');
      
      try {
        // Verificar dispositivos disponíveis
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        console.log('📹 Dispositivos de vídeo encontrados:', videoDevices.length);
        videoDevices.forEach((device, index) => {
          console.log(`📹 Dispositivo ${index + 1}:`, {
            deviceId: device.deviceId.substring(0, 20) + '...',
            label: device.label || 'Dispositivo sem rótulo',
            groupId: device.groupId ? device.groupId.substring(0, 20) + '...' : 'Sem grupo'
          });
        });
        
        // Verificar permissões
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const permission = await navigator.permissions.query({ name: 'camera' });
            console.log('🔐 Status da permissão de câmera:', permission.state);
            
            permission.addEventListener('change', () => {
              console.log('🔐 Permissão de câmera mudou para:', permission.state);
            });
          } catch (permError) {
            console.warn('⚠️ Não foi possível verificar permissões:', permError.message);
          }
        }
        
        // Verificar se há streams ativos
        if (ultraGlobalStream) {
          console.log('📹 Stream global ativo:', {
            id: ultraGlobalStream.id,
            active: ultraGlobalStream.active,
            tracks: ultraGlobalStream.getTracks().length
          });
          
          ultraGlobalStream.getTracks().forEach((track, index) => {
            console.log(`📹 Track ${index + 1}:`, {
              kind: track.kind,
              label: track.label || 'Sem rótulo',
              enabled: track.enabled,
              readyState: track.readyState,
              muted: track.muted
            });
          });
        } else {
          console.log('📹 Nenhum stream global ativo');
        }
        
        // Verificar estado do elemento de vídeo
        if (ultraGlobalVideoElement) {
          console.log('📺 Estado do elemento de vídeo:', {
            videoWidth: ultraGlobalVideoElement.videoWidth,
            videoHeight: ultraGlobalVideoElement.videoHeight,
            paused: ultraGlobalVideoElement.paused,
            currentTime: ultraGlobalVideoElement.currentTime,
            readyState: ultraGlobalVideoElement.readyState,
            hasSrcObject: !!ultraGlobalVideoElement.srcObject
          });
        }
        
        // Testar acesso rápido à câmera para detectar conflitos
        console.log('🧪 Testando acesso rápido à câmera...');
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 160, height: 120 }, 
            audio: false 
          });
          
          console.log('✅ Teste de acesso bem-sucedido');
          console.log('📹 Stream de teste:', {
            id: testStream.id,
            active: testStream.active,
            tracks: testStream.getTracks().length
          });
          
          // Parar o stream de teste imediatamente
          testStream.getTracks().forEach(track => track.stop());
          console.log('🧹 Stream de teste finalizado');
          
        } catch (testError) {
          console.error('❌ Teste de acesso falhou:', testError.message);
          console.error('❌ Tipo de erro:', testError.name);
          
          if (testError.name === 'NotAllowedError') {
            console.error('🚫 PROBLEMA: Permissão negada - verifique as configurações do navegador');
          } else if (testError.name === 'NotFoundError') {
            console.error('📹 PROBLEMA: Nenhuma câmera encontrada');
          } else if (testError.name === 'NotReadableError') {
            console.error('🔒 PROBLEMA: Câmera em uso por outro aplicativo');
          } else if (testError.name === 'OverconstrainedError') {
            console.error('⚙️ PROBLEMA: Configurações de vídeo não suportadas');
          } else if (testError.name === 'SecurityError') {
            console.error('🔐 PROBLEMA: Contexto inseguro (HTTPS necessário)');
          }
        }
        
        console.log('🔍 === FIM DO DIAGNÓSTICO ===');
        
      } catch (error) {
        console.error('❌ Erro durante diagnóstico:', error.message);
      }
    };
    
    // Função para FORÇAR VISUALIZAÇÃO do vídeo
    const ultraForceVideoDisplay = () => {
      console.log('🎯 === FORÇANDO VISUALIZAÇÃO DO VÍDEO ===');
      
      if (!ultraGlobalVideoElement) {
        console.error('❌ Elemento de vídeo não encontrado');
        return false;
      }
      
      try {
        // Estilos ultra-agressivos
        const forceStyles = {
          'display': 'block !important',
          'visibility': 'visible !important',
          'opacity': '1 !important',
          'z-index': '9999 !important',
          'position': 'relative !important',
          'width': '100% !important',
          'height': '100% !important',
          'min-width': '320px !important',
          'min-height': '240px !important',
          'background': '#000 !important',
          'object-fit': 'cover !important'
        };
        
        Object.keys(forceStyles).forEach(prop => {
          ultraGlobalVideoElement.style.setProperty(prop, forceStyles[prop], 'important');
        });
        
        console.log('🎯 Estilos forçados aplicados');
        
        // Se há stream mas não está no vídeo, forçar atribuição
        if (ultraGlobalStream && ultraGlobalStream.active) {
          console.log('🎯 Forçando atribuição do stream...');
          ultraGlobalVideoElement.srcObject = ultraGlobalStream;
          
          // Tentar play imediatamente
          ultraGlobalVideoElement.play().then(() => {
            console.log('🎯 Play forçado bem-sucedido!');
          }).catch(error => {
            console.warn('🎯 Play forçado falhou:', error.message);
          });
        }
        
        // Log do estado atual
        setTimeout(() => {
          console.log('🎯 Estado após forçar visualização:', {
            srcObject: !!ultraGlobalVideoElement.srcObject,
            videoWidth: ultraGlobalVideoElement.videoWidth,
            videoHeight: ultraGlobalVideoElement.videoHeight,
            paused: ultraGlobalVideoElement.paused,
            readyState: ultraGlobalVideoElement.readyState,
            display: getComputedStyle(ultraGlobalVideoElement).display,
            visibility: getComputedStyle(ultraGlobalVideoElement).visibility,
            opacity: getComputedStyle(ultraGlobalVideoElement).opacity
          });
        }, 1000);
        
        return true;
        
      } catch (error) {
        console.error('❌ Erro ao forçar visualização:', error.message);
        return false;
      }
    };
    
    // Função para forçar liberação de recursos de câmera
    const ultraForceReleaseCameraResources = async () => {
      console.log('🔧 === FORÇANDO LIBERAÇÃO DE RECURSOS ===');
      
      try {
        // Parar stream atual se existir
        if (ultraGlobalStream) {
          console.log('🛑 Parando stream atual...');
          ultraGlobalStream.getTracks().forEach(track => track.stop());
          ultraGlobalStream = null;
        }
        
        // Limpar elemento de vídeo
        if (ultraGlobalVideoElement) {
          console.log('🧹 Limpando elemento de vídeo...');
          ultraGlobalVideoElement.srcObject = null;
          ultraGlobalVideoElement.pause();
        }
        
        // Aguardar liberação de recursos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Tentar obter novo stream
        console.log('🔄 Tentando obter novo stream após liberação...');
        return await ultraActivateCamera();
        
      } catch (error) {
        console.error('❌ Erro ao forçar liberação:', error.message);
        return null;
      }
    };
    
    // Expor funções e variáveis globalmente
    window.kalonUltraActivateCamera = ultraActivateCamera;
    window.kalonUltraDeactivateCamera = ultraDeactivateCamera;
    window.kalonUltraDiagnoseCameraConflicts = ultraDiagnoseCameraConflicts;
    window.kalonUltraForceReleaseCameraResources = ultraForceReleaseCameraResources;
    window.kalonUltraForceVideoDisplay = ultraForceVideoDisplay;
    window.kalonUltraVideoRef = { current: ultraGlobalVideoElement };
    
    // Expor stream global para verificação de status (só se não existir)
    if (!window.hasOwnProperty('ultraGlobalStream')) {
      Object.defineProperty(window, 'ultraGlobalStream', {
        get: () => ultraGlobalStream,
        set: (value) => { ultraGlobalStream = value; },
        configurable: true
      });
    }
    
    console.log('🔥 Funções ultra-persistentes expostas globalmente');
    
    return () => {
      console.log('🔥 NeverRemountVideo: Cleanup (NÃO para o stream)');
      // NÃO remover o elemento do DOM
      // NÃO parar o stream
      // Deixar tudo persistente
    };
  }, []); // SEM DEPENDÊNCIAS - executa apenas uma vez

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-black flex items-center justify-center"
      style={{ minHeight: '300px' }}
    >
      {/* Elemento de vídeo será criado diretamente aqui via DOM */}
    </div>
  );
};

// 🔥 MEMO ULTRA-ABSOLUTO - NUNCA re-renderiza
const NeverRemountVideoMemo = React.memo(NeverRemountVideo, () => {
  console.log('🔥 NeverRemountVideo: Tentativa de re-render ULTRA-BLOQUEADA');
  return true; // Sempre bloqueia
});

NeverRemountVideoMemo.displayName = 'NeverRemountVideo';
export default NeverRemountVideoMemo;
