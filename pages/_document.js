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
        {/* 🔧 CORREÇÃO SIMPLIFICADA: Apenas na página de login */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Apenas executar na página de login
                  if (window.location.pathname === '/' || window.location.pathname === '/login') {
                    function fixOverlays() {
                      try {
                        // Apenas overlays decorativos da página welcome
                        document.querySelectorAll('.absolute.inset-0.overflow-hidden').forEach(el => {
                          if (el.id !== 'video-anchor' && 
                              (el.className.includes('bg-pink') || el.className.includes('bg-purple') || el.className.includes('bg-indigo'))) {
                            const style = window.getComputedStyle(el);
                            if (parseInt(style.zIndex) >= 1000) {
                              el.style.pointerEvents = 'none';
                            }
                          }
                        });
                      } catch(e) {}
                    }
                    
                    if (document.readyState === 'loading') {
                      document.addEventListener('DOMContentLoaded', fixOverlays);
                    } else {
                      fixOverlays();
                    }
                  }
                } catch(e) {
                  // Silenciar erros para não quebrar o app
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
