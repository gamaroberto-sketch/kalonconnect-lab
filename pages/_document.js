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
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
