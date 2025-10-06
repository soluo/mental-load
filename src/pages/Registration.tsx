import {Page} from "@/components/Page.tsx";
import {AuthForm} from "@/components/AuthForm.tsx";

export function Registration() {
  return (
    <Page className="pt-[calc(env(safe-area-inset-top)+48px)] pb-8 select-none">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Balance ta tâche
          </h1>
          <p className="text-xl text-slate-600">
            Rendez la charge mentale visible et partagez-là&nbsp;!
          </p>
        </div>
        <AuthForm />
      </div>
    </Page>
  )
}
