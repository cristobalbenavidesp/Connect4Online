import { motion } from "framer-motion";
import { TOTAL_ROWS } from "../constants";
import { useAnimatedBoard } from "../hooks/useAnimatedBoard";
import { useOnlineAnimatedBoard } from "../hooks/useOnlineAnimatedBoard";
import { useEffect, useState } from "react";

function GhostChip({online}: {online?: boolean}) {
  const { fallingChip, getAnimation, sleepChip} = online ? useOnlineAnimatedBoard() : useAnimatedBoard();
  const [currentCellSize, setCurrentCellSize] = useState(80);

  useEffect(() => {
    const updateSize = () => {
      // md breakpoint is 768px.
      // w-12 is 3rem = 48px.
      // w-20 is 5rem = 80px.
      setCurrentCellSize(window.innerWidth >= 768 ? 80 : 48);
    };
    
    updateSize(); // Initial check
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!fallingChip) return null;
  
  return (
    <motion.div
      initial={{ y: -(TOTAL_ROWS+0.5)*currentCellSize }}
      animate={getAnimation(fallingChip, currentCellSize)}
      onAnimationComplete={() => fallingChip?.state === "falling" ? sleepChip() : undefined}
      className="absolute w-12 h-12 md:w-20 md:h-20 left-0 grid place-items-center z-0"
    >
      <motion.div
        className={`rounded-full w-10 h-1 0 md:w-14 md:h-14`} 
        animate={{
            backgroundColor: fallingChip?.player === "1" ? "#b91c1c" : "#eab308",
            transition: {
                duration: 0,
                delay: 0
            },
        }}
      />
    </motion.div>
  );
}

export default GhostChip;


