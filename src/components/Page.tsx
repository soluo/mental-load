import React from "react";
import { ReactNode } from "react";
import {cn} from "@/lib/utils.ts";
import {AuthenticatedHeader} from "@/components/AuthenticatedHeader.tsx";
import {BottomNavbar} from "@/components/BottomNavbar.tsx";

export function Page({ children, className }: { children: ReactNode, className?: string }) {
  const hasHeader = React.Children.toArray(children).some(child =>
    React.isValidElement(child) && child.type === AuthenticatedHeader
  )

  const hasBottomBar = React.Children.toArray(children).some(child =>
    React.isValidElement(child) && child.type === BottomNavbar
  )

  const classNames = cn(
    "flex-1",
    hasHeader && "pt-16",
    hasBottomBar && "pb-16",
    className,
  );
  return (
    <main className={classNames}>
      {children}
    </main>
  );
}
