"use client";

import { useState, useEffect, useCallback } from 'react';

const useLayoutManager = (userId = 'default') => {
  const [layouts, setLayouts] = useState({});
  const [currentLayout, setCurrentLayout] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar layouts salvos
  useEffect(() => {
    const loadLayouts = () => {
      try {
        const savedLayouts = localStorage.getItem(`kalon_layouts_${userId}`);
        if (savedLayouts) {
          const parsedLayouts = JSON.parse(savedLayouts);
          setLayouts(parsedLayouts);
        }
        
        const savedCurrentLayout = localStorage.getItem(`kalon_current_layout_${userId}`);
        if (savedCurrentLayout) {
          setCurrentLayout(savedCurrentLayout);
        }
      } catch (error) {
        console.error('Erro ao carregar layouts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayouts();
  }, [userId]);

  // Salvar layout atual
  const saveLayout = useCallback((layoutName, layoutData) => {
    try {
      const newLayouts = {
        ...layouts,
        [layoutName]: {
          ...layoutData,
          savedAt: new Date().toISOString(),
          version: '1.0'
        }
      };
      
      setLayouts(newLayouts);
      localStorage.setItem(`kalon_layouts_${userId}`, JSON.stringify(newLayouts));
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar layout:', error);
      return false;
    }
  }, [layouts, userId]);

  // Aplicar layout
  const applyLayout = useCallback((layoutName) => {
    if (layouts[layoutName]) {
      setCurrentLayout(layoutName);
      localStorage.setItem(`kalon_current_layout_${userId}`, layoutName);
      return layouts[layoutName];
    }
    return null;
  }, [layouts, userId]);

  // Salvar posição e tamanho de widget
  const saveWidgetState = useCallback((widgetId, position, size) => {
    try {
      const currentLayoutData = layouts[currentLayout] || {};
      const updatedLayout = {
        ...currentLayoutData,
        widgets: {
          ...currentLayoutData.widgets,
          [widgetId]: {
            position,
            size,
            lastUpdated: new Date().toISOString()
          }
        }
      };
      
      saveLayout(currentLayout, updatedLayout);
    } catch (error) {
      console.error('Erro ao salvar estado do widget:', error);
    }
  }, [layouts, currentLayout, saveLayout]);

  // Carregar estado de widget
  const getWidgetState = useCallback((widgetId) => {
    const currentLayoutData = layouts[currentLayout];
    if (currentLayoutData?.widgets?.[widgetId]) {
      return currentLayoutData.widgets[widgetId];
    }
    return null;
  }, [layouts, currentLayout]);

  // Resetar layout
  const resetLayout = useCallback((layoutName = 'default') => {
    try {
      const resetLayoutData = {
        widgets: {},
        createdAt: new Date().toISOString(),
        version: '1.0'
      };
      
      saveLayout(layoutName, resetLayoutData);
      applyLayout(layoutName);
      
      return true;
    } catch (error) {
      console.error('Erro ao resetar layout:', error);
      return false;
    }
  }, [saveLayout, applyLayout]);

  // Duplicar layout
  const duplicateLayout = useCallback((sourceLayoutName, newLayoutName) => {
    if (layouts[sourceLayoutName]) {
      const duplicatedLayout = {
        ...layouts[sourceLayoutName],
        name: newLayoutName,
        duplicatedAt: new Date().toISOString(),
        duplicatedFrom: sourceLayoutName
      };
      
      return saveLayout(newLayoutName, duplicatedLayout);
    }
    return false;
  }, [layouts, saveLayout]);

  // Deletar layout
  const deleteLayout = useCallback((layoutName) => {
    if (layoutName === 'default') {
      return false; // Não permitir deletar layout padrão
    }
    
    try {
      const newLayouts = { ...layouts };
      delete newLayouts[layoutName];
      
      setLayouts(newLayouts);
      localStorage.setItem(`kalon_layouts_${userId}`, JSON.stringify(newLayouts));
      
      // Se o layout deletado era o atual, voltar para o padrão
      if (currentLayout === layoutName) {
        applyLayout('default');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar layout:', error);
      return false;
    }
  }, [layouts, currentLayout, applyLayout, userId]);

  // Exportar layouts
  const exportLayouts = useCallback(() => {
    try {
      const exportData = {
        userId,
        layouts,
        currentLayout,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `kalon-layouts-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar layouts:', error);
      return false;
    }
  }, [userId, layouts, currentLayout]);

  // Importar layouts
  const importLayouts = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          if (importData.layouts && importData.version === '1.0') {
            setLayouts(importData.layouts);
            localStorage.setItem(`kalon_layouts_${userId}`, JSON.stringify(importData.layouts));
            
            if (importData.currentLayout) {
              applyLayout(importData.currentLayout);
            }
            
            resolve(true);
          } else {
            reject(new Error('Formato de arquivo inválido'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, [userId, applyLayout]);

  return {
    layouts,
    currentLayout,
    isLoading,
    saveLayout,
    applyLayout,
    saveWidgetState,
    getWidgetState,
    resetLayout,
    duplicateLayout,
    deleteLayout,
    exportLayouts,
    importLayouts
  };
};

export default useLayoutManager;





