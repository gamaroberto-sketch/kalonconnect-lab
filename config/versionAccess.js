export const VERSION_LEVELS = {
  DEMO: 1,
  NORMAL: 2,
  PRO: 3
};

export const ACCESS_MAP = {
  "/dashboard": "DEMO",
  "/dashboard-simple": "DEMO",
  "/consultations": "DEMO",
  "/financial": "NORMAL",
  "/reports": "PRO",
  "/waiting-room": "DEMO",
  "/waitingroom": "DEMO",
  "/settings": "NORMAL",
  "/home": "DEMO",
  "/admin/reports": "PRO",
  "/admin/test-users": "PRO"
};

export const FEATURES_ACCESS = {
  // Consultas
  "video.basic": "DEMO",
  "video.fullscreen": "NORMAL",
  "video.recording": "NORMAL",
  "video.transcription": "PRO",
  "video.summaryAI": "PRO",

  // Financeiro
  "banks.drawer": "NORMAL",
  "banks.accounts": "NORMAL",
  "banks.integrations": "PRO",

  // Relatórios
  "reports.basic": "NORMAL",
  "reports.analytics": "PRO",

  // Sala de Espera
  "waitingroom.customMedia": "NORMAL",
  "waitingroom.AIinteraction": "PRO",

  // Configurações
  "settings.theme": "DEMO",
  "settings.notifications": "NORMAL",
  "settings.integrations": "PRO"
};

