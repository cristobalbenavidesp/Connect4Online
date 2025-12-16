import { CONNECT_TO_WIN, TOTAL_COLUMNS, TOTAL_ROWS, TURNS } from "../constants";

export class Board {
  private boardBoxes: string[][]; // boardBoxes[col][row], row 0 is bottom

  constructor() {
    this.boardBoxes = Array.from({ length: TOTAL_COLUMNS }, () =>
      Array.from({ length: TOTAL_ROWS }, () => TURNS.EMPTY)
    );
  }

  // returns board as string
  public getBoard(): string[][]{
    return this.boardBoxes;
  }

  // Place piece in lowest available row (row 0 is bottom). Returns rowIndex.
  public makeMove(column: number, player: "1" | "2"): number {
    if (player !== "1" && player !== "2") {
      throw new Error("Invalid player token");
    }
    if (column < 0 || column >= TOTAL_COLUMNS) {
      throw new Error("Invalid column");
    }

    const col = this.boardBoxes[column];
    if (!col) throw new Error("Column data is undefined");

    const moveRow = col.findIndex(cell => cell === TURNS.EMPTY); // first empty = bottom
    if (moveRow === -1) throw new Error("Column is full");

    col[moveRow] = player;
    return moveRow;
  }

  public resetBoard() {
    this.boardBoxes = Array.from({ length: TOTAL_COLUMNS }, () =>
      Array.from({ length: TOTAL_ROWS }, () => TURNS.EMPTY)
    );
  }

  // Helper: count same-player pieces from (col,row) in direction (dc,dr) excluding origin
  private countInDirection(colIndex: number, rowIndex: number, dc: number, dr: number, player: string): number {
    let count = 0;
    let c = colIndex + dc;
    let r = rowIndex + dr;
    while (c >= 0 && c < TOTAL_COLUMNS && r >= 0 && r < TOTAL_ROWS) {
      if (this.boardBoxes[c][r] === player) {
        count++;
        c += dc;
        r += dr;
      } else {
        break;
      }
    }
    return count;
  }

  public checkIfMoveWins(colIndex: number, rowIndex: number, player: string): boolean {
    // Basic validations
    if (colIndex < 0 || colIndex >= TOTAL_COLUMNS) throw new Error("Invalid column index");
    if (rowIndex < 0 || rowIndex >= TOTAL_ROWS) throw new Error("Invalid row index");
    if (player !== "1" && player !== "2") throw new Error("Invalid player");

    // Vertical: count up and down (dr = +1 up, -1 down). Here row 0 is bottom so "up" = +1
    const verticalCount = 1
      + this.countInDirection(colIndex, rowIndex, 0, 1, player)   // up
      + this.countInDirection(colIndex, rowIndex, 0, -1, player); // down
    if (verticalCount >= CONNECT_TO_WIN) return true;

    // Horizontal: left (-1,0) and right (+1,0)
    const horizontalCount = 1
      + this.countInDirection(colIndex, rowIndex, -1, 0, player)
      + this.countInDirection(colIndex, rowIndex, 1, 0, player);
    if (horizontalCount >= CONNECT_TO_WIN) return true;

    // Negative slope diagonal (↘): down-right (+1,-1) and up-left (-1,+1)
    // Note: with row0 bottom, down means row -1 (invalid) so directions chosen accordingly:
    const negDiagCount = 1
      + this.countInDirection(colIndex, rowIndex, 1, -1, player)  // down-right
      + this.countInDirection(colIndex, rowIndex, -1, 1, player);  // up-left
    if (negDiagCount >= CONNECT_TO_WIN) return true;

    // Positive slope diagonal (↗): up-right (+1,+1) and down-left (-1,-1)
    const posDiagCount = 1
      + this.countInDirection(colIndex, rowIndex, 1, 1, player)    // up-right
      + this.countInDirection(colIndex, rowIndex, -1, -1, player); // down-left
    if (posDiagCount >= CONNECT_TO_WIN) return true;

    return false;
  }
}
