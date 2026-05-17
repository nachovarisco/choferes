import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  FileText,
  Truck,
  Users,
} from "lucide-react";
import { Badge, DataTable, LinkButton, PageHeader, Panel, StatCard } from "@/components/ui";
import {
  money,
  statusTone,
  tripRoute,
} from "@/lib/data";
import { getLiveData } from "@/lib/queries";

export default async function DashboardPage() {
  const { clients, documents, drivers, incidents, trips, units } = await getLiveData();
  const clientNames = (slugs: string[]) =>
    slugs.map((slug) => clients.find((client) => client.slug === slug)?.name ?? slug).join(" + ");
  const activeTrips = trips.filter((trip) => trip.status !== "Finalizado");
  const availableDrivers = drivers.filter((driver) => driver.status === "Disponible");
  const expiringDocs = documents.filter((document) => document.status === "Por vencer" || document.status === "Vencido");
  const openIncidents = incidents.filter((incident) => incident.type !== "Resuelta");
  const estimatedRevenue = trips.length * 855000;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen general de la operación logística de Transporte Nexo."
        actions={
          <>
            <LinkButton href="/viajes">
              <Truck size={18} />
              Ver viajes
            </LinkButton>
            <LinkButton href="/api/export?type=operacion" tone="dark">
              Exportar reporte
            </LinkButton>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Viajes activos" value={String(activeTrips.length)} detail="+12% vs ayer" icon={<Truck size={18} />} />
        <StatCard title="Facturación estimada" value={money(estimatedRevenue)} detail="+8% vs ayer" icon={<DollarSign size={18} />} />
        <StatCard title="Choferes disponibles" value={String(availableDrivers.length)} detail={`de ${drivers.length} en total`} icon={<Users size={18} />} />
        <StatCard title="Incidencias abiertas" value={String(openIncidents.length)} detail="requieren atención" icon={<AlertTriangle size={18} />} tone="red" />
        <StatCard title="Docs. por vencer" value={String(expiringDocs.length)} detail="próximos 7 días" icon={<FileText size={18} />} tone="amber" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel
            title="Viajes de hoy"
            action={
              <Link href="/viajes" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                Ver todos <ArrowUpRight size={16} />
              </Link>
            }
            className="p-0"
          >
            <DataTable
              data={trips.slice(0, 4)}
              getKey={(trip) => trip.slug}
              columns={[
                {
                  header: "Viaje",
                  cell: (trip) => (
                    <Link href={`/viajes/${trip.slug}`} className="font-medium text-blue-600 hover:underline">
                      {trip.id}
                    </Link>
                  ),
                },
                { header: "Clientes", cell: (trip) => clientNames(trip.clientSlugs) },
                { header: "Ruta", cell: (trip) => tripRoute(trip) },
                {
                  header: "Chofer",
                  cell: (trip) => {
                    const driver = drivers.find((item) => item.slug === trip.driverSlug);
                    return driver?.name ?? "Sin asignar";
                  },
                },
                { header: "Estado", cell: (trip) => <Badge tone={statusTone(trip.status)}>{trip.status}</Badge> },
              ]}
            />
          </Panel>
        </div>

        <Panel title="Atención requerida">
          {incidents.slice(0, 4).map((incident) => (
            <Link key={incident.id} href={`/alertas/${incident.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-500" />
                <p className="text-sm text-slate-700">{incident.title}</p>
              </div>
              <Badge tone={incident.tone}>{incident.type}</Badge>
            </Link>
          ))}
        </Panel>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Top clientes del mes">
          {clients.slice(0, 3).map((client) => (
            <div key={client.slug} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-950">{client.name}</p>
                <p className="text-sm text-slate-500">{client.tripsThisMonth} viajes</p>
              </div>
              <p className="font-semibold text-slate-950">{money(client.tripsThisMonth * 29500)}</p>
            </div>
          ))}
        </Panel>

        <Panel title="Choferes destacados">
          {drivers.slice(0, 3).map((driver) => (
            <div key={driver.slug} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                {driver.initials}
              </div>
              <div>
                <p className="font-medium text-slate-950">{driver.name}</p>
                <p className="text-sm text-slate-500">{driver.punctuality}% puntualidad</p>
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Qué mirar hoy">
          <Insight text="Buenos Aires presenta mayor demora promedio." />
          <Insight text={`${units.filter((unit) => unit.hasRisk).length} unidades tienen observaciones técnicas o documentales.`} />
          <Insight text={`${expiringDocs.length} documentos críticos necesitan actualización.`} />
        </Panel>
      </section>

      <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <CalendarDays size={18} />
        Hoy, 16 de mayo
      </div>
    </div>
  );
}

function Insight({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" />
      <p className="text-sm text-slate-700">{text}</p>
    </div>
  );
}
