import {
  CircleCheckBig as GetItDoneIcon,
  Activity as ActivityIcon,
  MenuSquareIcon as SettingsIcon, PlusIcon
} from 'lucide-react';
import { NavLink, useLocation } from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {hapticFeedback} from "@/lib/utils";
import { TaskCreationDrawer } from "@/components/TaskCreationDrawer";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface BottomNavbarProps {
  householdId?: Id<"households">;
}

export function BottomNavbar({ householdId }: BottomNavbarProps) {
  const location = useLocation();
  const shouldShowButton = location.pathname === '/' || location.pathname === '/get-it-done';
  const [isTaskCreationOpen, setIsTaskCreationOpen] = useState(false);

  return (
    <div className="fixed bottom-0 inset-x-0">
      {shouldShowButton && (
        <div className="relative max-w-lg mx-auto px-4 flex justify-end">
          {/* Floating Action Button */}
          <Button
            size="icon"
            onClick={() => {
              hapticFeedback(10);
              if (householdId) {
                setIsTaskCreationOpen(true);
              }
            }}
            className="absolute right-4 bottom-4 z-10 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-transform active:scale-115"
          >
            <PlusIcon className="size-6" strokeWidth={1.75} />
          </Button>
        </div>
      )}
      <div className="bg-background/70 backdrop-blur border-t border-foreground/10 pwa-mobile:pb-5">
        <nav className="max-w-lg mx-auto flex justify-around gap-2 py-2">
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

      {/* Task Creation Drawer */}
      {householdId && (
        <TaskCreationDrawer
          open={isTaskCreationOpen}
          onOpenChange={setIsTaskCreationOpen}
          householdId={householdId}
        />
      )}
    </div>
  );
}
