import {RefObject, ReactNode} from "react";
import {cn} from "@/lib/utils";

interface IOSHeaderProps {
  title: string;
  headerRef: RefObject<HTMLElement | null>;
  isHeaderVisible: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export function IOSHeader({title, headerRef, isHeaderVisible, leftSlot, rightSlot}: IOSHeaderProps) {
  return (
    <header ref={headerRef} className="fixed top-0 inset-x-0 pt-[env(safe-area-inset-top)] z-50">
      <div className={cn(
        "absolute inset-0 bg-background transition-all duration-300",
        isHeaderVisible && "bg-background/90 backdrop-blur"
      )} />
      <div className="relative flex h-12 items-center px-4">
        <div className={cn(
          "absolute inset-x-0 bottom-0 border-b border-foreground/10 transition-opacity duration-300",
          isHeaderVisible ? "opacity-100" : "opacity-0"
        )} />

        <div className="flex-1 flex justify-start">
          {leftSlot}
        </div>

        <div
          data-dynamic
          className={cn(
            "text-lg text-black font-semibold transition-opacity duration-300",
            isHeaderVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {title}
        </div>

        <div className="flex-1 flex justify-end">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
