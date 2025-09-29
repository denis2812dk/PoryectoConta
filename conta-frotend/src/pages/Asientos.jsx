import AsientoForm from "../components/AsientoForm";
import { useState } from "react";

export default function Asientos() {
  // si quieres notificar guardados, puedes dejar este estado
  const [savedTick, setSavedTick] = useState(0);

  return (
    <div className="min-h-screen w-full overflow-x-hidden pr-4 sm:pr-6 bg-slate-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="w-full flex h-16 items-center justify-center px-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Asientos contables
          </h1>
        </div>
      </header>


      <main className="flex-1 pt-6 md:pt-8 px-2 sm:px-6 lg:px-8 w-full">
        <div className="w-full flex flex-col gap-6 min-h-full items-stretch justify-start py-4 md:py-12">
          {/* Formulario */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-8">
            
            <AsientoForm onSaved={() => setSavedTick((n) => n + 1)} />
          </section>
        </div>
      </main>
    </div>
  );
}
