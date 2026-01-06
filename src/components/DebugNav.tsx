import { useState } from "react";
import { useNavigate } from "react-router-dom";

const routes = [
  { label: "Login", path: "/login" },
  { label: "Dashboard", path: "/dashboard" },
];

export function DebugNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`mb-2 grid gap-2 rounded-md border border-primary-pale bg-white/95 p-3 shadow-lg transition-all duration-200 ${
          open
            ? "opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 translate-y-2"
        }`}
      >
        <p className="text-xs font-semibold text-gray-600">Quick Nav</p>
        <div className="flex flex-col gap-2">
          {routes.map((r) => (
            <button
              key={r.path}
              onClick={() => navigate(r.path)}
              className="rounded-md border border-primary-lighter bg-primary text-white px-3 py-2 text-sm font-semibold hover:bg-primary-light"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-primary text-white px-4 py-3 shadow-lg hover:bg-primary-light transition"
        aria-expanded={open}
        aria-label="Toggle debug navigation"
      >
        {open ? "Close" : "Nav"}
      </button>
    </div>
  );
}

export default DebugNav;
