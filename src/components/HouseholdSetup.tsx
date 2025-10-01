import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home as HomeIcon, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

export function HouseholdSetup() {
  const [firstName, setFirstName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createHousehold = useMutation(api.households.createHousehold);

  // Auto-fill household name based on first name
  useEffect(() => {
    if (firstName.trim()) {
      setHouseholdName(`Foyer de ${firstName.trim()}`);
    } else {
      setHouseholdName("");
    }
  }, [firstName]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !householdName.trim()) return;

    setIsLoading(true);
    try {
      await createHousehold({
        name: householdName.trim(),
        firstName: firstName.trim()
      });
      toast.success("Foyer créé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la création du foyer");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-6">
          <HomeIcon className="w-8 h-8 text-slate-600" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3">
          Bienvenue
        </h1>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          Créez votre foyer pour commencer à partager la charge mentale avec votre partenaire
        </p>
      </div>

      <div className="space-y-8">
        {/* Create Household Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <HomeIcon className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">
                Créer un nouveau foyer
              </h3>
              <p className="text-sm text-slate-600">
                Commencez votre espace et invitez votre partenaire
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Votre prénom</Label>
              <Input
                id="firstName"
                placeholder="Ex: Marie"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="household-name">Nom du foyer</Label>
              <Input
                id="household-name"
                placeholder="Foyer de..."
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !firstName.trim() || !householdName.trim()}
            >
              {isLoading ? "Création..." : "Créer mon foyer"}
            </Button>
          </form>
        </div>

        {/* Join Household (Disabled) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-700">
                Rejoindre un foyer existant
              </h3>
              <p className="text-sm text-slate-500">
                Demandez à votre partenaire de vous inviter
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-500 italic">Fonctionnalité à venir</p>
        </div>
      </div>
    </div>
  );
}
