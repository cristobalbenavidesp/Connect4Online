import { useNavigate } from "react-router-dom";
import { useAnimatedBoard } from "../hooks/useAnimatedBoard";
import { useOnlineAnimatedBoard } from "../hooks/useOnlineAnimatedBoard";
import useOnlineBoard from "../hooks/useOnlineBoard";
import useRoom from "../hooks/useRoom";

function FinishedGameBarUI({ winner, rematch }: { winner: string; rematch: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="z-50 flex flex-col items-center justify-center">
      <h1 className="text-xl md:text-3xl text-white font-semibold mt-10">
        The winner is: <span className="font-normal">{winner}</span>
      </h1>
      <div className="flex gap-2 md:gap-5 mt-5 w-full place-content-center">
        <button
          className="text-white text-base md:text-xl border rounded-xl py-2 px-4 hover:bg-neutral-400/20"
          onClick={() => {
            navigate("/");
          }}
        >
          Go back to the main menu
        </button>
        <button
          className="text-white text-base md:text-xl border rounded-xl py-2 px-4 hover:bg-neutral-400/20"
          onClick={() => {
            rematch();
          }}
        >
          Rematch
        </button>
      </div>
    </div>
  );
}

function OnlineFinishedLogic() {
    const { winner } = useRoom();
    const { game } = useOnlineBoard();
    const { rematch } = useOnlineAnimatedBoard();

    if (!winner || !game) return null;

    const winnerName = winner === game.player1 ? game.player1Username : game.player2Username;

    return <FinishedGameBarUI winner={winnerName} rematch={rematch} />;
}


function LocalFinishedLogic() {
    const { winner, rematch } = useAnimatedBoard();

    if (!winner) return null;

    return <FinishedGameBarUI winner={winner} rematch={rematch} />;
}

function FinishedGameBar({online}: {online?: boolean}) {
  if (online) {
      return <OnlineFinishedLogic />;
  }
  return <LocalFinishedLogic />;
}

export default FinishedGameBar;
