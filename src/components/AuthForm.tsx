import * as React from 'react'
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AuthForm() {
  const { signIn } = useAuthActions();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      if (isSignUp && formData.name) {
        formDataToSend.append("name", formData.name);
      }
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("flow", isSignUp ? "signUp" : "signIn");

      await signIn("password", formDataToSend);
      toast.success(isSignUp ? "Compte créé avec succès" : "Connexion réussie");
    } catch (error) {
      toast.error(
        isSignUp
          ? "Erreur lors de la création du compte"
          : "Erreur lors de la connexion"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            {isSignUp ? "Créer un compte" : "Se connecter"}
          </h2>
          <p className="text-slate-600">
            {isSignUp
              ? "Commencez à partager la charge mentale"
              : "Accédez à votre espace"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required={isSignUp}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Chargement..."
              : isSignUp
                ? "Créer mon compte"
                : "Se connecter"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            {isSignUp ? (
              <>
                Vous avez déjà un compte ?{" "}
                <span className="font-medium text-slate-900">Se connecter</span>
              </>
            ) : (
              <>
                Pas encore de compte ?{" "}
                <span className="font-medium text-slate-900">S'inscrire</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
