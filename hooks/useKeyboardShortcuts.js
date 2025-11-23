"use client";

import { useEffect, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

const useKeyboardShortcuts = ({
  onToggleFullscreen,
  onToggleMinimize,
  onToggleMaximize,
  onSwitchLayout,
  onToggleMute,
  onTogglePlayPause,
  onToggleScreenShare,
  onToggleRecording,
  onToggleChat,
  onToggleNotes,
  onToggleFiles,
  onTogglePlayer,
  onCloseWidget,
  activeWidget = null
}) => {
  // Atalhos globais
  useHotkeys('f11', (e) => {
    e.preventDefault();
    if (onToggleFullscreen) onToggleFullscreen();
  }, { enableOnFormTags: false });

  useHotkeys('escape', (e) => {
    e.preventDefault();
    if (onCloseWidget && activeWidget) {
      onCloseWidget(activeWidget);
    }
  }, { enableOnFormTags: false });

  // Atalhos de layout
  useHotkeys('ctrl+1', (e) => {
    e.preventDefault();
    if (onSwitchLayout) onSwitchLayout('traditional');
  }, { enableOnFormTags: false });

  useHotkeys('ctrl+2', (e) => {
    e.preventDefault();
    if (onSwitchLayout) onSwitchLayout('interview');
  }, { enableOnFormTags: false });

  useHotkeys('ctrl+3', (e) => {
    e.preventDefault();
    if (onSwitchLayout) onSwitchLayout('sharing');
  }, { enableOnFormTags: false });

  useHotkeys('ctrl+4', (e) => {
    e.preventDefault();
    if (onSwitchLayout) onSwitchLayout('relaxation');
  }, { enableOnFormTags: false });

  useHotkeys('ctrl+5', (e) => {
    e.preventDefault();
    if (onSwitchLayout) onSwitchLayout('minimal');
  }, { enableOnFormTags: false });

  // Atalhos de mídia
  useHotkeys('space', (e) => {
    e.preventDefault();
    if (onTogglePlayPause) onTogglePlayPause();
  }, { enableOnFormTags: false });

  useHotkeys('m', (e) => {
    e.preventDefault();
    if (onToggleMute) onToggleMute();
  }, { enableOnFormTags: false });

  // Atalhos de vídeo
  useHotkeys('s', (e) => {
    e.preventDefault();
    if (onToggleScreenShare) onToggleScreenShare();
  }, { enableOnFormTags: false });

  useHotkeys('r', (e) => {
    e.preventDefault();
    if (onToggleRecording) onToggleRecording();
  }, { enableOnFormTags: false });

  // Atalhos de painéis
  useHotkeys('c', (e) => {
    e.preventDefault();
    if (onToggleChat) onToggleChat();
  }, { enableOnFormTags: false });

  useHotkeys('n', (e) => {
    e.preventDefault();
    if (onToggleNotes) onToggleNotes();
  }, { enableOnFormTags: false });

  useHotkeys('f', (e) => {
    e.preventDefault();
    if (onToggleFiles) onToggleFiles();
  }, { enableOnFormTags: false });

  useHotkeys('p', (e) => {
    e.preventDefault();
    if (onTogglePlayer) onTogglePlayer();
  }, { enableOnFormTags: false });

  // Atalhos de minimizar/maximizar
  useHotkeys('ctrl+m', (e) => {
    e.preventDefault();
    if (onToggleMinimize) onToggleMinimize();
  }, { enableOnFormTags: false });

  useHotkeys('ctrl+shift+m', (e) => {
    e.preventDefault();
    if (onToggleMaximize) onToggleMaximize();
  }, { enableOnFormTags: false });

  // Atalhos de navegação
  useHotkeys('tab', (e) => {
    e.preventDefault();
    // Ciclar entre widgets ativos
    const widgets = ['video', 'player', 'chat', 'notes', 'files'];
    const currentIndex = widgets.indexOf(activeWidget);
    const nextIndex = (currentIndex + 1) % widgets.length;
    // Implementar lógica de foco
  }, { enableOnFormTags: false });

  // Atalhos de zoom
  useHotkeys('ctrl+plus', (e) => {
    e.preventDefault();
    // Implementar zoom in
  }, { enableOnFormTags: false });

  useHotkeys('ctrl+minus', (e) => {
    e.preventDefault();
    // Implementar zoom out
  }, { enableOnFormTags: false });

  useHotkeys('ctrl+0', (e) => {
    e.preventDefault();
    // Resetar zoom
  }, { enableOnFormTags: false });

  return {
    // Retornar informações sobre atalhos disponíveis
    shortcuts: {
      'F11': 'Tela cheia',
      'Esc': 'Fechar widget ativo',
      'Ctrl+1-5': 'Mudar layout',
      'Space': 'Play/Pause',
      'M': 'Mutar/Desmutar',
      'S': 'Compartilhar tela',
      'R': 'Iniciar/Parar gravação',
      'C': 'Toggle Chat',
      'N': 'Toggle Notas',
      'F': 'Toggle Arquivos',
      'P': 'Toggle Player',
      'Ctrl+M': 'Minimizar',
      'Ctrl+Shift+M': 'Maximizar',
      'Tab': 'Próximo widget',
      'Ctrl+Plus/Minus': 'Zoom',
      'Ctrl+0': 'Resetar zoom'
    }
  };
};

export default useKeyboardShortcuts;





