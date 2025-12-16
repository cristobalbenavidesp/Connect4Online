import { beforeEach, describe, expect, test } from "@jest/globals";
import { Board } from "./Board";
import { EMPTY_BOX, TOTAL_COLUMNS, TOTAL_ROWS } from "../constants";

describe("Board", () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  /* ---------------------------------------------------------
   * Board construction
   * --------------------------------------------------------- */
  test("initial board should contain 7 columns of height 6", () => {
    const state = board.getBoard();
    expect(state.length).toBe(TOTAL_COLUMNS*TOTAL_ROWS);
    expect(state).toBe(EMPTY_BOX.repeat(TOTAL_COLUMNS*TOTAL_ROWS));
  });

  /* ---------------------------------------------------------
   * makeMove()
   * --------------------------------------------------------- */
  test("makeMove should place a piece in the lowest available row and return the rowIndex", () => {
    const rowIndex = board.makeMove(0, "1");
    expect(rowIndex).toBe(0);

    const col = board.getBoard()[0].split("");
    expect(col[0]).toBe("1");
  });

  test("multiple moves should stack and return correct rowIndex", () => {
    const r1 = board.makeMove(2, "1");
    const r2 = board.makeMove(2, "2");
    const r3 = board.makeMove(2, "1");

    expect(r1).toBe(0);
    expect(r2).toBe(1);
    expect(r3).toBe(2);

    const boardState = board.getBoard()
    console.log(boardState)
    expect(boardState[2*TOTAL_ROWS]).toBe("1");
    expect(boardState[2*TOTAL_ROWS + 1]).toBe("2");
    expect(boardState[2*TOTAL_ROWS + 2]).toBe("1");
  });

  test("makeMove should throw when column index is invalid", () => {
    expect(() => board.makeMove(-1, "1")).toThrow("Invalid column");
    expect(() => board.makeMove(7, "1")).toThrow("Invalid column");
  });

  test("makeMove should throw when column becomes full", () => {
    for (let i = 0; i < 6; i++) board.makeMove(0, "1");
    expect(() => board.makeMove(0, "2")).toThrow("Column is full");
  });

  /* ---------------------------------------------------------
   * resetBoard()
   * --------------------------------------------------------- */
  test("resetBoard should restore the board to initial state", () => {
    board.makeMove(0, "1");
    board.makeMove(1, "2");

    board.resetBoard();

    const state = board.getBoard();
    expect(state.length).toBe(TOTAL_COLUMNS * TOTAL_ROWS);
    expect(state).toBe(EMPTY_BOX.repeat(TOTAL_COLUMNS * TOTAL_ROWS));
  });

  /* ---------------------------------------------------------
   * checkIfMoveWins()
   * --------------------------------------------------------- */
  test("vertical win should be detected", () => {
    const col = 3;

    board.makeMove(col, "1"); // row 0
    board.makeMove(col, "1"); // row 1
    board.makeMove(col, "1"); // row 2
    const r = board.makeMove(col, "1"); // row 3

    expect(board.checkIfMoveWins(col, r, "1")).toBe(true);
  });

  test("horizontal win should be detected", () => {
    const rowIndex = board.makeMove(0, "2");
    board.makeMove(1, "2");
    board.makeMove(2, "2");
    board.makeMove(3, "2");

    expect(board.checkIfMoveWins(3, rowIndex, "2")).toBe(true);
  });

  test("positive diagonal win should be detected", () => {

    // Middle of diagonal win

    board.makeMove(0, "1"); // row 0
    board.makeMove(1, "2");
    board.makeMove(1, "1"); // row 1
    board.makeMove(2, "2");
    board.makeMove(2, "2");
    board.makeMove(3, "2");
    board.makeMove(3, "2");
    board.makeMove(3, "2");
    board.makeMove(3, "1"); // row 3
    board.makeMove(2, "1"); // row 2

    expect(board.checkIfMoveWins(2, 2, "1")).toBe(true);
  });

  test("negative diagonal win should be detected", () => {
    // Builds a diagonal like:
    //  X
    //    X
    //      X
    //        X
    board.makeMove(3, "1"); // row 0
    board.makeMove(2, "2");
    board.makeMove(2, "1"); // row 1
    board.makeMove(1, "2");
    board.makeMove(1, "2");
    board.makeMove(1, "1"); // row 2
    board.makeMove(0, "2");
    board.makeMove(0, "2");
    board.makeMove(0, "2");
    const r = board.makeMove(0, "1"); // row 3

    expect(board.checkIfMoveWins(0, r, "1")).toBe(true);
  });

  test("checkIfMoveWins should return false when no win exists", () => {
    board.makeMove(0, "1");
    board.makeMove(1, "2");
    board.makeMove(2, "1");
    board.makeMove(3, "2");

    expect(board.checkIfMoveWins(3, 0, "2")).toBe(false);
  });

  /* ---------------------------------------------------------
   * Type validation and misuse tests
   * --------------------------------------------------------- */
  test("checkIfMoveWins should throw if colIndex is out of bounds", () => {
    expect(() => board.checkIfMoveWins(-1, 0, "1")).toThrow();
    expect(() => board.checkIfMoveWins(99, 0, "1")).toThrow();
  });

  test("checkIfMoveWins should throw if player token is invalid", () => {
    // @ts-ignore intentional test
    expect(() => board.checkIfMoveWins(0, 0, "X")).toThrow();
    // @ts-ignore
    expect(() => board.checkIfMoveWins(0, 0, "")).toThrow();
  });

  test("checkIfMoveWins should throw if rowIndex is invalid", () => {
    expect(() => board.checkIfMoveWins(0, -1, "1")).toThrow();
    expect(() => board.checkIfMoveWins(0, 99, "1")).toThrow();
  });
});
