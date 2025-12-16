import useOnlineBoard from "../hooks/useOnlineBoard";
import { TURNS } from "../constants";
import { OnlineAnimatedBoardProvider } from "../context/OnlineAnimatedBoardContext";
import OnlineAnimatedBoard from "./OnlineAnimatedBoard";
import useRoom from "../hooks/useRoom";
import FinishedGameBar from "./FinishedGameBar";
import Scoreboard from "./Scoreboard";
import Header from "./Header";

function OnlineGame() {
  const {game} = useRoom();

  if (!game) {
    return <div>Game not found</div>;
  }
  
  const {player} = useOnlineBoard();

  return (
    <OnlineAnimatedBoardProvider>
      <div className="w-full flex flex-col gap-0 items-center place-content-center h-full font-sans">
        
        <Header/>
        {/* Score Board */}
        <Scoreboard/>

        <OnlineAnimatedBoard />

        <FinishedGameBar online={true} />

      </div>
    </OnlineAnimatedBoardProvider>
  );
}

export default OnlineGame;
