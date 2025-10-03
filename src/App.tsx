import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Routes, Route } from "react-router-dom";
import { api } from "../convex/_generated/api";
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader";
import { HouseholdSetup } from "@/components/HouseholdSetup";
import { HouseholdDashboard } from "@/components/HouseholdDashboard";
import { FamilyManagement } from "@/components/FamilyManagement";
import { AuthForm } from "@/components/AuthForm";
import { Toaster } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Authenticated>
        <AuthenticatedHeader />
      </Authenticated>
      <main className="flex-1 flex justify-center p-4">
        <Content />
      </main>
      <div className="fixed bottom-0 inset-x-0">
        <div className="bg-white/70 backdrop-blur">
          <nav className="flex justify-around gap-2">
            <button className="flex flex-col py-4">
              <span className="text-xs text-slate-500">Activité</span>
            </button>
            <button className="flex flex-col py-4">
              <span className="text-xs text-slate-500">Faire</span>
            </button>
            <button className="flex flex-col py-4">
              <span className="text-xs text-slate-500">Réglages</span>
            </button>
          </nav>
        </div>
      </div>
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
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Ensemble
            </h1>
            <p className="text-xl text-slate-600">
              Partagez la charge mentale en toute sérénité
            </p>
          </div>
          <AuthForm />
        </div>
      </Unauthenticated>
    </>
  );
}
