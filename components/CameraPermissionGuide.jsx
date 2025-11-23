"use client";

import React, { useState, useEffect } from 'react';

/**
 * 🎯 GUIA VISUAL DE PERMISSÕES DE CÂMERA
 * Instrui o usuário como conceder permissões corretamente
 */
const CameraPermissionGuide = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [browserType, setBrowserType] = useState('chrome');

  useEffect(() => {
    // Detectar navegador
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('firefox')) {
      setBrowserType('firefox');
    } else if (userAgent.includes('edge')) {
      setBrowserType('edge');
    } else {
      setBrowserType('chrome');
    }
  }, []);

  const steps = {
    chrome: [
      {
        title: "1. Localize o Ícone da Câmera",
        description: "Na barra de endereços, procure pelo ícone da câmera (🎥) à esquerda do URL",
        icon: "🎥",
        action: "Clique no ícone da câmera"
      },
      {
        title: "2. Permita o Acesso",
        description: "Selecione 'Sempre permitir' no menu que aparecer",
        icon: "✅",
        action: "Escolha 'Sempre permitir'"
      },
      {
        title: "3. Recarregue a Página",
        description: "Pressione F5 ou clique no botão de recarregar para aplicar as permissões",
        icon: "🔄",
        action: "Pressione F5"
      }
    ],
    firefox: [
      {
        title: "1. Localize o Ícone do Escudo",
        description: "Na barra de endereços, procure pelo ícone do escudo (🛡️)",
        icon: "🛡️",
        action: "Clique no ícone do escudo"
      },
      {
        title: "2. Desbloqueie a Câmera",
        description: "Clique em 'Desbloquear' ao lado de 'Câmera'",
        icon: "🔓",
        action: "Clique em 'Desbloquear'"
      },
      {
        title: "3. Recarregue a Página",
        description: "Pressione F5 ou clique no botão de recarregar",
        icon: "🔄",
        action: "Pressione F5"
      }
    ],
    edge: [
      {
        title: "1. Localize o Ícone da Câmera",
        description: "Na barra de endereços, procure pelo ícone da câmera (🎥)",
        icon: "🎥",
        action: "Clique no ícone da câmera"
      },
      {
        title: "2. Permita o Acesso",
        description: "Selecione 'Permitir' no menu que aparecer",
        icon: "✅",
        action: "Escolha 'Permitir'"
      },
      {
        title: "3. Recarregue a Página",
        description: "Pressione F5 para aplicar as permissões",
        icon: "🔄",
        action: "Pressione F5"
      }
    ]
  };

  const currentSteps = steps[browserType];

  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 10010,
        background: '#dc3545',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        animation: 'pulse 2s infinite'
      }} onClick={() => setIsVisible(true)}>
        🚨 Câmera Bloqueada? Clique Aqui!
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 10010,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Botão Fechar */}
        <button
          onClick={() => setIsVisible(false)}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>

        {/* Título */}
        <h2 style={{
          color: '#dc3545',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '24px'
        }}>
          🎥 Como Permitir Acesso à Câmera
        </h2>

        {/* Detector de Navegador */}
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>Navegador Detectado: </strong>
          <span style={{ 
            color: '#007bff',
            textTransform: 'capitalize',
            fontSize: '18px'
          }}>
            {browserType === 'chrome' ? 'Chrome/Chromium' : 
             browserType === 'firefox' ? 'Firefox' : 'Edge'}
          </span>
        </div>

        {/* Passos */}
        <div style={{ marginBottom: '20px' }}>
          {currentSteps.map((step, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '15px',
                marginBottom: '15px',
                background: currentStep === index ? '#e3f2fd' : '#f8f9fa',
                borderRadius: '8px',
                border: currentStep === index ? '2px solid #2196f3' : '1px solid #dee2e6',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentStep(index)}
            >
              <div style={{
                fontSize: '30px',
                marginRight: '15px',
                minWidth: '40px'
              }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  color: '#333',
                  fontSize: '16px'
                }}>
                  {step.title}
                </h4>
                <p style={{
                  margin: '0 0 8px 0',
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {step.description}
                </p>
                <div style={{
                  background: '#007bff',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'inline-block'
                }}>
                  {step.action}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navegação */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            style={{
              padding: '8px 16px',
              background: currentStep === 0 ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Anterior
          </button>

          <span style={{ color: '#666', fontSize: '14px' }}>
            Passo {currentStep + 1} de {currentSteps.length}
          </span>

          <button
            onClick={() => setCurrentStep(Math.min(currentSteps.length - 1, currentStep + 1))}
            disabled={currentStep === currentSteps.length - 1}
            style={{
              padding: '8px 16px',
              background: currentStep === currentSteps.length - 1 ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentStep === currentSteps.length - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Próximo →
          </button>
        </div>

        {/* Botões de Ação */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🔄 Recarregar Página
          </button>

          <button
            onClick={() => {
              navigator.mediaDevices.getUserMedia({ video: true })
                .then(() => {
                  alert('✅ Permissões concedidas! Feche este guia e tente novamente.');
                })
                .catch(() => {
                  alert('❌ Ainda sem permissões. Siga os passos acima.');
                });
            }}
            style={{
              padding: '12px 24px',
              background: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🧪 Testar Permissões
          </button>
        </div>

        {/* Dica Extra */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>💡 Dica:</strong> Se não conseguir encontrar o ícone da câmera, 
          tente clicar no botão "Ligar Câmera" primeiro. O navegador mostrará 
          uma solicitação de permissão que você pode aceitar diretamente.
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CameraPermissionGuide;


