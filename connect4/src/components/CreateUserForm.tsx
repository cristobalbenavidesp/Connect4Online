import { useNavigate } from "react-router-dom";
import useRoom from "../hooks/useRoom";
import toast from "react-hot-toast";
import { useEffect } from "react";


function CreateUserFrom() {
  const navigate = useNavigate();
  const { connect, user } = useRoom();

  useEffect(() => {
    if (user) navigate("/online");
  }, [user]);
  
  if (user) return null;

  return (
    <form
      className="flex flex-col max-w-2xl  bg-neutral-300 py-10 px-10 md:px-14 rounded-xl gap-3 mt-20"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const username = formData.get("username");
        if (!username) return;
        toast.promise(connect(username as string), {
          loading: "Connecting...",
          success: "Connected",
          error: "Failed to connect",
        });
      }}
    >
      <label className="font-semibold flex flex-col gap-2">
        Username
        <input type="text" name="username" placeholder="your username" className="py-2 px-4" />
      </label>
      
      <div className="flex place-items-center gap-2 mt-2">
        <button
          type="submit"
          className="p-2 w-36 rounded-xl bg-neutral-600 text-white font-semibold place-self-center"
        >
          go Online
        </button>
        <button
          type="button"
          onClick={() => {
            navigate("/");
          }}
          className="p-2 w-36 rounded-xl bg-neutral-600 text-white font-semibold place-self-center"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default CreateUserFrom;
