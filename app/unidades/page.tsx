import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Truck,
  Wrench,
} from "lucide-react";

export default function UnidadesPage() {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Unidades</h1>
          <p className="text-slate-500 mt-1">
            Gestión de flota, documentación, mantenimiento y estado operativo.
          </p>
        </div>

        <button className="bg-slate-900 text-white rounded-xl px-5 py-3 text-sm">
          Nueva unidad
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="Operativas" value="12" />
        <MiniCard title="En viaje" value="7" />
        <MiniCard title="Mantenimiento" value="2" danger />
        <MiniCard title="Documentación OK" value="10" />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Buscar por patente, marca, modelo o estado..."
          />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UnitCard
          plate="AB123CD"
          model="Volvo 370"
          status="En viaje"
          tags={["Seguro vigente", "VTV vigente", "Service próximo"]}
          warning
        />

        <UnitCard
          plate="AC456EF"
          model="Scania 360"
          status="Operativa"
          tags={["Seguro vigente", "VTV vigente"]}
        />

        <UnitCard
          plate="AD789GH"
          model="Iveco Cursor"
          status="Mantenimiento"
          tags={["Cambio cubiertas", "Revisión frenos"]}
          warning
        />

        <UnitCard
          plate="AE321JK"
          model="Mercedes Axor"
          status="Operativa"
          tags={["Todo vigente"]}
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
  model,
  status,
  tags,
  warning = false,
}: any) {
  const statusColor =
    status === "En viaje"
      ? "bg-blue-100 text-blue-700"
      : status === "Mantenimiento"
      ? "bg-red-100 text-red-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
            <Truck size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{plate}</h2>
            <p className="text-sm text-slate-500">{model}</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {status}
        </span>
      </div>

      <div
        className={`rounded-2xl p-4 mb-4 border ${
          warning
            ? "bg-amber-50 border-amber-200"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          {warning ? (
            <AlertTriangle size={18} className="text-amber-700" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-600" />
          )}

          <p className="text-sm font-semibold text-slate-900">
            Estado documental / técnico
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag: string) => (
            <Tag key={tag} text={tag} warning={warning} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Wrench size={16} />
        Último control hace 14 días
      </div>

      <Link
        href={`/unidades/${plate.toLowerCase()}`}
        className="block text-center w-full border border-slate-200 rounded-xl py-3 text-sm text-slate-700 hover:bg-slate-50"
      >
        Ver unidad
      </Link>
    </div>
  );
}

function Tag({ text, warning = false }: any) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        warning
          ? "bg-white border border-amber-200 text-amber-800"
          : "bg-white border border-slate-200 text-slate-700"
      }`}
    >
      {text}
    </span>
  );
}