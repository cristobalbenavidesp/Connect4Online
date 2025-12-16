import { useContext } from "react";
import { OnlineAnimatedBoardContext } from "../context/OnlineAnimatedBoardContext";

export function useOnlineAnimatedBoard() {
  const context = useContext(OnlineAnimatedBoardContext);
  if (!context) {
    throw new Error("useOnlineAnimatedBoard must be used within a OnlineAnimatedBoardProvider");
  }
  
  return context;     
}