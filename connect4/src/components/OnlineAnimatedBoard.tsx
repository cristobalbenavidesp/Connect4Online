import { motion } from "framer-motion";
import { useOnlineAnimatedBoard } from "../hooks/useOnlineAnimatedBoard";
import useOnlineBoard from "../hooks/useOnlineBoard";
import GridCell from "./GridCell";
import GhostChip from "./GhostChip";
import FinishedGameBar from "./FinishedGameBar";

export default function OnlineAnimatedBoard() {
    const { board, throwChip, setHoverCol, winner, fallingChip } = useOnlineAnimatedBoard();
    const { isTurn } = useOnlineBoard();

    return (
       <div
          className={`relative flex border border-slate-600 rounded-xl ${winner ? "hidden md:block": "block"}` }
        >
          {/* Static board rendering — board is string[][] */}
          {board.map((colArr, colIdx) => {
            const isFull = !colArr.includes("0");
            const isFallingInThisCol = fallingChip?.col === colIdx && fallingChip.state === "falling";
            const isHoveringThisCol = fallingChip?.col === colIdx && fallingChip.state === "hover";

            return (
              <motion.button
                key={colIdx}
                className={`relative ${!isFull ? "hover:brightness-75" : "cursor-default"}`}
                onClick={() => {!isFull && throwChip(colIdx.toString())}}
                onHoverStart={() => {setHoverCol(colIdx)}}
                onHoverEnd={() => {setHoverCol(null)}}
                disabled={isFull || winner === "1" || winner === "2" || isFallingInThisCol }
              >
                {colArr.toReversed().map((cell, rowIdx) => {
                  return (
                    <div
                      className={`w-12 md:w-20 aspect-square relative border-b border-r border-slate-600 flex items-center justify-center bg-transparent overflow-hidden ${
                        colIdx === 0 && rowIdx === 0 ? "rounded-tl-xl" : ""
                      } ${colIdx === 6 && rowIdx === 0 ? "rounded-tr-xl" : ""} ${
                        colIdx === 0 && rowIdx === 5 ? "rounded-bl-xl" : ""
                      } ${colIdx === 6 && rowIdx === 5 ? "rounded-br-xl" : ""}`}
                      key={`row-${rowIdx}-col-${colIdx}`}
                    >
                      <GridCell colIdx={colIdx} rowIdx={(colArr.length - 1) - rowIdx} cell={cell as "1" | "2" | "0"} online={true}/>
                    </div>
                  );
                })}

                {(isFallingInThisCol || (isHoveringThisCol && !isFull && isTurn)) && (!winner || fallingChip?.state === "falling") && <GhostChip online={true}/>}

              </motion.button>
            );
          })}
        </div>
    )
}