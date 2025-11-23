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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function fixBlockingOverlays() {
                  const problematicSelectors = [
                    '.absolute.inset-0.overflow-hidden',
                    '.absolute.top-20',
                    '.absolute.bottom-20',
                    '.absolute.top-1\\\\/2',
                    '[class*="absolute"][class*="inset-0"]'
                  ];
                  
                  problematicSelectors.forEach(selector => {
                    try {
                      const elements = document.querySelectorAll(selector);
                      elements.forEach(el => {
                        const style = window.getComputedStyle(el);
                        const zIndex = parseInt(style.zIndex) || 0;
                        if (zIndex >= 1000 && el.id !== 'video-anchor') {
                          el.style.pointerEvents = 'none';
                          el.style.zIndex = '-1';
                        }
                      });
                    } catch (e) {}
                  });
                  
                  // Verificar todos os elementos com z-index muito alto
                  const allElements = document.querySelectorAll('*');
                  allElements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const zIndex = parseInt(style.zIndex) || 0;
                    if (zIndex >= 9999 && el.id !== 'video-anchor' && style.pointerEvents === 'auto') {
                      el.style.pointerEvents = 'none';
                    }
                  });
                }
                
                // Executar imediatamente
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', fixBlockingOverlays);
                } else {
                  fixBlockingOverlays();
                }
                
                // Executar periodicamente para pegar elementos que aparecem depois
                setInterval(fixBlockingOverlays, 500);
                
                // Observer para elementos dinâmicos
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver(fixBlockingOverlays);
                  observer.observe(document.body, { childList: true, subtree: true });
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
