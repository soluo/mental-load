import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Home, Users, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  email?: string;
  name?: string;
  joinedAt: number;
}

interface Household {
  id: string;
  name: string;
  members: Member[];
}

interface HouseholdDashboardProps {
  household: Household;
}

export function HouseholdDashboard({ household }: HouseholdDashboardProps) {
  const leaveHousehold = useMutation(api.households.leaveHousehold);

  const handleLeave = async () => {
    if (!confirm("Êtes-vous sûr de vouloir quitter ce foyer ?")) return;

    try {
      await leaveHousehold();
      toast.success("Vous avez quitté le foyer");
    } catch (error) {
      toast.error("Erreur lors de la sortie du foyer");
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Home className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {household.name}
              </h1>
              <p className="text-slate-600">
                {household.members.length} membre{household.members.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLeave}>
            <LogOut className="w-4 h-4 mr-2" />
            Quitter
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-medium text-slate-900">Membres</h2>
          </div>
          <div className="space-y-4">
            {household.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-slate-50"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-slate-600 font-medium text-sm">
                    {(member.name || member.email || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {member.name || member.email || "Utilisateur"}
                  </p>
                  {member.email && member.name && (
                    <p className="text-sm text-slate-600">{member.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

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
    </div>
  );
}
