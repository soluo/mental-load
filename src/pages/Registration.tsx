import {Page} from "@/components/Page.tsx";
import {AuthForm} from "@/components/AuthForm.tsx";

export function Registration() {
  return (
    <Page className="py-8">
      <div className="w-full max-w-lg mx-auto">
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
    </Page>
  )
}
