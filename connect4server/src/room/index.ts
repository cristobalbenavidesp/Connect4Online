import { Game } from "../models/Game.js";
import type { Invitation, MoveDonePayload } from "../types.js";
import { v4 as uuidv4 } from "uuid";
import { GameService, isUserInGame } from "../services/game.service.js";
import { TOTAL_COLUMNS } from "../constants.js";
import { getUserById, SessionService } from "../services/session.service.js";

export const manageInvites = (socket: any, io: any) => {
  
  socket.on("send-invite", async ({ recieverId }: { recieverId: string }, 
    callback: (id: string) => void
  ) => {
    const targetId = recieverId.trim();
    const receiver = await getUserById(targetId);
    console.log(receiver);
    if (!receiver) return;

    const invitation: Invitation = {
      id: uuidv4(),
      users: [
        { id: socket.data.userID!, username: socket.data.username! },
        { id: targetId, username: receiver.username }
      ]
    };

    io.to(receiver.userId).emit("invitation", invitation);
    callback(invitation.id)
  });

  socket.on("accept-invite", async (invitation: Invitation, callback: (error?: string) => void) => {
    /*
      1. Receiver accepts invitation.
      2. Create game.
      3. Receiver joins room.
      4. Notify sender (all sockets).
    */

    const receiverId = socket.data.userID!;
    const senderId = invitation.users.find(u => u.id !== receiverId)!.id;

    if (await isUserInGame(senderId) || await isUserInGame(receiverId)) {
      callback("user-already-in-game");
      io.to(senderId).emit("invitation-rejected", invitation.id);
      return;
    }

    const gameId = uuidv4();
    const game = new Game(
      gameId, 
      invitation.users[0].id, 
      invitation.users[1].id,
      invitation.users[0].username,
      invitation.users[1].username
    );


    await GameService.saveGame(game);

    socket.join(gameId);

    // Notify the sender user (all its sockets)
    io.to(senderId).emit("room-created", { gameId, inviteId: invitation.id });
  });

  socket.on("reject-invite", async (invitation: Invitation, callback: (ok: string) => void) => {
    /*
      1. Receiver rejects invitation.
    */
    
    const senderId = invitation.users[0].id === socket.data.userID! ? invitation.users[1].id : invitation.users[0].id;

    // Notify the sender user (all its sockets)
    io.to(senderId).emit("invitation-rejected", invitation.id);

    callback("ok");
  });

  socket.on("join-room", async (gameId: string) => {
    /*
      Sender user receives room-created and calls join-room.
    */

    socket.join(gameId);

    const game = await GameService.getGame(gameId);
    if (game) {
      io.to(gameId).emit("game-started", game);
    }
  });

socket.on("leave", async (gameId: string) => {
  // User identity (not socket identity)
  const userId = socket.data.userID!;

  // Remove this socket from the game room
  socket.leave(gameId);

  /*
    Notify the opponent:
    - who left (userId)
    - which game ended (gameId)
  */
  socket.to(gameId).emit("leave", { gameId, userId });

  // Remove the game from Redis / DB
  await GameService.deleteGame(gameId);
});

  socket.on("disconnect", () => {
    /*
      No game cleanup here because:
      - A user may reconnect with another socket.
      - SessionService + Redis TTL handles session expiration.
    */
  });

  socket.on("move", async (gameId: string, move: { column: number; userId: string }, callback: (payload: MoveDonePayload) => void) => {
    const game = await GameService.getGame(gameId);
    if (!game) return;
    
    // Refresh session on move
    if (socket.data.sessionID) {
      await SessionService.refreshSession(socket.data.sessionID);
    }

    // Validate data types
    if (typeof move.column !== "number" || move.column < 0 || move.column >= TOTAL_COLUMNS) {
      return socket.emit("error", "Invalid column");
    }

    if (!move.userId || (move.userId !== game.player1 && move.userId !== game.player2)) {
      return socket.emit("error", "Invalid player");
    }

    // Validate turn
    const expectedPlayer = game.turn === "1" ? game.player1 : game.player2;
    if (move.userId !== expectedPlayer) {
      return socket.emit("error", "Not your turn");
    }

    let result: {isWin: boolean, rowIndex: number};
    if (game.player2 === move.userId) {
      result = game.makePlay(move.column, "2");
    } else {
      result = game.makePlay(move.column, "1");
    }

    await GameService.saveGame(game);

    const payload = {
      board: game.getBoard(),
      turn: game.turn as "1" | "2",
      score: game.score,
      isWin: result.isWin,
      lastMove: {
        column: move.column.toString(),
        rowIndex: result.rowIndex.toString(),
        userId: move.userId
      }
    };

    callback(payload);
    io.to(gameId).emit("moveDone", payload);
  });

  socket.on("reset", async (gameId: string, callback: (game: 
    {
      board: string[][],
      turn: "1" | "2",
      score: { player1: number, player2: number },
    }
  ) => void) => {
    const game = await GameService.getGame(gameId);
    if (!game) return;

    game.resetBoard();
    await GameService.saveGame(game);

    callback({
      board: game.getBoard(),
      turn: game.turn as "1" | "2",
      score: game.score,
    });
  });
}
