import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { connectSocket, getSocket } from "../services/socket";
import { useSession } from "../hooks/useSession";

// ---------- Types ----------

export interface UserSession {
  sessionID: string;
  userID: string;
  username: string;
}

export interface Invitation {
  id: string;
  users: { id: string; username: string }[];
}

export interface GameState {
  id: string;
  player1: string;
  player2: string;
  player1Username: string;
  player2Username: string;
  boardBoxes: string[][];
  turn: "1" | "2";
  score: { player1: number; player2: number };
  winner: string | null;
  lastMove: { column: string; userId: string, rowIndex: string } | null;
}

interface RoomContextType {
  user: UserSession | null;
  game: GameState | null;
  incomingInvitations: Invitation[];
  socket: ReturnType<typeof getSocket> | null;
  winner: string | null;
  setWinner: React.Dispatch<React.SetStateAction<string | null>>;
  connect: (username: string) => Promise<any>;
  sendInvite: (recieverId: string) => Promise<string>;
  acceptInvite: (inv: Invitation) => void;
  rejectInvite: (inv: Invitation) => void;
  joinRoom: (gameId: string) => void;
  leave: (gameId: string) => void;
  setGame: React.Dispatch<React.SetStateAction<GameState | null>>;
}

export const RoomContext = createContext<RoomContextType>({
  user: null,
  game: null,
  incomingInvitations: [],
  socket: null,
  winner: null,
  setWinner: () => {},
  connect: () => Promise.resolve(),
  sendInvite: () => Promise.resolve(""),
  acceptInvite: () => {},
  rejectInvite: () => {},
  joinRoom: () => {},
  leave: () => {},
  setGame: () => {},
});


// ---------- Provider ----------

export function RoomProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState | null>(null);
  const [incomingInvitations, setIncomingInvitations] = useState<Invitation[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [socket, setSocket] = useState<ReturnType<typeof getSocket> | null>(
    null
  );
  const {session: user, clearSession} = useSession(socket);

  const navigate = useNavigate();
  // Track inactivity
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);

    // Check inactivity every 10 seconds
    const interval = setInterval(() => {
      if (!user) return; // Only check if logged in
      const elapsed = Date.now() - lastActivityRef.current;
      const ONE_HOUR = 60 * 60 * 1000;
      
      if (elapsed > ONE_HOUR) {
        toast.error("Session expired due to inactivity");
        // Check if in game
        if (game) {
          navigate("/");
        }
        clearSession();
      }
    }, 10000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearInterval(interval);
    };
  }, [game, user, clearSession, navigate]);

  const invitePromises = useRef<{
    [inviteId: string]: {
      resolve: (v: string) => void;
      reject: (e?: any) => void;
    };
  }>({});



  const connect = async (username: string) => {
    return connectSocket(username).then((s) => {
      setSocket(s);
    });
  };

  const sendInvite = (recieverId: string) => {
    return new Promise<string>((resolve, reject) => {

      const s = socket || getSocket();

      if (!s) return reject("No socket");

      s.emit("send-invite", { recieverId }, (inviteId: string) => {

        const timeout = setTimeout(() => {
          reject("Timeout");
          delete invitePromises.current[inviteId];
        }, 10000);

        invitePromises.current[inviteId] = {
          resolve: (value) => {
            clearTimeout(timeout);
            resolve(value);
          },
          reject: (err) => {
            clearTimeout(timeout);
            reject(err);
          },
        };
      });
    });
  };

  const acceptInvite = (inv: Invitation) => {
    socket?.emit("accept-invite", inv);
  };

  const rejectInvite = (inv: Invitation) => {
    socket?.emit("reject-invite", inv, (ok: string) => {
      if (ok === "ok") {
        setIncomingInvitations((prev) => prev.filter((i) => i.id !== inv.id));
      } else {
        toast.error("Error rejecting invite, retry");
      }
    });
  };

  const joinRoom = (gameId: string) => {
    socket?.emit("join-room", gameId);
  };

  const leave = (gameId: string) => {
    socket?.emit("leave", gameId);
    setGame(null);
  };

  function cancelAllInvitePromisesExcept(exceptId: string) {
    for (const id of Object.keys(invitePromises.current)) {
      if (id !== exceptId) {
        invitePromises.current[id].reject("other-invite-accepted");
        delete invitePromises.current[id];
      }
    }
  }

  // ---------------- LISTENERS -----------------
  useEffect(() => {
    if (!socket) return;

    socket.on("invitation", (inv: Invitation) => {
      setIncomingInvitations((prev) => [...prev, inv]);
    });


    socket.on("room-created", ({ gameId, inviteId }: { gameId: string; inviteId: string }) => {

      if (game) {
        const p = invitePromises.current[inviteId];
        if (p) {
          p.reject("already-in-game");
          delete invitePromises.current[inviteId];
        }
        return;
      }

      const p = invitePromises.current[inviteId];
      if (p) {
        p.resolve(gameId);
        delete invitePromises.current[inviteId];
      }

      cancelAllInvitePromisesExcept(inviteId);
      joinRoom(gameId);

    });

    socket.on("invitation-rejected", (inviteId: string) => {
      invitePromises.current[inviteId].reject("rejected");
      delete invitePromises.current[inviteId];
    });

    socket.on("game-started", (g: GameState) => {
      toast.success("Game started")
      setGame(g);
    });

    socket.on("leave", ({ gameId, userId }: { gameId: string; userId: string }) => {
      toast.error("Opponent left the game");
      setGame(null);
      navigate("/online");
    });



    return () => {
      socket.off("session");
      socket.off("invitation");
      socket.off("room-created");
      socket.off("game-started");
      socket.off("leave");
      socket.off("user_disconnected");
    };
  }, [socket]);

  useEffect(() => {
    if (game) navigate(`/online/${game.id}`);
  }, [game]);

  // Auto-connect if user exists but socket is not connected
  const connectingRef = useRef(false);
  useEffect(() => {
    if (user && !socket) {
      const globalSocket = getSocket();
      if (globalSocket) {
        setSocket(globalSocket);
      } else if (!connectingRef.current) {
        connectingRef.current = true;
        connect(user.username)
          .catch(() => {})
          .finally(() => {
            connectingRef.current = false;
          });
      }
    }
  }, [user, socket]);

  return (
    <RoomContext.Provider
      value={{
        user,
        game,
        incomingInvitations,
        socket,
        winner,
        setWinner,
        connect,
        sendInvite,
        acceptInvite,
        rejectInvite,
        joinRoom,
        leave,
        setGame
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}
