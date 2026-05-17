"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, FileText, Truck, User } from "lucide-react";
import { Field, ModalActions, ModalFrame, SearchBox, SelectField, TextArea } from "@/components/controls";
import { Badge, Button, Card, PageHeader, StatCard } from "@/components/ui";
import { createOrderAction } from "@/app/actions";
import { useLiveData } from "@/components/use-live-data";
import { statusTone, type Client, type Driver, type Order, type Unit } from "@/lib/data";

export default function OrdenesPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { clients, drivers, orders, units } = useLiveData();
  const findDriver = (slug: string) => drivers.find((driver) => driver.slug === slug);
  const findUnit = (id: string) => units.find((unit) => unit.id === id.toLowerCase());
  const clientNames = (slugs: string[]) =>
    slugs.map((slug) => clients.find((client) => client.slug === slug)?.name ?? slug).join(" + ");

  const normalized = query.trim().toLowerCase();
  const filteredOrders = normalized
    ? orders.filter((order) => {
        const driver = order.driverSlug ? findDriver(order.driverSlug) : undefined;
        const unit = order.unitId ? findUnit(order.unitId) : undefined;
        const haystack = [
          order.code,
          order.load,
          order.status,
          order.docs,
          order.origin,
          order.destination,
          clientNames([order.clientSlug]),
          driver?.name,
          unit?.plate,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalized);
      })
    : orders;

  return (
    <div>
      <PageHeader
        title="Órdenes de carga"
        description="Gestión de cargas pendientes, asignaciones y documentación previa al viaje."
        actions={
          <Button onClick={() => setOpen(true)}>
            <ClipboardList size={18} />
            Nueva orden
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Pendientes" value={String(orders.filter((order) => order.status === "Pendiente").length)} icon={<ClipboardList size={18} />} />
        <StatCard title="Asignadas" value={String(orders.filter((order) => order.status === "Asignada").length)} icon={<Truck size={18} />} tone="blue" />
        <StatCard title="En carga" value={String(orders.filter((order) => order.status === "En carga").length)} icon={<Truck size={18} />} tone="amber" />
        <StatCard title="Con faltantes" value={String(orders.filter((order) => order.risk).length)} icon={<FileText size={18} />} tone="red" />
      </section>

      <section className="mb-6">
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar por cliente, carga, destino, chofer o unidad..." />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.code}
            clientName={clientNames([order.clientSlug])}
            driver={order.driverSlug ? findDriver(order.driverSlug) : undefined}
            order={order}
            unit={order.unitId ? findUnit(order.unitId) : undefined}
          />
        ))}
      </section>

      {open ? <NewOrderModal clients={clients} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function OrderCard({
  clientName,
  driver,
  order,
  unit,
}: {
  clientName: string;
  driver?: Driver;
  order: Order;
  unit?: Unit;
}) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{order.code}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{clientName}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {order.origin} → {order.destination}
          </p>
        </div>

        <Badge tone={statusTone(order.status)}>{order.status}</Badge>
      </div>

      <div className="space-y-3">
        <Info icon={<ClipboardList size={18} />}>{order.load}</Info>
        <Info icon={<User size={18} />}>{driver?.name ?? "Sin asignar"}</Info>
        <Info icon={<Truck size={18} />}>{unit ? `${unit.brand} ${unit.model} · ${unit.plate}` : "Sin asignar"}</Info>
        <Info icon={<FileText size={18} />} danger={order.risk}>
          {order.docs}
        </Info>
      </div>

      <Link href={`/ordenes/${order.slug}`} className="mt-6 flex w-full justify-center rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
        Ver orden
      </Link>
    </Card>
  );
}

function NewOrderModal({ clients, onClose }: { clients: Client[]; onClose: () => void }) {
  return (
    <ModalFrame
      title="Nueva orden de carga"
      description="Armá la carga primero. Después podés asociarla a un viaje con chofer y unidad."
      onClose={onClose}
      size="lg"
      footer={<ModalActions onCancel={onClose} confirmLabel="Crear orden" submit formId="new-order-form" />}
    >
      <form id="new-order-form" action={createOrderAction} className="space-y-6">
        <section className="rounded-lg border border-slate-200 p-5">
          <h3 className="mb-4 font-semibold text-slate-950">Datos de la carga</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              name="clientName"
              label="Cliente"
              options={clients.map((client) => ({ label: `${client.code} · ${client.name}`, value: client.code }))}
              required
            />
            <Field name="reference" label="Código / referencia" placeholder="Ej: OC proveedor, pedido interno..." />
            <Field name="origin" label="Origen de carga" placeholder="Ej: Paraná" required />
            <Field name="destination" label="Destino final" placeholder="Ej: Buenos Aires" required />
            <Field name="load" label="Mercadería" placeholder="Ej: 18 bultos / 10 pallets" required />
            <SelectField name="priority" label="Prioridad" options={["Normal", "Alta", "Urgente"]} />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-5">
          <h3 className="mb-4 font-semibold text-slate-950">Preparación antes del viaje</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SelectField name="docs" label="Documentación" options={["Completa", "Falta VTV", "Falta remito", "Falta póliza"]} />
            <SelectField name="status" label="Estado" options={["Pendiente", "Asignada", "En carga", "Observada"]} />
            <Field name="estimatedDate" label="Fecha estimada" type="date" />
          </div>
          <div className="mt-4">
            <TextArea name="notes" label="Observaciones para tráfico" placeholder="Turnos, cuidados, restricciones de ingreso o documentación requerida." />
          </div>
        </section>
      </form>
    </ModalFrame>
  );
}

function Info({
  icon,
  children,
  danger = false,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 text-sm ${danger ? "text-red-600" : "text-slate-600"}`}>
      {icon}
      <span>{children}</span>
    </div>
  );
}
