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
        (window as Window & { isTauri?: boolean }).isTauri === true;
      
      // Delay state update to avoid synchronous setState in effect body
      const timer = setTimeout(() => {
        setIsTauri(hasTauri);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);

  return isTauri;
}
