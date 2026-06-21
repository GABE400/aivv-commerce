import { useState, useEffect } from "react";

export function useIsTauri() {
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasTauri =
        "__TAURI__" in window ||
        "__TAURI_INTERNALS__" in window ||
        window.location.search.includes("platform=desktop") ||
        window.location.search.includes("tauri=true") ||
        (window as any).isTauri === true;
      setIsTauri(hasTauri);
    }
  }, []);

  return isTauri;
}
