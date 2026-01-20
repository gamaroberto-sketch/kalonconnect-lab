import GlobalErrorBoundary from '../components/GlobalErrorBoundary'; // 🟢 Added Import

export default function App({ Component, pageProps }) {
  // ... (useEffect remains same)

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
