import { createPortal } from "react-dom";
import { ReactNode, useEffect, useState } from "react";

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted
    ? createPortal(children, document.body)
    : null;
}

export default Portal;
