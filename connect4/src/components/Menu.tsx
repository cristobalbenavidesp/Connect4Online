
import { useNavigate } from "react-router-dom";
import useRoom from "../hooks/useRoom";
import InvitationsList from "./InvitationsList";
import Header from "./Header";

function Menu() {
  const navigate = useNavigate();
  const {user, incomingInvitations} = useRoom();
  return (
    <>
      <Header/>
      <div className="flex flex-col w-[20rem] md:w-[25rem] divide-y divide-neutral-300 border-2 border-white rounded-xl bg-gradient-to-tr from-gray-600 to-neutral-300 mt-20 overflow-hidden">
        <button
              className="w-full py-5 bg-neutral-600 bg-opacity-60 hover:bg-opacity-70 text-white font-semibold text-2xl md:text-4xl"
              onClick={() => {
                navigate("/local");
              }}
            >
              Local
            </button>
            <button
              className="relative w-full py-5 bg-neutral-600 bg-opacity-60 hover:bg-opacity-70 text-white font-semibold text-2xl md:text-4xl"
              onClick={
                user?.sessionID ? () => navigate("/online") : () => navigate("/login")
              }
            >
              Online
              {incomingInvitations.length > 0 && <small className="absolute bg-blue-500 bottom-2 right-2 text-white text-xs rounded-full h-6 p-1 grid place-items-center">{incomingInvitations.length} invitations</small>}
            </button>
      </div>
    </>
  );
}

export default Menu;
