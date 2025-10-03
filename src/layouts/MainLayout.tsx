import { ReactNode } from "react";
import { BottomNavbar } from "@/components/BottomNavbar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <main className="pb-16">
        {children}
      </main>
      <BottomNavbar />
    </>
  );
}
