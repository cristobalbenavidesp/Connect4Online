import { useContext } from "react";
import { AnimatedBoardContext } from "../context/AnimatedBoardContext";

export function useAnimatedBoard() {
  const context = useContext(AnimatedBoardContext);
  if (!context) {
    throw new Error("useAnimatedBoard must be used within a AnimatedBoardProvider");
  }
  
  return context;     
}