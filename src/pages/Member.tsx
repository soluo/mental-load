import { Page } from "@/components/Page";
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader";
import { BottomNavbar } from "@/components/BottomNavbar";

export function Member() {
  return (
    <Page>
      <AuthenticatedHeader />

      <div className="w-full max-w-md mx-auto px-4 pb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">
          Réglages
        </h2>

        <p className="text-slate-500">
          Page de réglages à venir...
        </p>
      </div>

      <BottomNavbar />
    </Page>
  );
}
