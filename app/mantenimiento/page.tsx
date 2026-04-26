import { AlertTriangle, Calendar, Search, Truck, Wrench } from "lucide-react";

export default function MantenimientoPage() {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Mantenimiento
          </h1>
          <p className="text-slate-500 mt-1">
            Services, reparaciones, controles preventivos y flota detenida.
          </p>
        </div>

        <button className="bg-slate-900 text-white rounded-xl px-5 py-3 text-sm flex items-center gap-2">
          <Wrench size={18} />
          Nuevo service
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="En taller" value="3" danger />
        <MiniCard title="Service próximos" value="5" />
        <MiniCard title="Reparaciones abiertas" value="4" danger />
        <MiniCard title="Unidades operativas" value="22" />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Buscar patente, unidad o tipo de reparación..."
          />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MaintenanceCard
          plate="AE321JK"
          model="Iveco Cursor 330"
          issue="Reparación de motor"
          status="En taller"
          next="Sin fecha estimada"
          risk
        />

        <MaintenanceCard
          plate="AB123CD"
          model="Volvo 370"
          issue="Cambio de aceite y filtros"
          status="Programado"
          next="28/04/2026"
        />

        <MaintenanceCard
          plate="AC456EF"
          model="Scania 360"
          issue="Revisión de frenos"
          status="Próximo"
          next="02/05/2026"
        />

        <MaintenanceCard
          plate="AG987NO"
          model="Mercedes 1938"
          issue="Seguro vencido + inspección"
          status="Bloqueada"
          next="Urgente"
          risk
        />
      </section>
    </div>
  );
}

function MiniCard({ title, value, danger = false }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className={`text-3xl font-bold mt-2 ${danger ? "text-red-600" : "text-slate-900"}`}>
        {value}
      </h2>
    </div>
  );
}

function MaintenanceCard({
  plate,
  model,
  issue,
  status,
  next,
  risk = false,
}: any) {
  const color =
    status === "En taller"
      ? "bg-red-100 text-red-700"
      : status === "Bloqueada"
      ? "bg-red-100 text-red-700"
      : status === "Programado"
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center">
            <Truck size={22} className="text-slate-700" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{plate}</h2>
            <p className="text-sm text-slate-500">{model}</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
          {status}
        </span>
      </div>

      <div className="space-y-3">
        <Info icon={<Wrench size={18} />} text={issue} danger={risk} />
        <Info icon={<Calendar size={18} />} text={next} />
      </div>

      <button className="w-full mt-6 border border-slate-200 rounded-xl py-3 text-sm text-slate-700 hover:bg-slate-50">
        Ver historial
      </button>
    </div>
  );
}

function Info({ icon, text, danger = false }: any) {
  return (
    <div className={`flex items-center gap-3 text-sm ${danger ? "text-red-600" : "text-slate-600"}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}