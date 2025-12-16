import { useContext } from "react";
import { RoomContext } from "../context/RoomContext";

function useRoom() {
  const context = useContext(RoomContext);

  return context;
}

export default useRoom;
