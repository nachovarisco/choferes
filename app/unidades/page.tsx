import { AlertTriangle, CheckCircle2, Search, Truck, Wrench } from "lucide-react";

export default function UnidadesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Unidades</h1>

      <p className="text-slate-500 mt-1 mb-8">
        Control de camiones, acoplados, estado operativo y vencimientos.
      </p>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="Disponibles" value="8" />
        <MiniCard title="En viaje" value="14" />
        <MiniCard title="En taller" value="3" danger />
        <MiniCard title="Con vencimientos" value="5" danger />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Buscar por patente, tipo, chofer asignado o estado..."
          />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <UnitCard
          plate="AB123CD"
          type="Tractor"
          model="Volvo 370"
          driver="Juan Pérez"
          status="En viaje"
          docs="Documentación vigente"
          service="Service en 8.000 km"
        />

        <UnitCard
          plate="AC456EF"
          type="Semirremolque"
          model="Sola y Brusa"
          driver="Luis Gómez"
          status="Disponible"
          docs="VTV vence en 12 días"
          service="Sin service pendiente"
          risk
        />

        <UnitCard
          plate="AD789GH"
          type="Tractor"
          model="Scania 360"
          driver="Carlos Díaz"
          status="En carga"
          docs="Documentación vigente"
          service="Service en 3.000 km"
        />

        <UnitCard
          plate="AE321JK"
          type="Tractor"
          model="Iveco 2014"
          driver="Sin asignar"
          status="En taller"
          docs="VTV vencida"
          service="Reparación motor"
          risk
        />

        <UnitCard
          plate="AF654LM"
          type="Semirremolque"
          model="Helvética"
          driver="Roberto Núñez"
          status="Disponible"
          docs="Documentación vigente"
          service="Cubiertas a revisar"
        />

        <UnitCard
          plate="AG987NO"
          type="Tractor"
          model="Mercedes 1938"
          driver="Diego Fernández"
          status="No disponible"
          docs="Seguro vencido"
          service="Pendiente inspección"
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

function UnitCard({
  plate,
  type,
  model,
  driver,
  status,
  docs,
  service,
  risk = false,
}: any) {
  const statusColor =
    status === "Disponible"
      ? "bg-emerald-100 text-emerald-700"
      : status === "En viaje"
      ? "bg-blue-100 text-blue-700"
      : status === "En carga"
      ? "bg-amber-100 text-amber-700"
      : status === "En taller"
      ? "bg-orange-100 text-orange-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center">
            <Truck size={22} className="text-slate-700" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{plate}</h2>
            <p className="text-sm text-slate-500">
              {type} · {model}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Chofer: {driver}
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {status}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        <InfoRow
          icon={risk ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          text={docs}
          danger={risk}
        />

        <InfoRow icon={<Wrench size={18} />} text={service} />
      </div>

      <button className="w-full mt-6 border border-slate-200 rounded-xl py-3 text-sm text-slate-700 hover:bg-slate-50">
        Ver unidad
      </button>
    </div>
  );
}

function InfoRow({ icon, text, danger = false }: any) {
  return (
    <div className={`flex items-center gap-3 text-sm ${danger ? "text-red-600" : "text-slate-600"}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}