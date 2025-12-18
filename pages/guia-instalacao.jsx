"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, X, Download, Folder, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from '../hooks/useTranslation';

export default function GuiaInstalacao() {
  const { t } = useTranslation();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [guiaContent, setGuiaContent] = useState('');
  const [showModalPastas, setShowModalPastas] = useState(false);
  const [nomeProfissional, setNomeProfissional] = useState('');
  const [sistemaOperacional, setSistemaOperacional] = useState('windows');
  const [pastasCriadas, setPastasCriadas] = useState(false);

  useEffect(() => {
    // Função para converter Markdown para HTML
    const convertMarkdownToHTML = (text) => {
      let html = text
        // Blocos de código primeiro (para não interferir)
        .replace(/```([\s\S]*?)```/g, (match, code) => {
          return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">${code.trim()}</code></pre>`;
        })
        // Títulos
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4" style="color: ' + themeColors.primaryDark + '">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3" style="color: ' + themeColors.primary + '">$1</h2>')
        // Processar "1. Estrutura de Pastas na Nuvem" ANTES de outros h3
        .replace(/^### \*\*1\. Estrutura de Pastas na Nuvem\*\*/gim, '<h3 class="text-xl font-bold mt-4 mb-2 flex items-center gap-3 flex-wrap"><span><strong>1. Estrutura de Pastas na Nuvem</strong></span><button onclick="window.openModalPastas()" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-90 cursor-pointer text-sm font-medium" style="background-color: ' + themeColors.primary + '; color: white;" title="Criar estrutura de pastas automaticamente"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg><span>Clique aqui e crie suas pastas automaticamente</span></button></h3>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
        .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-bold mt-3 mb-2">$1</h4>')
        // Negrito e itálico
        .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Código inline
        .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">$1</code>')
        // Listas não ordenadas
        .replace(/^- (.*$)/gim, '<li class="ml-6 mb-1 list-disc">$1</li>')
        // Listas ordenadas
        .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 mb-1 list-decimal">$1</li>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline" style="color: ' + themeColors.primary + '">$1</a>')
        // Quebras de linha múltiplas viram parágrafos
        .replace(/\n\n+/g, '</p><p class="mb-4">')
        // Quebras simples
        .replace(/\n/g, '<br>');

      return '<p class="mb-4">' + html + '</p>';
    };

    // Tentar carregar do public primeiro, depois da API
    const loadGuia = async () => {
      try {
        // Adicionar timestamp para forçar atualização de cache
        const timestamp = new Date().getTime();

        // Primeiro tenta buscar diretamente do public
        let response = await fetch(`/GUIA_INSTALACAO_USO.md?v=${timestamp}`, {
          cache: 'no-cache'
        });

        // Se falhar, tenta a API
        if (!response.ok) {
          console.log('Tentando via API...');
          response = await fetch(`/api/guia?v=${timestamp}`, {
            cache: 'no-cache'
          });
        }

        if (!response.ok) {
          let errorMessage = `Erro ${response.status}: Erro ao carregar o guia`;
          try {
            const errorData = await response.json();
            errorMessage = `Erro ${response.status}: ${errorData.error || 'Erro ao carregar o guia'}`;
            console.error('Resposta da API:', errorData);
          } catch (e) {
            // Se não for JSON, tenta ler como texto
            const errorText = await response.text().catch(() => '');
            errorMessage = `Erro ${response.status}: ${errorText || 'Erro ao carregar o guia'}`;
          }
          throw new Error(errorMessage);
        }

        const text = await response.text();

        if (!text || text.trim().length === 0) {
          throw new Error('O guia está vazio');
        }

        let html = convertMarkdownToHTML(text);
        // Se ainda não foi processado, tentar adicionar após a conversão (fallback)
        if (!html.includes('window.openModalPastas')) {
          html = html.replace(
            /<h3 class="text-xl font-bold mt-4 mb-2"><strong>1\. Estrutura de Pastas na Nuvem<\/strong><\/h3>/g,
            '<h3 class="text-xl font-bold mt-4 mb-2 flex items-center gap-3 flex-wrap"><span><strong>1. Estrutura de Pastas na Nuvem</strong></span><button onclick="window.openModalPastas()" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-90 cursor-pointer text-sm font-medium" style="background-color: ' + themeColors.primary + '; color: white;" title="Criar estrutura de pastas automaticamente"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg><span>Clique aqui e crie suas pastas automaticamente</span></button></h3>'
          );
        }
        setGuiaContent(html);
      } catch (error) {
        console.error('Erro ao carregar guia:', error);
        setGuiaContent(`
          <div class="text-red-600 p-4 bg-red-50 rounded-lg">
            <p class="font-bold mb-2">${t('guide.error.title')}</p>
            <p class="text-sm mb-4">${error.message}</p>
            <p class="text-sm">${t('guide.error.fallback')}</p>
          </div>
        `);
      }
    };

    loadGuia();

    // Expor função para o botão no HTML poder chamar
    window.openModalPastas = () => {
      setShowModalPastas(true);
    };

    return () => {
      delete window.openModalPastas;
    };
  }, [themeColors]);

  // Funções para criar scripts (copiadas de criar-pastas.jsx)
  const criarScriptWindows = (nome) => {
    const nomePasta = `KalonConnect - ${nome}`;
    return `@echo off
echo ========================================
echo Criando estrutura de pastas do KalonConnect
echo ========================================
echo.

REM Navegar para a pasta Documentos do usuário
cd /d "%USERPROFILE%\\Documents"

set "PASTA_PRINCIPAL=${nomePasta}"

echo Criando pasta principal: %PASTA_PRINCIPAL%
echo Localização: %USERPROFILE%\\Documents\\%PASTA_PRINCIPAL%
mkdir "%PASTA_PRINCIPAL%" 2>nul

echo.
echo Criando subpastas...

cd "%PASTA_PRINCIPAL%"

REM Pasta 01_CLIENTES
mkdir "01_CLIENTES" 2>nul
cd "01_CLIENTES"
mkdir "Cliente_001_Exemplo" 2>nul
cd "Cliente_001_Exemplo"
mkdir "Fichas" 2>nul
mkdir "Consultas" 2>nul
mkdir "Documentos" 2>nul
mkdir "Gravações" 2>nul
mkdir "Arquivos_Compartilhados" 2>nul
cd ..\..

REM Pasta 02_MATERIAIS_CONSULTA
mkdir "02_MATERIAIS_CONSULTA" 2>nul
cd "02_MATERIAIS_CONSULTA"
mkdir "Músicas_Relaxamento" 2>nul
mkdir "Frequências" 2>nul
mkdir "Vídeos_Terapêuticos" 2>nul
mkdir "Áudios_Guia" 2>nul
mkdir "Meditações" 2>nul
cd ..

REM Pasta 03_DOCUMENTOS_LEGAIS
mkdir "03_DOCUMENTOS_LEGAIS" 2>nul
cd "03_DOCUMENTOS_LEGAIS"
mkdir "Receituários" 2>nul
mkdir "Recibos" 2>nul
mkdir "Termos_Consentimento" 2>nul
mkdir "Contratos" 2>nul
cd ..

REM Pasta 04_ARQUIVOS_SISTEMA
mkdir "04_ARQUIVOS_SISTEMA" 2>nul
cd "04_ARQUIVOS_SISTEMA"
mkdir "Logos" 2>nul
mkdir "Fotos_Profissional" 2>nul
mkdir "Backgrounds" 2>nul
mkdir "Templates" 2>nul
cd ..

REM Pasta 05_FINANCEIRO
mkdir "05_FINANCEIRO" 2>nul
cd "05_FINANCEIRO"
mkdir "Comprovantes_Pagamento" 2>nul
mkdir "Relatórios" 2>nul
mkdir "Declarações" 2>nul
cd ..

REM Pasta 06_BACKUP
mkdir "06_BACKUP" 2>nul

cd ..

echo.
echo ========================================
echo Estrutura de pastas criada com sucesso!
echo ========================================
echo.
echo A pasta "%PASTA_PRINCIPAL%" foi criada na pasta Documentos.
echo Localização completa: %USERPROFILE%\\Documents\\%PASTA_PRINCIPAL%
echo.
echo Próximos passos:
echo 1. Abra a pasta Documentos do seu computador
echo 2. Localize a pasta "%PASTA_PRINCIPAL%"
echo 3. Copie toda a pasta para o seu Google Drive
echo 4. Pronto! Sua estrutura está organizada na nuvem.
echo.
pause
`;
  };

  const criarScriptMacLinux = (nome) => {
    const nomePasta = `KalonConnect - ${nome}`;
    return `#!/bin/bash

echo "========================================"
echo "Criando estrutura de pastas do KalonConnect"
echo "========================================"
echo ""

# Navegar para a pasta Documentos do usuário
cd ~/Documents

PASTA_PRINCIPAL="${nomePasta}"

echo "Criando pasta principal: $PASTA_PRINCIPAL"
echo "Localização: ~/Documents/$PASTA_PRINCIPAL"
mkdir -p "$PASTA_PRINCIPAL"

cd "$PASTA_PRINCIPAL"

echo ""
echo "Criando subpastas..."

# Pasta 01_CLIENTES
mkdir -p "01_CLIENTES/Cliente_001_Exemplo/Fichas"
mkdir -p "01_CLIENTES/Cliente_001_Exemplo/Consultas"
mkdir -p "01_CLIENTES/Cliente_001_Exemplo/Documentos"
mkdir -p "01_CLIENTES/Cliente_001_Exemplo/Gravações"
mkdir -p "01_CLIENTES/Cliente_001_Exemplo/Arquivos_Compartilhados"

# Pasta 02_MATERIAIS_CONSULTA
mkdir -p "02_MATERIAIS_CONSULTA/Músicas_Relaxamento"
mkdir -p "02_MATERIAIS_CONSULTA/Frequências"
mkdir -p "02_MATERIAIS_CONSULTA/Vídeos_Terapêuticos"
mkdir -p "02_MATERIAIS_CONSULTA/Áudios_Guia"
mkdir -p "02_MATERIAIS_CONSULTA/Meditações"

# Pasta 03_DOCUMENTOS_LEGAIS
mkdir -p "03_DOCUMENTOS_LEGAIS/Receituários"
mkdir -p "03_DOCUMENTOS_LEGAIS/Recibos"
mkdir -p "03_DOCUMENTOS_LEGAIS/Termos_Consentimento"
mkdir -p "03_DOCUMENTOS_LEGAIS/Contratos"

# Pasta 04_ARQUIVOS_SISTEMA
mkdir -p "04_ARQUIVOS_SISTEMA/Logos"
mkdir -p "04_ARQUIVOS_SISTEMA/Fotos_Profissional"
mkdir -p "04_ARQUIVOS_SISTEMA/Backgrounds"
mkdir -p "04_ARQUIVOS_SISTEMA/Templates"

# Pasta 05_FINANCEIRO
mkdir -p "05_FINANCEIRO/Comprovantes_Pagamento"
mkdir -p "05_FINANCEIRO/Relatórios"
mkdir -p "05_FINANCEIRO/Declarações"

# Pasta 06_BACKUP
mkdir -p "06_BACKUP"

cd ..

echo ""
echo "========================================"
echo "Estrutura de pastas criada com sucesso!"
echo "========================================"
echo ""
echo "A pasta '$PASTA_PRINCIPAL' foi criada na pasta Documentos."
echo "Localização completa: ~/Documents/$PASTA_PRINCIPAL"
echo ""
echo "Próximos passos:"
echo "1. Abra a pasta Documentos do seu computador"
echo "2. Localize a pasta '$PASTA_PRINCIPAL'"
echo "3. Copie toda a pasta para o seu Google Drive"
echo "4. Pronto! Sua estrutura está organizada na nuvem."
echo ""
`;
  };

  const handleDownloadScript = () => {
    if (!nomeProfissional.trim()) {
      alert(t('guide.modal.alertName'));
      return;
    }

    let scriptContent, fileName, mimeType;

    if (sistemaOperacional === 'windows') {
      scriptContent = criarScriptWindows(nomeProfissional);
      fileName = 'criar_pastas_kalon.bat';
      mimeType = 'text/plain';
    } else {
      scriptContent = criarScriptMacLinux(nomeProfissional);
      fileName = 'criar_pastas_kalon.sh';
      mimeType = 'text/plain';
    }

    const blob = new Blob([scriptContent], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setPastasCriadas(true);
  };

  const handleDownload = async () => {
    try {
      // Primeiro tenta buscar diretamente do public
      let response = await fetch('/GUIA_INSTALACAO_USO.md');

      // Se falhar, tenta a API
      if (!response.ok) {
        response = await fetch('/api/guia');
      }

      if (!response.ok) {
        throw new Error('Erro ao baixar o guia');
      }

      const text = await response.text();

      // Criar um documento HTML para impressão/PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        // Se popup foi bloqueado, usar alternativa
        alert('Por favor, permita pop-ups para gerar o PDF');
        return;
      }

      // Converter Markdown para HTML (mesma função usada para exibir)
      const convertMarkdownToHTML = (text) => {
        let html = text
          .replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<pre style="background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0;"><code style="font-size: 0.875rem;">${code.trim()}</code></pre>`;
          })
          .replace(/^# (.*$)/gim, '<h1 style="font-size: 2rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; color: ' + themeColors.primaryDark + '">$1</h1>')
          .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem; color: ' + themeColors.primary + '">$1</h2>')
          .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem;">$1</h3>')
          .replace(/^#### (.*$)/gim, '<h4 style="font-size: 1.125rem; font-weight: bold; margin-top: 0.75rem; margin-bottom: 0.5rem;">$1</h4>')
          .replace(/\*\*(.*?)\*\*/gim, '<strong style="font-weight: bold;">$1</strong>')
          .replace(/\*(.*?)\*/gim, '<em>$1</em>')
          .replace(/`([^`]+)`/gim, '<code style="background: #f5f5f5; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem;">$1</code>')
          .replace(/^- (.*$)/gim, '<li style="margin-left: 1.5rem; margin-bottom: 0.25rem; list-style-type: disc;">$1</li>')
          .replace(/^\d+\. (.*$)/gim, '<li style="margin-left: 1.5rem; margin-bottom: 0.25rem; list-style-type: decimal;">$1</li>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" style="color: ' + themeColors.primary + '; text-decoration: underline;">$1</a>')
          .replace(/\n\n+/g, '</p><p style="margin-bottom: 1rem;">')
          .replace(/\n/g, '<br>');

        return '<p style="margin-bottom: 1rem;">' + html + '</p>';
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Guia de Utilização - KalonConnect</title>
          <style>
            @media print {
              @page {
                margin: 2cm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
            }
            h1, h2, h3, h4 {
              page-break-after: avoid;
            }
            pre {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${convertMarkdownToHTML(text)}
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Aguardar o conteúdo carregar e então abrir diálogo de impressão
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Opcional: fechar após impressão
          // printWindow.close();
        }, 250);
      };
    } catch (error) {
      console.error('Erro ao baixar guia:', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    }
  };

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: themeColors.secondary || themeColors.secondaryLight || '#f0f9f9'
        }}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <Sidebar
          activeSection="ajuda"
          setActiveSection={() => { }}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />

        <div className={`relative z-10 min-h-screen transition-all duration-300 pt-28 ${sidebarOpen ? 'lg:ml-64' : ''
          }`}>
          <div className="max-w-5xl mx-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: themeColors.primaryDark }}
                  >
                    <BookOpen className="w-8 h-8" style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                      {t('guide.title')}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('guide.subtitle')} <span className="font-bold normal-case">KalonConnect</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = themeColors.primaryDark;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = themeColors.primary;
                  }}
                >
                  <Download className="w-5 h-5" />
                  <span>{t('guide.downloadPdf')}</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 prose dark:prose-invert max-w-none"
              style={{
                color: themeColors.textPrimary,
                backgroundColor: themeColors.background
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: guiaContent }}
                className="markdown-content"
                style={{
                  lineHeight: '1.8',
                  fontSize: '16px'
                }}
              />

              {!guiaContent && (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('guide.loading')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {t('guide.loadingFallback')}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Modal Criar Pastas */}
        {showModalPastas && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: themeColors.background || 'white',
                borderColor: themeColors.primary + '40',
                borderWidth: '2px',
                borderStyle: 'solid'
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: themeColors.primaryDark }}
                    >
                      <Folder className="w-6 h-6" style={{ color: 'white' }} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {t('guide.modal.title')}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowModalPastas(false);
                      setPastasCriadas(false);
                      setNomeProfissional('');
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('guide.modal.nameLabel')}
                    </label>
                    <input
                      type="text"
                      value={nomeProfissional}
                      onChange={(e) => setNomeProfissional(e.target.value)}
                      placeholder={t('guide.modal.namePlaceholder')}
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: themeColors.primary + '60',
                        focusRingColor: themeColors.primary
                      }}
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {t('guide.modal.nameHelp')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('guide.modal.osLabel')}
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setSistemaOperacional('windows')}
                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${sistemaOperacional === 'windows'
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                          }`}
                        style={{
                          backgroundColor: sistemaOperacional === 'windows' ? themeColors.primary : 'transparent',
                          borderColor: themeColors.primary + '60'
                        }}
                      >
                        Windows
                      </button>
                      <button
                        onClick={() => setSistemaOperacional('mac')}
                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${sistemaOperacional === 'mac'
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                          }`}
                        style={{
                          backgroundColor: sistemaOperacional === 'mac' ? themeColors.primary : 'transparent',
                          borderColor: themeColors.primary + '60'
                        }}
                      >
                        Mac
                      </button>
                      <button
                        onClick={() => setSistemaOperacional('linux')}
                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${sistemaOperacional === 'linux'
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                          }`}
                        style={{
                          backgroundColor: sistemaOperacional === 'linux' ? themeColors.primary : 'transparent',
                          borderColor: themeColors.primary + '60'
                        }}
                      >
                        Linux
                      </button>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={handleDownloadScript}
                      className="w-full px-6 py-4 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2 text-white"
                      style={{
                        backgroundColor: themeColors.primary,
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = themeColors.primaryDark;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = themeColors.primary;
                      }}
                    >
                      <Download className="w-5 h-5" />
                      <span>{t('guide.modal.downloadScript')}</span>
                    </button>
                  </div>

                  {pastasCriadas && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-lg flex items-start space-x-3"
                      style={{ backgroundColor: themeColors.primaryLight + '30' }}
                    >
                      <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: themeColors.primary }} />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white mb-1">
                          {t('guide.modal.success.title')}
                        </p>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                          <p><strong>{t('guide.modal.success.nextSteps')}</strong></p>
                          <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>{t('guide.modal.success.step1')}</li>
                            <li>
                              {sistemaOperacional === 'windows'
                                ? t('guide.modal.success.step2Windows')
                                : t('guide.modal.success.step2Unix')
                              }
                            </li>
                            <li>{t('guide.modal.success.step3')}</li>
                            <li>{t('guide.modal.success.step4').replace('{name}', nomeProfissional)}</li>
                            <li>{t('guide.modal.success.step5')}</li>
                          </ol>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

