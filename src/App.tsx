import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Routes, Route } from "react-router-dom";
import { api } from "../convex/_generated/api";
import { FamilyManagement } from "@/components/FamilyManagement";
import { HouseholdSetup } from "@/pages/HouseholdSetup";
import { HouseholdDashboard } from "@/pages/HouseholdDashboard";
import { Toaster } from "sonner";
import { Registration } from "@/pages/Registration.tsx";

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-stone-100">
      <Content />
      <Toaster position="bottom-center" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const household = useQuery(api.households.getCurrentHousehold);

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
          <Routes>
            <Route path="/" element={<HouseholdDashboard household={household} />} />
            <Route path="/family" element={<FamilyManagement household={household} />} />
          </Routes>
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
