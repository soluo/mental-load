import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPortal,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users as UsersIcon, UserPlus as UserPlusIcon, Mail as MailIcon, Trash2 as Trash2Icon, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { pushModal, popModal } from "@/lib/modalStack";

interface Member {
  id: Id<"householdMembers">;
  userId?: Id<"users">;
  firstName: string;
  role: "adult" | "child";
  email?: string;
  color?: string;
  joinedAt: number;
}

interface Household {
  id: Id<"households">;
  name: string;
  members: Member[];
}

interface FamilyManagementProps {
  household: Household;
}

export function FamilyManagement({ household }: FamilyManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [role, setRole] = useState<"adult" | "child">("adult");
  const [email, setEmail] = useState("");

  const addMember = useMutation(api.members.addMember);
  const removeMember = useMutation(api.members.removeMember);

  // Block body scroll when modal is open
  useEffect(() => {
    if (isDialogOpen) {
      pushModal();
    }
    return () => {
      if (isDialogOpen) {
        popModal();
      }
    };
  }, [isDialogOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDialogOpen) {
        setIsDialogOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDialogOpen]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error("Le prénom est obligatoire");
      return;
    }

    try {
      await addMember({
        householdId: household.id,
        firstName: firstName.trim(),
        role,
        email: email.trim() || undefined,
      });

      toast.success("Membre ajouté avec succès");
      setIsDialogOpen(false);
      setFirstName("");
      setRole("adult");
      setEmail("");
    } catch (error) {
      toast.error("Erreur lors de l'ajout du membre");
      console.error(error);
    }
  };

  const handleRemoveMember = async (memberId: Id<"householdMembers">) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return;

    try {
      await removeMember({ memberId });
      toast.success("Membre supprimé");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Ma famille
            </h1>
            <p className="text-slate-600">
              Gérez les membres de votre foyer
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="h-12 rounded-full">
            <UserPlusIcon className="w-4 h-4" />
            Ajouter un membre
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {household.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-4 p-4 rounded-lg bg-white hover:bg-slate-100 transition-colors"
          >
            <Avatar className="h-12 w-12">
              <AvatarFallback color={member.color} className="font-medium text-lg">
                {member.firstName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">
                  {member.firstName}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    member.role === "adult"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {member.role === "adult" ? "Adulte" : "Enfant"}
                </span>
              </div>
              {member.email && (
                <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                  <MailIcon className="w-3 h-3" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveMember(member.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {household.members.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun membre dans ce foyer</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogPortal>
          {/* Full-screen content without overlay */}
          <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden">
            {/* Fixed close bar */}
            <div className="fixed top-0 left-0 right-0 z-10 min-h-12 lg:min-h-16 bg-white/90 backdrop-blur-[2px] flex items-center justify-end px-4">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              >
                <XIcon className="h-6 w-6" />
                <span className="sr-only">Fermer</span>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="w-full max-w-md mx-auto pt-12 lg:pt-16 pb-8 px-4">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Ajouter un membre
                  </h2>
                  <p className="text-slate-600">
                    Ajoutez un nouveau membre à votre foyer. Si vous renseignez un email,
                    une invitation lui sera envoyée.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleAddMember} className="space-y-6">
                  <div>
                    <Label htmlFor="firstName" className="block mb-3">
                      Prénom <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ex: Marie"
                      required
                      className="bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role" className="block mb-3">Rôle</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as "adult" | "child")}>
                      <SelectTrigger id="role" className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="adult">Adulte</SelectItem>
                        <SelectItem value="child">Enfant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="email" className="block mb-3">Email (facultatif)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="membre@example.com"
                      className="bg-white"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Un email permettra à ce membre de se connecter à l'application
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col-reverse gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="w-full rounded-full"
                    >
                      Annuler
                    </Button>
                    <Button type="submit" className="w-full rounded-full">
                      Ajouter
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
