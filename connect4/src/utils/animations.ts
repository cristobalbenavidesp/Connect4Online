import { CELL_SIZE, TOTAL_ROWS } from "../constants"

export function bounceEase(x: number) {
  const n1 = 7.5625
  const d1 = 2.75

  if (x < 1 / d1) return n1 * x * x
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + .75
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + .9375
  return n1 * (x -= 2.625 / d1) * x + .984375
}

export const fallingAnimation = (row: number, cellSize: number = CELL_SIZE) => ({

    y: -cellSize * (row + 1),
    transition: {
      duration: 0.6,
      ease: bounceEase,
    }
  });

export const restingAnimation = (row: number, cellSize: number = CELL_SIZE) => ({

    y: -cellSize * (row + 1),
    transition: {
      duration: 0.6,
    }
  });

export const hoverAnimation = (cellSize: number = CELL_SIZE) => {
    return {

        y: -(TOTAL_ROWS+0.5)*cellSize,
        transition: {
            duration: 0,
            delay: 0,
        },
    }
}

export const idleAnimation = (cellSize: number = CELL_SIZE) => {
    return {
        y: -(TOTAL_ROWS+0.5)*cellSize,
        transition: {
            duration: 0,
            delay: 0,
        },
    }
}