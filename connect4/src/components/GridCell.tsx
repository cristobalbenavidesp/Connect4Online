import { useAnimatedBoard } from "../hooks/useAnimatedBoard";
import { useOnlineAnimatedBoard } from "../hooks/useOnlineAnimatedBoard";


interface GridCellProps {
  colIdx: number;
  rowIdx: number;
  cell: "1" | "2" | "0";
  online?: boolean;
}

const colors = {
  "1": "bg-red-700",
  "2": "bg-yellow-500",
  "0": "bg-transparent"
}

function GridCell({ colIdx, rowIdx, cell, online }: GridCellProps) {
  const {fallingChip} = online ? useOnlineAnimatedBoard() : useAnimatedBoard();
  const isFalling = fallingChip?.state === "falling" && fallingChip.col === colIdx && fallingChip.row === rowIdx;

  return (
    <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
      {/* The chip */}
      {!isFalling && (
        <div className={`absolute rounded-full w-12 h-12 md:w-14 md:h-14 ${colors[cell]}`} />
      )}
      
      {/* The board mask (blue with hole) */}
      {/* outline-[40px] creates the blue, transparent bg is the hole */}
      <div className="absolute w-10 h-10 md:w-12 md:h-12 rounded-full bg-transparent outline outline-[50px] outline-sky-700 z-10" />
    </div>
  );
}

export default GridCell;
