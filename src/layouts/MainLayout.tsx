import { ReactNode } from "react";
import { BottomNavbar } from "@/components/BottomNavbar";
import { Id } from "../../convex/_generated/dataModel";

interface MainLayoutProps {
  children: ReactNode;
  householdId?: Id<"households">;
}

export function MainLayout({ children, householdId }: MainLayoutProps) {
  return (
    <>
      <main className="pb-16">
        {children}
      </main>
      <BottomNavbar householdId={householdId} />
    </>
  );
}
