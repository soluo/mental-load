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
import { useActiveMember } from "@/contexts/MemberContext";
import { LogOut as LogOutIcon, Users as UsersIcon, Check as CheckIcon, User as UserIcon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function AuthenticatedHeader() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const household = useQuery(api.households.getCurrentHousehold);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const { activeMemberId, setActiveMemberId } = useActiveMember();

  // Set the first member as active by default if none selected
  useEffect(() => {
    if (household?.members && household.members.length > 0) {
      if (!activeMemberId) {
        setActiveMemberId(household.members[0].id);
      }
      // If the active member was deleted, select the first available member
      else if (!household.members.find((m) => m.id === activeMemberId)) {
        setActiveMemberId(household.members[0].id);
      }
    }
  }, [household?.members, activeMemberId, setActiveMemberId]);

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

  const activeMember = household?.members?.find((m) => m.id === activeMemberId);
  const avatarContent = activeMember ? (
    activeMember.firstName[0].toUpperCase()
  ) : (
    <UserIcon className="h-5 w-5" />
  );

  const handleMemberChange = (memberId: Id<"householdMembers">) => {
    const member = household?.members?.find((m) => m.id === memberId);
    setActiveMemberId(memberId);
    if (member) {
      toast.success(`Profil actif : ${member.firstName}`);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center px-6">
      <h2 className="text-xl font-semibold text-slate-900">{householdName}</h2>

      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-full select-none">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-slate-200 text-slate-700 font-medium">
              {avatarContent}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              {loggedInUser?.email && (
                <p className="text-xs leading-none text-slate-500">
                  {loggedInUser.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>

          {household?.members && household.members.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Profil actif
                </p>
              </div>
              {household.members.map((member) => (
                <DropdownMenuItem
                  key={member.id}
                  onClick={() => handleMemberChange(member.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{member.firstName}</span>
                      <span className="text-xs text-slate-500">
                        ({member.role === "adult" ? "Adulte" : "Enfant"})
                      </span>
                    </div>
                    {activeMemberId === member.id && (
                      <CheckIcon className="h-4 w-4 text-slate-700" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate("/family")}
            className="cursor-pointer"
          >
            <UsersIcon className="mr-2 h-4 w-4" />
            <span>Ma famille</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => void signOut()}
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
