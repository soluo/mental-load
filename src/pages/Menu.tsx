import { Page } from "@/components/Page";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  UserCircle as UserIcon,
  ChevronRightIcon,
  HelpCircleIcon,
  InfoIcon
} from "lucide-react";
import { useRef } from "react";
import {useIOSHeaderScroll} from "@/hooks/useIOSHeaderScroll.ts";
import {IOSHeader} from "@/components/IOSHeader.tsx";

export function Menu() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const household = useQuery(api.households.getCurrentHousehold);
  const { signOut } = useAuthActions();

  const userEmail = loggedInUser?.email || "";

  const titleRef = useRef<HTMLDivElement>(null);
  const { isHeaderVisible, headerRef } = useIOSHeaderScroll(titleRef);

  return (
    <Page className="pt-[calc(env(safe-area-inset-top)+48px)] pb-8 select-none">
      <IOSHeader
        title="Faire quelque chose"
        headerRef={headerRef}
        isHeaderVisible={isHeaderVisible}
      />

      <div className="px-4 w-full max-w-lg mx-auto space-y-6">
        <div ref={titleRef}></div>
        {/* Compte Section */}
        <div className="bg-white rounded-lg">
          <button className="w-full flex items-center gap-3 px-3 py-4 hover:bg-foreground/10 active:bg-stone-200 transition-colors">
            <div className="flex items-center justify-center shrink-0">
              <UserIcon className="size-6 text-sidebar-accent" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <div className="">Compte</div>
            </div>
            <ChevronRightIcon className="size-5 text-muted-foreground shrink-0" />
          </button>
        </div>

        {/* Members Section */}
        {household?.members && household.members.length > 0 && (
          <div className="space-y-2">
            <div className="px-4">
              <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Membres
              </h3>
            </div>
            <div className="bg-white rounded-lg">
              {household.members.map((member, index) => (
                <div key={member.id}>
                  {index > 0 && <div className="h-px bg-stone-100 ml-12" />}
                  <button className="w-full flex items-center gap-3 px-3 py-4 hover:foreground/10 active:bg-stone-200 transition-colors">
                    <Avatar className="size-6 shrink-0">
                      <AvatarFallback color={member.color} className="font-medium">
                        {member.firstName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="">{member.firstName}</div>
                    </div>
                    <ChevronRightIcon className="size-5 text-muted-foreground shrink-0" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help & About Section */}
        <div className="bg-white rounded-lg">
          <button className="w-full flex items-center gap-3 px-3 py-4 hover:bg-foreground/10 active:bg-stone-200 transition-colors">
            <div className="flex items-center justify-center shrink-0">
              <HelpCircleIcon className="size-6 text-sidebar-accent" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <div className="">Aide et avis</div>
            </div>
            <ChevronRightIcon className="size-5 text-muted-foreground shrink-0" />
          </button>
          <div className="h-px bg-stone-100 ml-12" />
          <button className="w-full flex items-center gap-3 px-3 py-4 hover:bg-foreground/10 active:bg-stone-200 transition-colors">
            <div className="flex items-center justify-center shrink-0">
              <InfoIcon className="size-6 text-sidebar-accent" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-left">
              <div className="">À propos</div>
            </div>
            <ChevronRightIcon className="size-5 text-muted-foreground shrink-0" />
          </button>
        </div>

        {/* Sign Out Button */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => void signOut()}
            variant="destructive"
            className="w-full"
          >
            Déconnexion
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Connecté•e en tant que <span className="select-text">{userEmail}</span>
          </p>
        </div>
      </div>
    </Page>
  );
}
