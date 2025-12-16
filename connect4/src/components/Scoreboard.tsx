import { TURNS } from "../constants";
import { useAnimatedBoard } from "../hooks/useAnimatedBoard";
import useOnlineBoard from "../hooks/useOnlineBoard";

interface ScoreboardProps {
    turn: "1" | "2";
    player1Username: string;
    player2Username: string;
    score: { player1: number, player2: number };
    isPlayer1: boolean; 
}

function ScoreboardUI({ turn, player1Username, player2Username, score, isPlayer1 }: ScoreboardProps) {
    return (
        <>
            {/* Small screens Scoreboard */}
            <div className="flex xl:hidden w-full h-[5rem] justify-center gap-10 items-center max-w-lg">
                 {/* Player 1 */}
                 <div className={`flex flex-col items-center p-2 rounded-xl transition-all ${turn === "1" ? "bg-white/10 border-red-500/50" : "opacity-70"}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-700 ring-2 ring-black/20" />
                        <span className="text-white font-bold text-sm max-w-[80px] truncate">{player1Username}</span>
                    </div>
                    <span className="text-2xl font-black text-white">{score.player1}</span>
                 </div>

                 <div className="text-white/30 font-bold italic text-sm">VS</div>

                 {/* Player 2 (Small) */}
                 <div className={`flex flex-col items-center p-2 rounded-xl transition-all ${turn === "2" ? "bg-white/10 border-yellow-500/50" : "opacity-70"}`}>
                    <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm max-w-[80px] truncate">{player2Username}</span>
                        <div className="w-4 h-4 rounded-full bg-yellow-500 ring-2 ring-black/20" />
                    </div>
                    <span className="text-2xl font-black text-white">{score.player2}</span>
                 </div>
            </div>

            {/* Large screens Scoreboard (Original) */}
            <aside className="hidden xl:flex absolute top-0 right-[10rem] h-full flex-col justify-center place-content-center items-center gap-4 md:gap-12 w-full max-w-md pointer-events-none">
                
                {/* Player 1 Card */}
                <div className={`pointer-events-auto flex-1 flex flex-col items-center p-4 rounded-2xl transition-all duration-300 w-full max-h-[15rem] place-content-center ${turn === "1" ? "bg-white/10 shadow-lg scale-105 border-2 border-red-500/50" : "bg-black/10 border border-white/5"}`}>
                    <div className="relative">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-700 shadow-inner flex items-center justify-center mb-2 ring-4 ring-black/10">
                            {turn === "1" && <div className="w-3 h-3 bg-white rounded-full animate-pulse" />}
                        </div>
                    </div>
                    <h2 className="text-white font-bold text-lg md:text-xl truncate max-w-[120px] md:max-w-full flex items-center gap-2">
                        {player1Username} {isPlayer1 && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-black tracking-wider">YOU</span>}
                    </h2>
                    <div className="text-3xl md:text-5xl font-black text-white mt-1 drop-shadow-md">{score.player1}</div>
                </div>

                {/* Divider / Info */}
                <div className="flex flex-col justify-center items-center text-white/30 font-black italic text-xl">
                    VS
                </div>

                {/* Player 2 Card */}
                <div className={`pointer-events-auto flex-1 flex flex-col items-center p-4 rounded-2xl transition-all duration-300 w-full max-h-[15rem] place-content-center ${turn === "2" ? "bg-white/10 shadow-lg scale-105 border-2 border-yellow-500/50" : "bg-black/10 border border-white/5"}`}>
                    <div className="relative">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-yellow-500 shadow-inner flex items-center justify-center mb-2 ring-4 ring-black/10">
                            {turn === "2" && <div className="w-3 h-3 bg-white rounded-full animate-pulse" />}
                        </div>
                    </div>
                    <h2 className="text-white font-bold text-lg md:text-xl truncate max-w-[120px] md:max-w-full flex items-center gap-2">
                        {player2Username} {!isPlayer1 && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-black tracking-wider">YOU</span>}
                    </h2>
                    <div className="text-3xl md:text-5xl font-black text-white mt-1 drop-shadow-md">{score.player2}</div>
                </div>

            </aside>
        </>
    );
}

export function LocalScoreboard() {
    const { game } = useAnimatedBoard();
    if (!game || !game.current) return null;

    // Use a forceUpdate-like mechanism or rely on context updates. 
    // Since `game` is a Ref in LocalBoard, we need to ensure this component re-renders when game state changes.
    // However, `useAnimatedBoard` likely provides methods/state that trigger updates.
    // Assuming `game.current` has `turn` and `score`.
    
    // NOTE: Local game `Game` class updates might not trigger React re-renders unless `useAnimatedBoard` exposes state.
    // Checking `LocalGame.tsx`, it passes a `ref`. The `AnimatedBoardContext` might not be exposing reactive state for score/turn directly if it just holds the ref.
    // But let's assume `game.current.turn` and `game.current.score` exist.
    // We'll map "1" to "Player 1" and "2" to "Player 2" for local play.
    
    return <ScoreboardUI 
        turn={game.current.getTurn() as "1" | "2"}
        player1Username="Player 1"
        player2Username="Player 2"
        score={game.current.getScore()}
        isPlayer1={false} // No "YOU" tag in local
    />;
}

export default function OnlineScoreboard() {
    const {player, game} = useOnlineBoard();
    if (!game) return null;

    const isPlayer1 = player === TURNS.P1;

    return <ScoreboardUI 
        turn={game.turn} 
        player1Username={game.player1Username} 
        player2Username={game.player2Username} 
        score={game.score} 
        isPlayer1={isPlayer1} 
    />;
}