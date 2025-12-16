import { Board } from "./Board.js";

export class Game {
  private player1: string;
  private player2: string;
  private turn: "1" | "2";
  private score: {
    player1: number;
    player2: number;
  };
  private board: Board;

  constructor() {
    this.player1 = "player1";
    this.player2 = "player2";
    // random number between 1 and 2 to decide who starts
    this.turn = (Math.floor(Math.random() * 2) + 1).toString() as "1" | "2";
    this.score = {
      player1: 0,
      player2: 0,
    };
    this.board = new Board();
  }

  public makePlay(column: number, player: "1" | "2") {
    const rowIndex = this.board.makeMove(column, player);
    const isWin = this.board.checkIfMoveWins(column, rowIndex, player);
    if (isWin) {
      player === "1" ? this.score.player1++ : this.score.player2++;
      return { isWin: true, row: rowIndex };
    } else {
      this.turn = this.turn === "1" ? "2" : "1";
      return { isWin: false, row: rowIndex };
    }
  }

  public getBoard(): string[][] {
    return this.board.getBoard();
  }

  public getTurn() {
    return this.turn;
  }

  public getScore(): { player1: number; player2: number } {
    return this.score;
  }

  public resetBoard() {
    this.board.resetBoard();
    this.turn = (Math.floor(Math.random() * 2) + 1).toString() as "1" | "2";
  }

  public setPlayer1(player: string) {
    this.player1 = player;
  }

  public setPlayer2(player: string) {
    this.player2 = player;
  }

  public getPlayers(): { player1: string; player2: string } {
    return { player1: this.player1, player2: this.player2 };
  }   
}
