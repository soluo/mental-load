import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface MemberContextType {
  activeMemberId: Id<"householdMembers"> | null;
  setActiveMemberId: (memberId: Id<"householdMembers"> | null) => void;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

const STORAGE_KEY = "ensemble_active_member_id";

export function MemberProvider({ children }: { children: ReactNode }) {
  const [activeMemberId, setActiveMemberIdState] = useState<Id<"householdMembers"> | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored as Id<"householdMembers"> | null;
  });

  const setActiveMemberId = (memberId: Id<"householdMembers"> | null) => {
    setActiveMemberIdState(memberId);
    if (memberId) {
      localStorage.setItem(STORAGE_KEY, memberId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setActiveMemberIdState(stored as Id<"householdMembers">);
    }
  }, []);

  return (
    <MemberContext.Provider value={{ activeMemberId, setActiveMemberId }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useActiveMember() {
  const context = useContext(MemberContext);
  if (context === undefined) {
    throw new Error("useActiveMember must be used within a MemberProvider");
  }
  return context;
}
