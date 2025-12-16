import { Server, Socket } from "socket.io";

export type User = {
  id: string;
  username: string;
};

export type Game = {
  id: string;
  player1: string;
  player2: string;
  player1Username: string;
  player2Username: string;
  turn: string;
};

export type Invitation = {
  id: string;
  users: User[];
};

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  session: (data: { sessionID: string; userID: string; username: string }) => void;
  users: (users: User[]) => void;
  user_connected: (user: User) => void;
  user_disconnected: (id: string) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  login: (username: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  sessionID: string;
  userID: string;
  username: string;
}

export type Io = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;


export interface MoveDonePayload {
    board: string[][];
    turn: "1" | "2";
    score: { player1: number; player2: number };
    isWin: boolean;
    lastMove: {
        column: string;
        userId: string;
        rowIndex: string;
      }
}
