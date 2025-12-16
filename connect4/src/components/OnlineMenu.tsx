
import { useNavigate } from "react-router-dom";
import useRoom from "../hooks/useRoom";
import useModal from "../hooks/useModal";
import { useRef, useEffect } from "react";
import Modal from "./Modal";
import HostRoomForm from "./HostRoomForm";
import { FaRegCopy } from "react-icons/fa";
import toast from "react-hot-toast";
import InvitationsList from "./InvitationsList";
import Header from "./Header";

function OnlineMenu() {
  const navigate = useNavigate();
  const {user} = useRoom(); 

  useEffect(() => {
    if (!user?.sessionID) {
      navigate("/login");
    }
  }, [user, navigate]);

  const hostModalRef = useRef<HTMLFormElement>(null);
  const {modalOpen: hostModalOpen, setModalOpen: setHostModalOpen} = useModal(hostModalRef)

  return (
    <>
      <Header/>

      <div className="flex flex-col w-[20rem] md:w-[25rem] divide-y divide-neutral-300 border-2 border-white rounded-xl bg-gradient-to-tr from-gray-600 to-neutral-300 mt-20 overflow-hidden">
            <button
              className="w-full py-5 bg-neutral-600 bg-opacity-60 hover:bg-opacity-70 text-white font-semibold text-2xl md:text-4xl"
              onClick={
                user?.sessionID ? () => setHostModalOpen(true) : () => navigate("/login")
              }
            >
              Invite friend
            </button>
      </div>
      <h2 className="text-white font-semibold text-center mt-10"><span>Your id:</span> {user?.userID || "Error"}</h2>
      <button className="flex items-center gap-2 border rounded-xl p-2 text-white font-semibold mt-2 bg-blue-500 hover:bg-blue-600"
       onClick={() => {navigator.clipboard.writeText(user?.userID!); toast.success("Copied to clipboard")}}>
        Copy to clipboard
        <FaRegCopy/>
      </button>
      <Modal state={hostModalOpen} reference={hostModalRef} >
            <HostRoomForm onCancel={() => setHostModalOpen(false)}/>
      </Modal>
      <InvitationsList/>
    </>
  );
}

export default OnlineMenu;
