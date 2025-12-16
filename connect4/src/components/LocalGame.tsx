import { useRef } from "react";
import { Game } from "../models/Game";
import { AnimatedBoardProvider } from "../context/AnimatedBoardContext";
import AnimatedBoard from "./AnimatedBoard";
import { useAnimatedBoard } from "../hooks/useAnimatedBoard";
import FinishedGameBar from "./FinishedGameBar";
import Header from "./Header";
import { LocalScoreboard } from "./Scoreboard"; // Import LocalScoreboard

function LocalBoard() {
  const game = useRef(new Game());

  return (
    <AnimatedBoardProvider game={game}>
      <div className="w-full flex flex-col items-center place-content-center bg-neutral-600 min-h-screen">
        <Header/>
        
        <LocalScoreboard />

        <AnimatedBoard />

        <FinishedGameBar/>
      </div>
    </AnimatedBoardProvider>
  );
}



export default LocalBoard;
