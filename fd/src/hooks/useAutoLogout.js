import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

const useAutoLogout = () => {
  const dispatch = useDispatch();
  const timerId = useRef(null);

  // ⏱️ Reset inactivity timer
  const resetTimer = () => {
    if (timerId.current) clearTimeout(timerId.current);
    timerId.current = setTimeout(() => {
      dispatch(logout());
      document.cookie = "auth_token=; Max-Age=0; path=/;";
      localStorage.removeItem("persist:root");

      // Optional: notify backend on inactivity logout
      navigator.sendBeacon("/api/logout");
    }, INACTIVITY_LIMIT);
  };

  // 👀 Track user activity and reset timer
  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer on mount

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerId.current) clearTimeout(timerId.current);
    };
  }, []);

  // 🧨 Logout on tab/browser close (not on refresh)
  useEffect(() => {
    const handleTabClose = () => {
      const navType = performance.getEntriesByType("navigation")[0]?.type;
      
      // Prevent logout if it's just a page refresh
      if (navType === "reload") return;

      dispatch(logout());
      document.cookie = "auth_token=; Max-Age=0; path=/;";
      localStorage.removeItem("persist:root");

      // Notify backend
      navigator.sendBeacon("/api/logout");
    };

    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, []);
};

export default useAutoLogout;
