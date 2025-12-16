import { createContext, useEffect, useRef, useState } from "react";
import useOnlineBoard from "../hooks/useOnlineBoard";
import { FallingChipState, MoveDonePayload } from "../types";
import { Game } from "../models/Game";
import { fallingAnimation, hoverAnimation, idleAnimation, restingAnimation } from "../utils/animations";

interface OnlineAnimatedBoardContextType {
     lastSolidChip: {col: number, row: number, player: string} | null;
     fallingChip: FallingChipState | null;
     winner: string | null;
     setHoverCol: React.Dispatch<React.SetStateAction<number | null>>;
     getAnimation: (state: FallingChipState, cellSize?: number) => any;
     throwChip: (col: string) => void;
     sleepChip: () => void;
     rematch: () => void;
     hoverCol: number | null;
     board: string[][];
}

export const OnlineAnimatedBoardContext = createContext<OnlineAnimatedBoardContextType | null>(null);

    export const OnlineAnimatedBoardProvider = ({ children }: { children: React.ReactNode }) => {
    const {board, winner, turn, lastMove, makeMove, resetBoard, game} = useOnlineBoard();
    const [fallingChip, setFallingChip] = useState<FallingChipState | null>(null);
    const [hoverCol, setHoverCol] = useState<number | null>(null);
    const [lastSolidChip, setLastSolidChip] = useState<{col: number, row: number, player: string} | null>(null);
    
    useEffect(() => {
        if (!fallingChip) return;
        if (fallingChip.state === "resting") {
            setLastSolidChip({
                col: fallingChip.col!,
                row: fallingChip.row!,
                player: fallingChip.player!
            });
        }
    }, [fallingChip])
    
    useEffect(() => {
        if (!lastSolidChip) return;
            
        if (lastSolidChip.col === fallingChip?.col && lastSolidChip.row === fallingChip?.row) {
            if (lastSolidChip.col === hoverCol) {
                setFallingChip({
                    state: "hover",
                    col: lastSolidChip.col,
                    row: lastSolidChip.row,
                    player: turn
                    });
            } else if (hoverCol !== null) {
                setFallingChip({
                    state: "hover",
                    col: hoverCol,
                    player: turn
                });
            } else {
                setFallingChip({
                    state: "idle",
                });
            }
        }}, [lastSolidChip])

    useEffect(() => {
        if (hoverCol !== null && fallingChip?.state !== "falling") {
            setFallingChip({
                state: "hover",
                col: hoverCol,
                player: turn
            });
        };
    }, [hoverCol])

    function getAnimation(state: FallingChipState, cellSize?: number) {
        if (state.state === "falling") {
            return fallingAnimation(state.row!, cellSize);
        }
        if (state.state === "hover") {
            return hoverAnimation(cellSize);
        }
        if (state.state === "idle") {
            return idleAnimation(cellSize);
        }
        if (state.state === "resting") {
            return restingAnimation(state.row!, cellSize);
        }
    }

    async function throwChip(col: string) {
      makeMove(col).then((payload) => {
        setFallingChip({
          state: "falling",
          col: Number(payload.lastMove.column),
          row: Number(payload.lastMove.rowIndex),
          player: payload.lastMove.userId === game!.player1 ? "1" : "2"
        });
      });
    }

    async function sleepChip() {
      setFallingChip({
        state: "resting",
        col: Number(lastMove!.column),
        row: Number(lastMove!.rowIndex),
        player: lastMove!.userId === game!.player1 ? "1" : "2"
      });
    }

    async function rematch() {
      resetBoard().then(() => {
        setFallingChip(null);
        setHoverCol(null);
        setLastSolidChip(null);  
      });
    }

    return (
        <OnlineAnimatedBoardContext.Provider value={{
            lastSolidChip,
            fallingChip,
            winner,
            setHoverCol,
            getAnimation,
            throwChip,
            sleepChip,
            rematch,
            hoverCol,
            board
        }}>
            {children}
        </OnlineAnimatedBoardContext.Provider>
    );
}
