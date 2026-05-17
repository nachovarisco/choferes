import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, FileText, MapPin, Truck, User } from "lucide-react";
import { Badge, LinkButton, PageHeader, Panel, StatCard } from "@/components/ui";
import { statusTone } from "@/lib/data";
import { getLiveData } from "@/lib/queries";

export default async function OrdenDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getLiveData();
  const normalized = id.toLowerCase();
  const order = data.orders.find((item) => item.slug === normalized || item.code.toLowerCase() === normalized);

  if (!order) {
    notFound();
  }

  const client = data.clients.find((item) => item.slug === order.clientSlug);
  const driver = order.driverSlug ? data.drivers.find((item) => item.slug === order.driverSlug) : undefined;
  const unit = order.unitId ? data.units.find((item) => item.id === order.unitId) : undefined;

  return (
    <div>
      <PageHeader
        eyebrow="Órdenes de carga"
        title={order.code}
        description="Preparación de carga antes de convertirla o asociarla a un viaje operativo."
        actions={
          <>
            <LinkButton href="/ordenes">Volver a órdenes</LinkButton>
            <LinkButton href={`/viajes?orden=${order.slug}`} tone="dark">
              Asociar a viaje
            </LinkButton>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Cliente" value={client?.name ?? order.clientSlug.toUpperCase()} icon={<ClipboardList size={18} />} />
        <StatCard title="Estado" value={order.status} icon={<Truck size={18} />} tone={statusTone(order.status)} />
        <StatCard title="Documentos" value={order.risk ? "Revisar" : "OK"} icon={<FileText size={18} />} tone={order.risk ? "red" : "green"} />
        <StatCard title="Asignación" value={driver ? "Parcial" : "Pendiente"} icon={<User size={18} />} tone={driver ? "blue" : "amber"} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Carga">
          <Info icon={<ClipboardList size={18} />} label="Mercadería" value={order.load} />
          <Info icon={<MapPin size={18} />} label="Origen" value={order.origin} />
          <Info icon={<MapPin size={18} />} label="Destino" value={order.destination} />
          <Info icon={<FileText size={18} />} label="Documentación" value={order.docs} danger={order.risk} />
        </Panel>

        <Panel title="Asignación sugerida">
          <Info icon={<User size={18} />} label="Chofer" value={driver?.name ?? "Sin asignar"} />
          <Info icon={<Truck size={18} />} label="Unidad" value={unit ? `${unit.brand} ${unit.model} · ${unit.plate}` : "Sin asignar"} />
          <Badge tone={statusTone(order.status)}>{order.status}</Badge>
        </Panel>

        <Panel title="Flujo recomendado">
          <Badge tone="blue">1. Validar documentación</Badge>
          <Badge tone="blue">2. Confirmar carga</Badge>
          <Badge tone="amber">3. Asignar chofer y unidad</Badge>
          <Badge tone="green">4. Crear viaje asociado</Badge>
          <Link href="/viajes" className="text-sm font-medium text-blue-600 hover:underline">
            Ir al tablero de viajes
          </Link>
        </Panel>
      </section>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 text-sm ${danger ? "text-red-600" : "text-slate-600"}`}>
      <span className="text-slate-500">{icon}</span>
      <span>
        <span className="font-medium text-slate-800">{label}: </span>
        {value}
      </span>
    </div>
  );
}
