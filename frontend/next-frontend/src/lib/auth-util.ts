// Shared variable to store the current refresh promise
let refreshTokenPromise: Promise<string | null> | null = null;

export const getAccessToken = async () => {
  // 1. If a refresh is ALREADY happening, return the same promise
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  // 2. If no refresh is happening, create a new one
  refreshTokenPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw data;
      return data.token; 
    } catch (error) {
      return null;
    } finally {
      // 3. Clear the promise when done so future calls can start fresh
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};