import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Truck,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Resumen general de la operación logística.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 flex items-center gap-2 shadow-sm">
            <CalendarDays size={18} />
            Hoy, 24 de Abril
          </button>

          <button className="bg-slate-900 text-white rounded-xl px-4 py-3 text-sm shadow-sm">
            Exportar reporte
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard title="Viajes activos" value="18" detail="+12% vs ayer" icon={<Truck />} />
        <StatCard title="Facturación estimada" value="$3.420.000" detail="+8% vs ayer" icon={<DollarSign />} />
        <StatCard title="Choferes disponibles" value="6" detail="de 28 en total" icon={<Users />} />
        <StatCard title="Incidencias abiertas" value="2" detail="requieren atención" icon={<AlertTriangle />} danger />
        <StatCard title="Docs. por vencer" value="7" detail="próximos 7 días" icon={<FileText />} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Viajes de hoy</h2>
            <button className="text-sm text-blue-600">Ver todos</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-3">Viaje</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Origen</th>
                  <th className="pb-3">Destino</th>
                  <th className="pb-3">Chofer</th>
                  <th className="pb-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <TripRow id="VJ-000124" client="Easy" origin="Paraná" dest="Buenos Aires" driver="Juan Pérez" status="En viaje" />
                <TripRow id="VJ-000125" client="Cencosud" origin="Rosario" dest="Córdoba" driver="Luis Gómez" status="En carga" />
                <TripRow id="VJ-000126" client="Dhinox" origin="Santa Fe" dest="Mendoza" driver="Carlos Díaz" status="Asignado" />
                <TripRow id="VJ-000127" client="Julicroc" origin="Buenos Aires" dest="Neuquén" driver="Martín Silva" status="Demorado" />
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-5">Atención requerida</h2>

          <div className="space-y-3">
            <AlertItem text="Licencia de Juan Pérez vence en 3 días" tag="Alta" />
            <AlertItem text="Camión ABC123 parado hace 2 días" tag="Media" />
            <AlertItem text="Viaje Easy retrasado 4 hs" tag="Alta" />
            <AlertItem text="Seguro unidad XYZ vence mañana" tag="Alta" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="Top clientes del mes">
          <Client name="Easy" trips="42 viajes" amount="$1.240.000" />
          <Client name="Cencosud" trips="31 viajes" amount="$980.000" />
          <Client name="Julicroc" trips="18 viajes" amount="$620.000" />
        </Panel>

        <Panel title="Choferes destacados">
          <Driver name="Luis Gómez" metric="22 viajes realizados" />
          <Driver name="Carlos Díaz" metric="96% puntualidad" />
          <Driver name="Martín Silva" metric="0 incidencias" />
        </Panel>

        <Panel title="Qué debería mirar hoy">
          <Insight text="Buenos Aires presenta mayor demora promedio." />
          <Insight text="Faltarán 2 choferes disponibles la próxima semana." />
          <Insight text="5 documentos críticos pendientes de actualización." />
        </Panel>
      </section>
    </div>
  );
}

function StatCard({ title, value, detail, icon, danger = false }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${danger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
          {icon}
        </div>
        <ArrowUpRight size={18} className="text-slate-400" />
      </div>
      <p className="text-sm text-slate-500 mt-5">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      <p className={`text-xs mt-2 ${danger ? "text-red-600" : "text-emerald-600"}`}>{detail}</p>
    </div>
  );
}

function TripRow({ id, client, origin, dest, driver, status }: any) {
  const color =
    status === "Demorado"
      ? "bg-red-100 text-red-700"
      : status === "En carga"
      ? "bg-amber-100 text-amber-700"
      : status === "Asignado"
      ? "bg-blue-100 text-blue-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <tr>
      <td className="py-4 font-medium text-slate-900">{id}</td>
      <td className="py-4">{client}</td>
      <td className="py-4">{origin}</td>
      <td className="py-4">{dest}</td>
      <td className="py-4">{driver}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

function AlertItem({ text, tag }: any) {
  return (
    <div className="flex items-center justify-between gap-3 border border-slate-200 rounded-xl p-3">
      <div className="flex items-center gap-3">
        <AlertTriangle size={18} className="text-red-500" />
        <p className="text-sm text-slate-700">{text}</p>
      </div>
      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg">
        {tag}
      </span>
    </div>
  );
}

function Panel({ title, children }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-semibold text-slate-900 mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Client({ name, trips, amount }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-slate-900">{name}</p>
        <p className="text-sm text-slate-500">{trips}</p>
      </div>
      <p className="font-semibold text-slate-900">{amount}</p>
    </div>
  );
}

function Driver({ name, metric }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
        <Users size={18} className="text-slate-600" />
      </div>
      <div>
        <p className="font-medium text-slate-900">{name}</p>
        <p className="text-sm text-slate-500">{metric}</p>
      </div>
    </div>
  );
}

function Insight({ text }: any) {
  return (
    <div className="flex gap-3 items-start">
      <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />
      <p className="text-sm text-slate-700">{text}</p>
    </div>
  );
}