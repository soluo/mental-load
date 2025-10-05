import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Routes, Route } from "react-router-dom";
import { api } from "../convex/_generated/api";
import { FamilyManagement } from "@/components/FamilyManagement";
import { HouseholdSetup } from "@/pages/HouseholdSetup";
import { HouseholdDashboard } from "@/pages/HouseholdDashboard";
import { GetItDone } from "@/pages/GetItDone";
import { Member } from "@/pages/Member";
import { MainLayout } from "@/layouts/MainLayout";
import { Toaster } from "sonner";
import { Registration } from "@/pages/Registration.tsx";
import { useActiveMember } from "@/contexts/MemberContext";
import { useEffect } from "react";

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Content />
      <Toaster position="bottom-center" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const household = useQuery(api.households.getCurrentHousehold);
  const { activeMemberId, setActiveMemberId } = useActiveMember();

  // Initialize activeMemberId when household is loaded
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

  if (loggedInUser === undefined || household === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        {household ? (
          <MainLayout householdId={household.id}>
            <Routes>
              <Route path="/" element={<HouseholdDashboard household={household} />} />
              <Route path="/get-it-done" element={<GetItDone household={household} />} />
              <Route path="/member" element={<Member />} />
              <Route path="/family" element={<FamilyManagement household={household} />} />
            </Routes>
          </MainLayout>
        ) : (
          <HouseholdSetup />
        )}
      </Authenticated>

      <Unauthenticated>
        <Registration />
      </Unauthenticated>
    </>
  );
}
