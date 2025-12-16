import { createContext, useEffect, useState } from "react";
import { Game } from "../models/Game";
import { FallingChipState } from "../types";
import { fallingAnimation, hoverAnimation, idleAnimation, restingAnimation } from "../utils/animations";
import useOnlineBoard from "../hooks/useOnlineBoard";

type AnimatedBoardContextType = {
    lastSolidChip: {col: number, row: number, player: string} | null;
    fallingChip: FallingChipState | null;
    winner: string | null;
    setHoverCol: React.Dispatch<React.SetStateAction<number | null>>;
    getAnimation: (state: FallingChipState, cellSize?: number) => any;
    throwChip: (col: number) => void;
    sleepChip: () => void;
    rematch: () => void;
    hoverCol: number | null;
    game: React.MutableRefObject<Game> | null;
    board: string[][];
}

export const AnimatedBoardContext = createContext<AnimatedBoardContextType | null>(null);

export function AnimatedBoardProvider({ children, game }: { children: React.ReactNode, game: React.MutableRefObject<Game> }) {

    const [lastSolidChip, setLastSolidChip] = useState<{col: number, row: number, player: string} | null>(null);
    const [fallingChip, setFallingChip] = useState<FallingChipState | null>(null);
    const [winner, setWinner] = useState<string | null>(null);
    const [hoverCol, setHoverCol] = useState<number | null>(null);

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
                    player: game.current.getTurn()
                });
            } else if (hoverCol !== null) {
                setFallingChip({
                    state: "hover",
                    col: hoverCol,
                    player: game.current.getTurn()
                });
            } else {
                setFallingChip({
                    state: "idle",
                });
            }
        }
    }, [lastSolidChip])

    useEffect(() => {
        if (hoverCol !== null && fallingChip?.state !== "falling") {
            setFallingChip({
                state: "hover",
                col: hoverCol,
                player: game.current.getTurn()
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

    function throwChip(col: number) {
        if (!game?.current) return;
        const player = game.current.getTurn();
        const { isWin, row } = game.current.makePlay(col, player);

        if (isWin) {
            setWinner(player);
        }

        setFallingChip({
            state: "falling",
            col,
            row,
            player
        });
    }

    function rematch() {
       game?.current?.resetBoard();
       setWinner(null);
       setFallingChip(null);
       setHoverCol(null);
       setLastSolidChip(null);   
    }

    const sleepChip = () => {
        setFallingChip((prev) => ({
            ...prev,
            state: "resting"
        }));
    }

    return (
        <AnimatedBoardContext.Provider value={{
            lastSolidChip,
            fallingChip,
            winner,
            hoverCol,
            setHoverCol,
            getAnimation,
            throwChip,
            rematch,
            sleepChip,
            game,
            board: game.current.getBoard(),
        }}>
            {children}
        </AnimatedBoardContext.Provider>
    );
}
