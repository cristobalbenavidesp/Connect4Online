import useRoom from "../hooks/useRoom";
import { MdOutlineClose, MdCheck } from "react-icons/md";

function InvitationsList() {
  const {incomingInvitations, user, acceptInvite, rejectInvite} = useRoom();

  return (
    <ul className="flex flex-col place-items-center gap-5 md:absolute md:top-0 md:right-0 m-10 max-w-md w-full">
      {incomingInvitations.map((invitation) => {
        return (
          <li
            key={invitation.id}
            className="bg-white p-4 flex justify-between place-items-center rounded-lg w-full max-w-xs md:max-w-md"
          >
            <div>
              <b>{invitation.users.find((u) => u.id !== user?.userID)?.username}</b>
              <h3>Would you like a match with me, sir?</h3>
            </div>
            <div className="flex gap-2">
              <button
                className="aspect-square w-10 h-10 grid place-items-center rounded-lg bg-red-700"
                onClick={() => {
                  rejectInvite(invitation);
                }}
              >
                <MdOutlineClose className="text-white font-extrabold scale-125" />
              </button>
              <button
                className="aspect-square w-10 h-10 grid place-items-center rounded-lg bg-lime-800"
                onClick={() => {
                  acceptInvite(invitation);
                }}
              >
                <MdCheck className="text-white font-extrabold scale-125" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default InvitationsList;
