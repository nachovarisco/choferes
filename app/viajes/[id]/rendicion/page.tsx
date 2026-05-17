import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownCircle, ArrowUpCircle, FileText, Receipt, Truck, User, Wallet } from "lucide-react";
import { Badge, DataTable, LinkButton, PageHeader, Panel, StatCard } from "@/components/ui";
import {
  money,
  statusTone,
  tripRoute,
} from "@/lib/data";
import { getLiveData } from "@/lib/queries";

export default async function RendicionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getLiveData();
  const trip = data.trips.find((item) => item.slug === id.toLowerCase());

  if (!trip) {
    notFound();
  }

  const driver = data.drivers.find((item) => item.slug === trip.driverSlug);
  const unit = data.units.find((item) => item.id === trip.unitId);
  const movements = data.cashMovements.filter((movement) => movement.tripSlug === trip.slug);
  const balance = trip.assignedCash - trip.spentCash;

  return (
    <div>
      <PageHeader
        eyebrow={`Viajes / ${trip.id}`}
        title="Rendición del viaje"
        description={`${tripRoute(trip)} · control de dinero asignado, gastos, comprobantes y saldo final.`}
        actions={
          <>
            <LinkButton href={`/viajes/${trip.slug}`}>Volver al viaje</LinkButton>
            <LinkButton href="/caja" tone="dark">
              Ver caja
            </LinkButton>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Asignado" value={money(trip.assignedCash)} icon={<ArrowUpCircle size={18} />} tone="blue" />
        <StatCard title="Gastado" value={money(trip.spentCash)} icon={<ArrowDownCircle size={18} />} tone="red" />
        <StatCard title="Saldo" value={money(balance)} icon={<Wallet size={18} />} tone={balance < 0 ? "red" : "green"} />
        <StatCard title="Comprobantes" value={`${movements.length} cargados`} icon={<Receipt size={18} />} tone="green" />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Responsables">
          <Info icon={<User size={18} />} label="Chofer">
            {driver ? (
              <Link href={`/choferes/${driver.slug}`} className="font-medium text-blue-600 hover:underline">
                {driver.name}
              </Link>
            ) : (
              "Sin chofer"
            )}
          </Info>
          <Info icon={<Truck size={18} />} label="Unidad">
            {unit ? (
              <Link href={`/unidades/${unit.id}`} className="font-medium text-blue-600 hover:underline">
                {unit.brand} {unit.model} · {unit.plate}
              </Link>
            ) : (
              "Sin unidad"
            )}
          </Info>
          <Info icon={<FileText size={18} />} label="Estado">
            <Badge tone={statusTone(trip.status)}>{trip.status}</Badge>
          </Info>
        </Panel>

        <Panel title="Control administrativo" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Check title="Peajes" text="Comprobantes completos" tone="green" />
            <Check title="Combustible" text="Validar ticket físico" tone="amber" />
            <Check title="Diferencia" text={balance < 0 ? "Requiere aprobación" : "Sin diferencia crítica"} tone={balance < 0 ? "red" : "green"} />
          </div>
        </Panel>
      </section>

      <DataTable
        data={movements}
        getKey={(movement) => movement.id}
        emptyText="Este viaje todavía no tiene movimientos cargados."
        columns={[
          { header: "Fecha", cell: (movement) => movement.date },
          {
            header: "Tipo",
            cell: (movement) => (
              <span className="inline-flex items-center gap-2">
                {movement.type === "Ingreso" ? <ArrowUpCircle size={16} className="text-emerald-600" /> : <ArrowDownCircle size={16} className="text-red-600" />}
                {movement.type}
              </span>
            ),
          },
          {
            header: "Categoría",
            cell: (movement) => (
              <span className="inline-flex items-center gap-2">
                <Receipt size={16} />
                {movement.category}
              </span>
            ),
          },
          { header: "Monto", cell: (movement) => <span className={movement.amount < 0 ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>{money(movement.amount)}</span> },
          { header: "Estado", cell: (movement) => <Badge tone={movement.risk ? "red" : movement.type === "Ingreso" ? "blue" : "green"}>{movement.status}</Badge> },
        ]}
      />
    </div>
  );
}

function Info({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="text-slate-500">{icon}</span>
      <span>
        <span className="font-medium text-slate-800">{label}: </span>
        {children}
      </span>
    </div>
  );
}

function Check({
  title,
  text,
  tone,
}: {
  title: string;
  text: string;
  tone: "green" | "amber" | "red";
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="font-medium text-slate-950">{title}</p>
      <Badge tone={tone} className="mt-3">
        {text}
      </Badge>
    </div>
  );
}
