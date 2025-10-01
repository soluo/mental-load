import { Home } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface Member {
  id: Id<"householdMembers">;
  userId?: Id<"users">;
  firstName: string;
  role: "adult" | "child";
  email?: string;
  joinedAt: number;
}

interface Household {
  id: Id<"households">;
  name: string;
  members: Member[];
}

interface HouseholdDashboardProps {
  household: Household;
}

export function HouseholdDashboard({ household }: HouseholdDashboardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Home className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Votre espace est prêt
          </h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Les fonctionnalités de gestion de la charge mentale seront bientôt disponibles
          </p>
        </div>
      </div>
    </div>
  );
}
