import { FormEvent, useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home as HomeIcon } from "lucide-react";
import { toast } from "sonner";
import {Page} from "@/components/Page.tsx";
import {useAuthActions} from "@convex-dev/auth/react";

export function HouseholdSetup() {
  const [firstName, setFirstName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signOut } = useAuthActions();
  const createHousehold = useMutation(api.households.createHousehold);

  // Auto-fill household name based on first name
  useEffect(() => {
    if (firstName.trim()) {
      setHouseholdName(`Chez ${firstName.trim()}`);
    } else {
      setHouseholdName("");
    }
  }, [firstName]);

  const handleCreate = async (e: FormEvent) => {
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
    <Page className="py-8 bg-background">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-6">
            <HomeIcon className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-semibold text-primary mb-3">
            Bienvenue
          </h1>
          <p className="px-5 text-lg/snug max-w-md mx-auto">
            Créez votre foyer pour commencer à partager la charge mentale avec votre partenaire
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-8">
          {/* Create Household Form */}
          <div className="p-5">
            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName" className="">On t'appelle comment ?</Label>
                <Input
                  id="firstName"
                  placeholder="Ex: Marie"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoFocus
                  required
                  data-1p-ignore
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="household-name">Nom du foyer</Label>
                <Input
                  id="household-name"
                  placeholder="Chez ..."
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading || !firstName.trim() || !householdName.trim()}
              >
                {isLoading ? "Création..." : "Créer mon foyer"}
              </Button>
            </form>
          </div>

          <div className="px-5">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => void signOut()}
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}
