import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "@/components/SignOutButton";
import { HouseholdSetup } from "@/components/HouseholdSetup";
import { HouseholdDashboard } from "@/components/HouseholdDashboard";
import { AuthForm } from "@/components/AuthForm";
import { Toaster } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b border-slate-200 shadow-sm px-6">
        <h2 className="text-xl font-semibold text-slate-900">Ensemble</h2>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster position="top-center" />
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
          <HouseholdDashboard household={household} />
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
