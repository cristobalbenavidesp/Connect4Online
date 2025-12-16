import useRoom from "../hooks/useRoom";

export default function Header() {
    const {user, winner} = useRoom();

    let title = (
        <>
        CO<span className="italic">NN</span>ECT 4!!!
        </>
    );

    if (winner) {
        if (winner === user?.userID) {
            title = <>YOU WIN!!!</>;
        } else {
            title = <>YOU LOSE!!!</>;
        }
    }

    return ( 
        <h1 className="text-5xl md:text-7xl text-white font-bold py-5">
            {title}
        </h1>
    )
}