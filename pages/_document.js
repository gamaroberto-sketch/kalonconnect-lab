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
        {/* 🔧 TESTE: Script inline para garantir execução */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('🔴 [TESTE] Script inline no _document.js executado!', new Date().toISOString());
              window.__DOCUMENT_SCRIPT_EXECUTED__ = true;
              
              // Verificar se Next.js está carregando
              if (window.__NEXT_DATA__) {
                console.log('✅ Next.js data encontrado:', window.__NEXT_DATA__.page);
                window.__NEXT_DATA_FOUND__ = true;
              }
              
              // Aguardar carregamento dos scripts
              window.addEventListener('load', function() {
                console.log('🔴 [TESTE] Window load event disparado');
                window.__WINDOW_LOADED__ = true;
                
                // Verificar se _app.js foi executado após 2 segundos
                setTimeout(function() {
                  if (!window.__APP_MODULE_LOADED__) {
                    console.error('❌ [TESTE] _app.js NÃO foi executado após 2 segundos!');
                    console.error('❌ Verificando scripts...');
                    const scripts = Array.from(document.querySelectorAll('script[src]'));
                    console.error('❌ Total de scripts:', scripts.length);
                    scripts.forEach(s => {
                      console.error('  - Script:', s.src, 'readyState:', s.readyState);
                    });
                  }
                }, 2000);
              });
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
