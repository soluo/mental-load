import {
  CircleCheckBig as GetItDoneIcon,
  Activity as ActivityIcon,
  MenuSquareIcon as SettingsIcon
} from 'lucide-react';
import { NavLink } from "react-router-dom";

export function BottomNavbar() {
  return (
    <div className="fixed bottom-0 inset-x-0">
      <div className="bg-background/70 backdrop-blur border-t border-foreground/10">
        <nav className="flex justify-around gap-2 py-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-1 [&>span]:text-tiny ${isActive ? 'font-bold text-menu-active [&>svg]:text-menu-active-icon' : ''}`
            }
          >
            <ActivityIcon size={20} />
            <span>Activité</span>
          </NavLink>
          <NavLink
            to="/get-it-done"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-1 [&>span]:text-tiny ${isActive ? 'font-bold text-menu-active [&>svg]:text-menu-active-icon' : ''}`
            }
          >
            <GetItDoneIcon size={20} />
            <span>Faire</span>
          </NavLink>
          <NavLink
            to="/member"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-1 [&>span]:text-tiny ${isActive ? 'font-bold text-menu-active [&>svg]:text-menu-active-icon' : ''}`
            }
          >
            <SettingsIcon size={20} />
            <span>Menu</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
