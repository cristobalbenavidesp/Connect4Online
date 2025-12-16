import toast from "react-hot-toast";
import useRoom from "../hooks/useRoom";

function HostRoomForm({ onCancel }: { onCancel: () => void }) {
  const {sendInvite} = useRoom();

  return (
    <form
      className="flex flex-col max-w-xs overflow-hidden md:max-w-2xl bg-neutral-300 py-10 px-5 md:px-14 rounded-xl gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const id = (formData.get("id") as string).trim();
        if (!id) return;
        toast.promise(sendInvite(id), {
          loading: "Sending invite...",
          success: "Invite sent successfully!",
          error: "Failed to send invite",
        });
      }}
    >
      <label className="font-semibold">friend Id</label>
      <input type="text" placeholder="your friend's id" className="py-2 px-4" name="id" />
      <div className="flex place-items-center gap-2 mt-2">
        <button
          type="submit"
          className="p-2 w-40 rounded-xl bg-neutral-600 text-white font-semibold place-self-center"
        >
          Send invite
        </button>
        <button
          type="button"
          className="p-2 w-40 rounded-xl bg-neutral-600 text-white font-semibold place-self-center"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default HostRoomForm;
