import React, { useEffect } from 'react';

const CSSDebugger = () => {
  useEffect(() => {
    // Função para debugar todos os estilos aplicados
    const debugStyles = () => {
      const elements = document.querySelectorAll('input');
      
      elements.forEach((element, index) => {
        console.log(`\n=== INPUT ${index + 1} ===`);
        console.log('Elemento:', element);
        console.log('ID:', element.id);
        console.log('Classes:', element.className);
        console.log('Name:', element.getAttribute('name'));
        
        // Todos os estilos computados
        const computed = window.getComputedStyle(element);
        const relevantStyles = {
          backgroundColor: computed.backgroundColor,
          background: computed.background,
          backgroundImage: computed.backgroundImage,
          borderColor: computed.borderColor,
          boxShadow: computed.boxShadow,
          color: computed.color,
        };
        
        console.log('Estilos computados:', relevantStyles);
        
        // Verificar regras CSS que afetam este elemento
        const sheets = Array.from(document.styleSheets);
        sheets.forEach((sheet, sheetIndex) => {
          try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            rules.forEach((rule, ruleIndex) => {
              if (rule instanceof CSSStyleRule) {
                if (element.matches(rule.selectorText)) {
                  console.log(`Regra ${sheetIndex}-${ruleIndex}:`, rule.selectorText);
                  console.log('Estilos da regra:', rule.style.cssText);
                }
              }
            });
          } catch (e) {
            console.log('Não foi possível acessar stylesheet:', sheet.href);
          }
        });
      });
    };

    // Adicionar botão de debug
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Debug CSS';
    debugButton.style.position = 'fixed';
    debugButton.style.top = '10px';
    debugButton.style.right = '10px';
    debugButton.style.zIndex = '9999';
    debugButton.style.padding = '10px';
    debugButton.style.background = 'red';
    debugButton.style.color = 'white';
    debugButton.onclick = debugStyles;
    document.body.appendChild(debugButton);

    return () => {
      document.body.removeChild(debugButton);
    };
  }, []);

  return null;
};

export default CSSDebugger;















