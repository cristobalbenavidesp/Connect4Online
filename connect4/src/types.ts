export type FallingChipState = { state: "idle" | "falling" | "hover" | "resting", col?: number, row?: number, player?: "1" | "2" }

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
