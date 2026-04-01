import { createContext, startTransition, useContext, useEffect, useState } from "react";

import { getSessionPayload, logoutUser, setLanguagePreference } from "@/lib/api";

const defaultSession = {
  authenticated: false,
  lang: "en",
  user: null
};

const SessionContext = createContext({
  session: defaultSession,
  sessionLoading: true,
  languageUpdating: false,
  sessionError: "",
  backendReachable: true,
  refreshSession: async () => defaultSession,
  updateLanguage: async () => {},
  signOut: async () => {}
});

export function SessionProvider({ children }) {
  const [session, setSession] = useState(defaultSession);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [languageUpdating, setLanguageUpdating] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [backendReachable, setBackendReachable] = useState(true);

  const refreshSession = async () => {
    try {
      const payload = await getSessionPayload();
      startTransition(() => {
        setSession({
          authenticated: Boolean(payload?.authenticated),
          lang: payload?.lang || "en",
          user: payload?.user || null
        });
      });
      setBackendReachable(true);
      setSessionError("");
      return payload;
    } catch (error) {
      startTransition(() => {
        setSession(defaultSession);
      });
      setBackendReachable(false);
      setSessionError("Backend not reachable. Demo content is still available locally.");
      return defaultSession;
    } finally {
      setSessionLoading(false);
    }
  };

  const signOut = async () => {
    await logoutUser();
    await refreshSession();
  };

  const updateLanguage = async (lang) => {
    if (!lang || lang === session.lang) {
      return { success: true, lang: session.lang || "en" };
    }

    const previousLang = session.lang || "en";
    startTransition(() => {
      setSession((current) => ({
        ...current,
        lang
      }));
    });
    setLanguageUpdating(true);
    setSessionError("");

    try {
      const payload = await setLanguagePreference(lang);
      startTransition(() => {
        setSession((current) => ({
          ...current,
          lang: payload?.lang || lang
        }));
      });
      setBackendReachable(true);
      return payload;
    } catch (error) {
      startTransition(() => {
        setSession((current) => ({
          ...current,
          lang: previousLang
        }));
      });
      setBackendReachable(false);
      setSessionError("Language preferences could not be updated right now.");
      throw error;
    } finally {
      setLanguageUpdating(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        sessionLoading,
        languageUpdating,
        sessionError,
        backendReachable,
        refreshSession,
        updateLanguage,
        signOut
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
