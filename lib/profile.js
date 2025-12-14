export async function getProfile(userId) {
  try {
    if (!userId) {
      console.warn("⚠️ [getProfile] No userId provided");
      return null;
    }

    // Timeout de 3 segundos para evitar travamento
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`/api/user/profile?userId=${userId}`, {
      cache: "no-cache",
      signal: controller.signal,
      headers: {
        'x-user-id': userId
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn("⚠️ [getProfile] Timeout - retornando null");
    } else {
      console.error("Failed to fetch profile data:", error);
    }
    return null;
  }
}
