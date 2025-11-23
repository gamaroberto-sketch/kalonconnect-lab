import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        {/* 🌍 ÂNCORA PERSISTENTE - FORA DO CICLO REACT */}
        {/* Esta âncora nunca será removida/recriada pelo React */}
        <div 
          id="video-anchor" 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999,
            pointerEvents: "none",
            display: "none" // Inicialmente oculta, será controlada via CSS quando necessário
          }}
        />
        {/* 🔧 CORREÇÃO IMEDIATA: Remover overlays bloqueantes ANTES do React carregar */}
        {/* ⚠️ IMPORTANTE: Não afetar elementos de vídeo legítimos */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function isVideoElement(el) {
                  // Verificar se é um elemento de vídeo legítimo
                  const id = el.id || '';
                  const className = el.className || '';
                  const tagName = el.tagName || '';
                  
                  // IDs relacionados a vídeo
                  if (id.includes('video') || id.includes('anchor') || id.includes('container')) {
                    return true;
                  }
                  
                  // Classes relacionadas a vídeo
                  if (className.includes('video') || className.includes('VideoSurface') || 
                      className.includes('livekit') || className.includes('LiveKit')) {
                    return true;
                  }
                  
                  // Tags de vídeo
                  if (tagName === 'VIDEO' || tagName === 'CANVAS') {
                    return true;
                  }
                  
                  // Verificar se está dentro de um container de vídeo
                  let parent = el.parentElement;
                  let depth = 0;
                  while (parent && depth < 5) {
                    const parentId = parent.id || '';
                    const parentClass = parent.className || '';
                    if (parentId.includes('video') || parentId.includes('container') ||
                        parentClass.includes('video') || parentClass.includes('VideoSurface')) {
                      return true;
                    }
                    parent = parent.parentElement;
                    depth++;
                  }
                  
                  return false;
                }
                
                function fixBlockingOverlays() {
                  // Apenas elementos decorativos da página welcome (backgrounds animados)
                  const problematicSelectors = [
                    '.absolute.inset-0.overflow-hidden:not([id*="video"]):not([class*="video"]):not([class*="VideoSurface"])',
                    '.absolute.top-20.left-20:not([id*="video"]):not([class*="video"])',
                    '.absolute.bottom-20.right-20:not([id*="video"]):not([class*="video"])',
                    '.absolute.top-1\\\\/2.left-1\\\\/2:not([id*="video"]):not([class*="video"])'
                  ];
                  
                  problematicSelectors.forEach(selector => {
                    try {
                      const elements = document.querySelectorAll(selector);
                      elements.forEach(el => {
                        // Pular elementos de vídeo
                        if (isVideoElement(el)) {
                          return;
                        }
                        
                        const style = window.getComputedStyle(el);
                        const zIndex = parseInt(style.zIndex) || 0;
                        
                        // Apenas corrigir se for claramente um overlay decorativo
                        // (elementos da página welcome têm classes específicas)
                        const isWelcomeOverlay = el.className.includes('bg-pink-200') || 
                                                 el.className.includes('bg-purple-200') || 
                                                 el.className.includes('bg-indigo-200') ||
                                                 el.className.includes('blur-xl') ||
                                                 el.className.includes('blur-2xl');
                        
                        if (zIndex >= 1000 && isWelcomeOverlay && el.id !== 'video-anchor') {
                          el.style.pointerEvents = 'none';
                          el.style.zIndex = '-1';
                        }
                      });
                    } catch (e) {}
                  });
                  
                  // Verificar elementos com z-index muito alto APENAS se forem overlays decorativos
                  const allElements = document.querySelectorAll('*');
                  allElements.forEach(el => {
                    // Pular elementos de vídeo
                    if (isVideoElement(el)) {
                      return;
                    }
                    
                    const style = window.getComputedStyle(el);
                    const zIndex = parseInt(style.zIndex) || 0;
                    
                    // Apenas corrigir overlays decorativos da página welcome
                    const isWelcomeOverlay = (el.className.includes('bg-pink-200') || 
                                             el.className.includes('bg-purple-200') || 
                                             el.className.includes('bg-indigo-200') ||
                                             el.className.includes('blur-xl') ||
                                             el.className.includes('blur-2xl')) &&
                                            el.id !== 'video-anchor';
                    
                    if (zIndex >= 9999 && isWelcomeOverlay && style.pointerEvents === 'auto') {
                      el.style.pointerEvents = 'none';
                    }
                  });
                }
                
                // Executar apenas na página de login (não em páginas com vídeo)
                function shouldRunFix() {
                  const path = window.location.pathname;
                  // Não executar em páginas que usam vídeo
                  if (path.includes('/consultations') || path.includes('/home') || 
                      path.includes('/event') || path.includes('/waiting')) {
                    return false;
                  }
                  return true;
                }
                
                // Executar imediatamente apenas se estiver na página de login
                if (shouldRunFix()) {
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', fixBlockingOverlays);
                  } else {
                    fixBlockingOverlays();
                  }
                  
                  // Executar periodicamente apenas na página de login
                  const intervalId = setInterval(() => {
                    if (shouldRunFix()) {
                      fixBlockingOverlays();
                    } else {
                      clearInterval(intervalId);
                    }
                  }, 500);
                  
                  // Observer para elementos dinâmicos (apenas na página de login)
                  if (typeof MutationObserver !== 'undefined') {
                    const observer = new MutationObserver(() => {
                      if (shouldRunFix()) {
                        fixBlockingOverlays();
                      }
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                  }
                }
              })();
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
