"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Folder, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useTheme } from '../components/ThemeProvider';
import { useRouter } from 'next/router';

export default function CriarPastas() {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [nomeProfissional, setNomeProfissional] = useState('');
  const [sistemaOperacional, setSistemaOperacional] = useState('windows');
  const [pastasCriadas, setPastasCriadas] = useState(false);

  const handleVoltar = () => {
    router.push('/home');
  };

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
      alert('Por favor, digite seu nome primeiro!');
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
          setActiveSection={() => {}}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />

        <div className={`relative z-10 min-h-screen transition-all duration-300 pt-28 ${
          sidebarOpen ? 'lg:ml-64' : ''
        }`}>
          <div className="max-w-4xl mx-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <button
                onClick={handleVoltar}
                className="mb-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                style={{ color: themeColors.primary }}
              >
                ← Voltar
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: themeColors.primaryDark }}
                >
                  <Folder className="w-8 h-8" style={{ color: 'white' }} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    Criar Estrutura de Pastas
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gere automaticamente todas as pastas necessárias
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
              style={{
                backgroundColor: themeColors.background || 'white',
                borderColor: themeColors.primary + '40',
                borderWidth: '2px',
                borderStyle: 'solid'
              }}
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seu Nome Completo
                  </label>
                  <input
                    type="text"
                    value={nomeProfissional}
                    onChange={(e) => setNomeProfissional(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{
                      borderColor: themeColors.primary + '60',
                      focusRingColor: themeColors.primary
                    }}
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Este nome será usado na pasta principal: "KalonConnect - [Seu Nome]"
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sistema Operacional
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setSistemaOperacional('windows')}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        sistemaOperacional === 'windows'
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
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        sistemaOperacional === 'mac'
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
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        sistemaOperacional === 'linux'
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

                <div className="pt-4">
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
                    <span>Baixar Script de Criação de Pastas</span>
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
                        Script baixado com sucesso!
                      </p>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <p><strong>Próximos passos:</strong></p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Localize o arquivo baixado no seu computador</li>
                          <li>
                            {sistemaOperacional === 'windows' 
                              ? 'Clique duas vezes no arquivo "criar_pastas_kalon.bat" para executá-lo'
                              : 'Abra o Terminal, navegue até a pasta onde baixou o arquivo e execute: chmod +x criar_pastas_kalon.sh && ./criar_pastas_kalon.sh'
                            }
                          </li>
                          <li>As pastas serão criadas automaticamente na pasta Documentos</li>
                          <li>Copie a pasta "KalonConnect - {nomeProfissional}" para o seu Google Drive</li>
                          <li>Pronto! Sua estrutura está organizada na nuvem</li>
                        </ol>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2"
              style={{ borderColor: themeColors.primary + '40' }}
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: themeColors.primary }} />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    💡 Dica Importante
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Este script cria todas as pastas necessárias no seu computador. 
                    Depois de executar o script, você precisará copiar a pasta principal 
                    para o seu Google Drive (ou outro serviço de nuvem). 
                    Isso facilita muito o processo, especialmente para quem não tem 
                    muita experiência com computadores!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

