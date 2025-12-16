import { io } from "socket.io-client";


let socket: any = null;
let connectionTimeout: any = null;



const DEBUG_SOCKET = import.meta.env.VITE_DEBUG_SOCKET === "true";

export function connectSocket(username?: string): Promise<any> {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
    connectionTimeout = null;
  }

  return new Promise((resolve, reject) => {
    const stored = sessionStorage.getItem("sessionID");
    const session = stored ? JSON.parse(stored) : null;
    const sessionID = session?.sessionID;



    // Primera instancia del socket
    const newSocket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:3000", {
      autoConnect: false,
      auth: sessionID ? { token: sessionID } : { username },
      reconnection: false,
      transports: ['websocket', 'polling']
    });

    // Update global reference
    socket = newSocket;

    if (DEBUG_SOCKET) {
      newSocket.onAny((event: string, ...args: any[]) => {
        console.log(`[Socket IN] ${event}`, ...args);
      });

      const originalEmit = newSocket.emit;
      newSocket.emit = function (event: string, ...args: any[]) {
        console.log(`[Socket OUT] ${event}`, ...args);
        return originalEmit.call(this, event, ...args);
      };
    }

    connectionTimeout = setTimeout(() => {
      console.warn("[Socket] Connection timed out");
      newSocket.disconnect();
      reject("timeout");
    }, 8000);

    newSocket.on("connect", () => {
      if (DEBUG_SOCKET) console.log(`[Socket] Connected successfully with ID: ${newSocket.id}`);
    });

    newSocket.on("disconnect", (reason: any) => {
      if (DEBUG_SOCKET) console.log(`[Socket] Disconnected: ${reason}`);
    });

    const handleSession = (data: { sessionID: string; userID: string; username: string }) => {
      if (DEBUG_SOCKET) console.log(`[Socket] Session event received:`, data);
      
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }

      sessionStorage.setItem(
        "sessionID",
        JSON.stringify({
          sessionID: data.sessionID,
          userID: data.userID,
          username: data.username
        })
      );

      cleanupListeners();
      resolve(newSocket);
    };

    const handleConnectError = (err: any) => {
      console.error(`[Socket] Connect error:`, err);
      if (err?.message === "invalid_token" || err?.data === "invalid_token") {
        sessionStorage.removeItem("sessionID");
        if (DEBUG_SOCKET) console.log("Invalid token, retrying without token...");
        cleanupListeners();
        
        if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
        }

        // Intentamos de nuevo, pero ahora sin token
        connectSocket(username)
          .then(resolve)
          .catch(reject);

        return;
      }

      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      cleanupListeners();
      reject(err?.message || "connect_error");
    };

    const handleError = (err: any) => {
      console.error(`[Socket] Error:`, err);
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      cleanupListeners();
      reject(err?.message || "error");
    };

    function cleanupListeners() {
      newSocket.off("session", handleSession);
      newSocket.off("connect_error", handleConnectError);
      newSocket.off("error", handleError);
    }

    newSocket.on("session", handleSession);
    newSocket.on("connect_error", handleConnectError);
    newSocket.on("error", handleError);

    if (DEBUG_SOCKET) console.log("[Socket] Calling newSocket.connect()");
    newSocket.connect();
  });
}

export function getSocket() {
  return socket;
}
