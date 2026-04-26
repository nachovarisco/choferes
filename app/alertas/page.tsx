import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileWarning,
  Search,
  Truck,
  User,
} from "lucide-react";

export default function AlertasPage() {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Alertas e Incidencias
          </h1>
          <p className="text-slate-500 mt-1">
            Seguimiento de problemas operativos, documentación y demoras.
          </p>
        </div>

        <button className="bg-slate-900 text-white rounded-xl px-5 py-3 text-sm">
          Nueva incidencia
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MiniCard title="Abiertas" value="8" danger />
        <MiniCard title="Críticas" value="3" danger />
        <MiniCard title="Resueltas hoy" value="5" />
        <MiniCard title="Pendientes revisión" value="4" />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Buscar incidencia, chofer, patente o cliente..."
          />
        </div>
      </section>

      <section className="space-y-4">
        <AlertCard
          type="Crítica"
          title="VTV vencida en unidad AE321JK"
          detail="Camión asignado a Martín Silva."
          icon={<Truck size={18} />}
          red
        />

        <AlertCard
          type="Alta"
          title="Viaje Easy con demora de 4 horas"
          detail="Paraná → Buenos Aires · Chofer Juan Pérez"
          icon={<Clock3 size={18} />}
          amber
        />

        <AlertCard
          type="Media"
          title="Licencia de Juan Pérez vence en 3 días"
          detail="Renovar documentación personal."
          icon={<User size={18} />}
        />

        <AlertCard
          type="Alta"
          title="Seguro unidad AG987NO vencido"
          detail="Unidad fuera de servicio."
          icon={<FileWarning size={18} />}
          red
        />

        <AlertCard
          type="Resuelta"
          title="Remito faltante cargado correctamente"
          detail="Cliente Dhinox."
          icon={<CheckCircle2 size={18} />}
          green
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

function AlertCard({
  type,
  title,
  detail,
  icon,
  red = false,
  amber = false,
  green = false,
}: any) {
  const color = red
    ? "bg-red-100 text-red-700"
    : amber
    ? "bg-amber-100 text-amber-700"
    : green
    ? "bg-emerald-100 text-emerald-700"
    : "bg-blue-100 text-blue-700";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="flex gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{detail}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
          {type}
        </span>

        <button className="border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Ver
        </button>
      </div>
    </div>
  );
}