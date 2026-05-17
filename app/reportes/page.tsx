import { BarChart3, DollarSign, TrendingUp, Truck, Users } from "lucide-react";
import { Badge, PageHeader, Panel, StatCard } from "@/components/ui";
import { money } from "@/lib/data";
import { getLiveData } from "@/lib/queries";

export default async function ReportesPage() {
  const { clients, drivers, incidents, trips } = await getLiveData();
  const estimatedRevenue = trips.length * 855000;
  const incidentRate = trips.length > 0
    ? Math.round((incidents.filter((incident) => incident.type !== "Resuelta").length / trips.length) * 100)
    : 0;

  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Estadísticas generales de operación, clientes, choferes y rentabilidad."
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Viajes del mes" value={String(trips.length * 31)} icon={<Truck size={18} />} />
        <StatCard title="Facturación estimada" value={money(estimatedRevenue)} icon={<DollarSign size={18} />} />
        <StatCard title="Margen promedio" value="18.4%" icon={<TrendingUp size={18} />} tone="green" />
        <StatCard title="Choferes activos" value={String(drivers.length)} icon={<Users size={18} />} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Viajes por estado">
          <Progress label="En viaje" value={42} />
          <Progress label="Entregados" value={34} />
          <Progress label="En carga" value={15} />
          <Progress label="Con incidencia" value={incidentRate} danger />
        </Panel>

        <Panel title="Top clientes">
          {clients.slice(0, 4).map((client) => (
            <div key={client.slug} className="flex items-center justify-between">
              <p className="font-medium text-slate-950">{client.name}</p>
              <p className="text-sm text-slate-500">{client.tripsThisMonth} viajes</p>
            </div>
          ))}
        </Panel>

        <Panel title="Indicadores críticos">
          <Kpi title="Demora promedio" value="2h 15m" />
          <Kpi title="Documentos vencidos" value="3" danger />
          <Kpi title="Unidades en taller" value="3" danger />
          <Kpi title="Viajes sin asignar" value="4" />
        </Panel>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <BarChart3 size={20} className="text-slate-700" />
          <h2 className="font-semibold text-slate-950">Evolución mensual</h2>
          <Badge tone="blue">Mayo 2026</Badge>
        </div>

        <div className="grid h-64 grid-cols-7 items-end gap-3">
          <Bar label="Lun" height={45} />
          <Bar label="Mar" height={62} />
          <Bar label="Mié" height={51} />
          <Bar label="Jue" height={78} />
          <Bar label="Vie" height={88} />
          <Bar label="Sáb" height={38} />
          <Bar label="Dom" height={22} />
        </div>
      </section>
    </div>
  );
}

function Progress({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-950">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${danger ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Kpi({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
      <p className="text-sm text-slate-600">{title}</p>
      <p className={`font-bold ${danger ? "text-red-600" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}

function Bar({ label, height }: { label: string; height: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-end gap-3">
      <div className="w-full rounded-t-lg bg-blue-500" style={{ height: `${height}%` }} />
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
