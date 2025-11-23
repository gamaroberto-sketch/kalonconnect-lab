export const ADMIN_SESSION_KEY = "kalon_admin_session";
export const ADMIN_SESSION_DURATION_MS = 20 * 60 * 1000;

const isClient = () => typeof window !== "undefined";

export const loadAdminSession = () => {
  if (!isClient()) return null;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.expiresAt) {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn("Falha ao carregar sessão administrativa:", error);
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
};

export const persistAdminSession = (token) => {
  if (!isClient()) return null;
  const payload = {
    token,
    expiresAt: Date.now() + ADMIN_SESSION_DURATION_MS
  };
  window.sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(payload));
  return payload;
};

export const clearAdminSession = () => {
  if (!isClient()) return;
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
};

export const remainingAdminSessionTime = () => {
  const session = loadAdminSession();
  if (!session) return 0;
  return Math.max(session.expiresAt - Date.now(), 0);
};






