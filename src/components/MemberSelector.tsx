import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveMember } from "@/contexts/MemberContext";
import { Id } from "../../convex/_generated/dataModel";

interface Member {
  id: Id<"householdMembers">;
  firstName: string;
  role: "adult" | "child";
  email?: string;
}

interface MemberSelectorProps {
  members: Member[];
}

export function MemberSelector({ members }: MemberSelectorProps) {
  const { activeMemberId, setActiveMemberId } = useActiveMember();

  // Set the first member as active by default if none selected
  useEffect(() => {
    if (!activeMemberId && members.length > 0) {
      setActiveMemberId(members[0].id);
    }
  }, [members, activeMemberId, setActiveMemberId]);

  // If the active member was deleted, select the first available member
  useEffect(() => {
    if (activeMemberId && !members.find((m) => m.id === activeMemberId)) {
      if (members.length > 0) {
        setActiveMemberId(members[0].id);
      } else {
        setActiveMemberId(null);
      }
    }
  }, [members, activeMemberId, setActiveMemberId]);

  if (members.length === 0) {
    return null;
  }

  const activeMember = members.find((m) => m.id === activeMemberId);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600 hidden sm:inline">Profil :</span>
      <Select
        value={activeMemberId || undefined}
        onValueChange={(value) => setActiveMemberId(value as Id<"householdMembers">)}
      >
        <SelectTrigger className="w-[180px] h-9 bg-white border-slate-300">
          <SelectValue>
            {activeMember ? activeMember.firstName : "Sélectionner"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {members.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              <div className="flex items-center gap-2">
                <span>{member.firstName}</span>
                <span className="text-xs text-slate-500">
                  ({member.role === "adult" ? "Adulte" : "Enfant"})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
