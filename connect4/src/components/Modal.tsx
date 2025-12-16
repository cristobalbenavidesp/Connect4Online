import Portal from "./Portal";

function Modal({ state, children, reference }: { state: boolean; children: React.ReactNode; reference: React.RefObject<HTMLElement> }) {
  if (!state) return;

  return (
    <Portal>
      <section ref={reference} className="z-30 absolute top-0 left-0 w-full h-full grid place-items-center backdrop-blur-xl">
        {children}
      </section>
    </Portal>
  );
}

export default Modal;
