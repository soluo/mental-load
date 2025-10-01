import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Home, Users } from "lucide-react";
import { toast } from "sonner";

export function HouseholdSetup() {
  const [isCreating, setIsCreating] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createHousehold = useMutation(api.households.createHousehold);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdName.trim()) return;

    setIsLoading(true);
    try {
      await createHousehold({ name: householdName });
      toast.success("Foyer créé avec succès");
      setIsCreating(false);
      setHouseholdName("");
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
          <Home className="w-8 h-8 text-slate-600" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3">
          Bienvenue
        </h1>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          Créez votre foyer pour commencer à partager la charge mentale avec votre partenaire
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="space-y-6">
          <button
            onClick={() => setIsCreating(true)}
            className="w-full p-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <Home className="w-6 h-6 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-900 mb-1">
                  Créer un nouveau foyer
                </h3>
                <p className="text-slate-600">
                  Commencez un nouveau foyer et invitez votre partenaire à vous rejoindre
                </p>
              </div>
            </div>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">ou</span>
            </div>
          </div>

          <button
            disabled
            className="w-full p-6 rounded-xl border-2 border-slate-200 bg-slate-50 text-left opacity-60 cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-700 mb-1">
                  Rejoindre un foyer existant
                </h3>
                <p className="text-slate-500">
                  Demandez à votre partenaire de vous inviter
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer votre foyer</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre foyer. Vous pourrez inviter votre partenaire ensuite.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="household-name">Nom du foyer</Label>
              <Input
                id="household-name"
                placeholder="Notre foyer"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreating(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading || !householdName.trim()}>
                {isLoading ? "Création..." : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
