import { randomInt } from "crypto";
import { Board } from "./Board.js";

export class Game extends Board {
  id: string;
  player1: string;
  player2: string;
  player1Username: string;
  player2Username: string;
  turn: string;
  score: {
    player1: number;
    player2: number;
  };

  constructor(id: string, player1: string, player2: string, player1Username: string, player2Username: string) {
    super();
    this.id = id;
    this.player1 = player1;
    this.player2 = player2;
    this.player1Username = player1Username;
    this.player2Username = player2Username;
    // random number between 1 and 2 to decide who starts
    this.turn = randomInt(1, 3).toString();
    this.score = {
      player1: 0,
      player2: 0,
    };
  }

  public makePlay(column: number, player: "1" | "2") {
    const rowIndex = this.makeMove(column, player);
    const isWin = this.checkIfMoveWins(column, rowIndex, player);
    if (isWin) {
      player === "1" ? this.score.player1++ : this.score.player2++;
      return { isWin: true, rowIndex };
    } else {
      this.turn = this.turn === "1" ? "2" : "1";
      return { isWin: false, rowIndex};
    }
  }
}
