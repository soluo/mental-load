export function BottomNavbar() {
  return (
    <div className="fixed bottom-0 inset-x-0">
      <div className="bg-white/70 backdrop-blur">
        <nav className="flex justify-around gap-2">
          <button className="flex flex-col py-4">
            <span className="text-xs text-slate-500">Activité</span>
          </button>
          <button className="flex flex-col py-4">
            <span className="text-xs text-slate-500">Faire</span>
          </button>
          <button className="flex flex-col py-4">
            <span className="text-xs text-slate-500">Réglages</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
