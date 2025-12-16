import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export interface UserSession {
  sessionID: string;
  userID: string;
  username: string;
}

export function useSession(socket: any) {
  const navigate = useNavigate();
  const [session, setSessionState] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem("sessionID");
    return saved ? JSON.parse(saved) : null;
  });

  const setSession = useCallback((newSession: UserSession | null) => {
    setSessionState(newSession);
    sessionStorage.setItem("sessionID", JSON.stringify(newSession));
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
    sessionStorage.removeItem("sessionID");
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Check if session exists in storage (handled by socket service) but not in state
    const stored = sessionStorage.getItem("sessionID");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSessionState((prev) => {
        if (!prev || prev.sessionID !== parsed.sessionID) {
          return parsed;
        }
        return prev;
      });
    }

    const handleSession = (data: UserSession | null, event: string) => {
      setSession(data);
    };

    if (session){
      const path = window.location.pathname;
      if (path === "/login") navigate("/online");
    }

    function onSession(data: UserSession) {
      handleSession(data, "login/singin");
    }

    socket.on("session", onSession);

    return () => {
      socket.off("session", onSession);
    };
  }, [socket, setSession]);

  return {
    session,
    setSession,
    clearSession
  };
}
