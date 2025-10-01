import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberSelector } from "@/components/MemberSelector";
import { LogOut, Users } from "lucide-react";

export function AuthenticatedHeader() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const household = useQuery(api.households.getCurrentHousehold);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  // État de chargement
  if (loggedInUser === undefined || household === undefined) {
    return (
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b border-slate-200 shadow-sm px-6">
        <div className="h-6 w-32 bg-slate-200 animate-pulse rounded" />
        <div className="h-10 w-10 bg-slate-200 animate-pulse rounded-full" />
      </header>
    );
  }

  const householdName = household?.name || "Balance ta tâche";
  const userName = loggedInUser?.name || loggedInUser?.email || "Utilisateur";
  const userInitial = userName[0].toUpperCase();

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b border-slate-200 shadow-sm px-6">
      <h2 className="text-xl font-semibold text-slate-900">{householdName}</h2>

      <div className="flex items-center gap-4">
        {household && household.members.length > 0 && (
          <MemberSelector members={household.members} />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-full select-none">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-slate-200 text-slate-700 font-medium">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                {loggedInUser?.email && loggedInUser?.name && (
                  <p className="text-xs leading-none text-slate-500">
                    {loggedInUser.email}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/family")}
              className="cursor-pointer"
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Ma famille</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void signOut()}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
