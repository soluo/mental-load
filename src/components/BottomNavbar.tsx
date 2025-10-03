import { NavLink } from "react-router-dom";

export function BottomNavbar() {
  return (
    <div className="fixed bottom-0 inset-x-0">
      <div className="bg-white/70 backdrop-blur">
        <nav className="flex justify-around gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col py-4 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`
            }
          >
            <span className="text-xs">Activité</span>
          </NavLink>
          <NavLink
            to="/get-it-done"
            className={({ isActive }) =>
              `flex flex-col py-4 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`
            }
          >
            <span className="text-xs">Faire</span>
          </NavLink>
          <NavLink
            to="/member"
            className={({ isActive }) =>
              `flex flex-col py-4 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'}`
            }
          >
            <span className="text-xs">Réglages</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
