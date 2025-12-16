import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useRoom from "./useRoom";
import { TURNS } from "../constants";
import { MoveDonePayload } from "../types";

function useOnlineBoard() {
  const room = useRoom();
  const { game, user, socket, setGame, winner, setWinner } = room;
  const navigate = useNavigate();
  const [columnHover, setColumnHover] = useState<number | null>(null);

  useEffect(() => {
    if (!game) {
      navigate("/online");
    }
  }, [game, navigate]);

  const player = user!.userID === game!.player1 ? TURNS.P1 : TURNS.P2
  const isTurn = player === game!.turn;


  const makeMove = (column: string) => {
      return new Promise<MoveDonePayload>((resolve, reject) => {
        socket.emit("move", game!.id, { column: Number(column), userId: user!.userID }, (payload: MoveDonePayload) => {
          const timeout = setTimeout(() => {
            reject("Timeout");
          }, 10000);
          
          clearTimeout(timeout);
          resolve(payload);
        });
      });
    };


  function resetBoard() {
      return new Promise<void>((resolve, reject) => {
        socket.emit("reset", game!.id, (response : {
          board: string[][],
          turn: "1" | "2",
          score: { player1: number, player2: number },
        }) => {
          if (response) {
            setGame((prev) => prev ? ({
              ...prev,
              boardBoxes: response.board,
              turn: response.turn,
              score: response.score,
            }) : prev);
            resolve();
          } else {
            reject("Error resetting board");
          }
        });
      });
  }

  useEffect(() => {
    if (!socket) return;
    
    // Movimiento realizado por cualquier jugador
    const onMoveDone = (payload: MoveDonePayload) => {
        setGame((prev) =>
          prev ? {
            ...prev,
            boardBoxes: payload.board,
            turn: payload.turn,
            score: payload.score,
            lastMove: payload.lastMove
          } : prev
        );
        setWinner(payload.isWin ? payload.lastMove.userId : null);
    };

    socket.on("moveDone", onMoveDone);

    return () => {
      socket.off("moveDone", onMoveDone);
    };
  }, [socket, setGame]);


  return {board: game!.boardBoxes, winner, makeMove, resetBoard, isTurn, player, columnHover, setColumnHover, turn: game!.turn, lastMove: game!.lastMove, game};
}

export default useOnlineBoard;
