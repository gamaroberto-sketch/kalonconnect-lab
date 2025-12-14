import "@/styles/globals.css";
import '../styles/autofill-fix.css';
import "@livekit/components-styles";
import "@livekit/components-styles/prefabs/index.css";
import { AuthProvider } from '../components/AuthContext';
import { ThemeProvider } from '../components/ThemeProvider';
import { LanguageProvider } from '../contexts/LanguageContext';
import AdminAccess from '../components/AdminAccess';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Remover service workers e caches
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
    }

    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Component {...pageProps} />
          <AdminAccess />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
