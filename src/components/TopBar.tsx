import { useState, useEffect } from "react";
import { SignalIcon } from "@heroicons/react/24/outline";

export function TopBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="h-6 bg-topbar text-white flex items-center justify-between px-3 shadow-md">
      <div className="text-xs font-bold">Ordura</div>
      <div className="text-xs text-gray-300 text-center font-semibold">
        {formattedTime} • {formattedDate}
      </div>
      <div className="flex items-center gap-1 text-xs">
        <SignalIcon className="w-3 h-3 text-green-400" />
        <span className="text-gray-300">Online</span>
      </div>
    </div>
  );
}

export default TopBar;
