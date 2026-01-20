import "@/styles/globals.css";
import '../styles/autofill-fix.css';
import "@livekit/components-styles";
import "@livekit/components-styles/prefabs/index.css";
import { AuthProvider } from '../components/AuthContext';
import { ThemeProvider } from '../components/ThemeProvider';
import { LanguageProvider } from '../contexts/LanguageContext';
import { FeedbackProvider } from '../contexts/FeedbackContext';
import AdminAccess from '../components/AdminAccess';
import ProfessionalGuideGate from '../components/ProfessionalGuideGate';
import { useEffect } from 'react';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary';

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
          <GlobalErrorBoundary>
            <FeedbackProvider>
              <ProfessionalGuideGate>
                <Component {...pageProps} />
                <AdminAccess />
              </ProfessionalGuideGate>
            </FeedbackProvider>
          </GlobalErrorBoundary>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
