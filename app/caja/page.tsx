"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Download, Plus, Receipt, Truck, User, Wallet } from "lucide-react";
import { Field, ModalActions, ModalFrame, SelectField } from "@/components/controls";
import { Badge, Button, DataTable, LinkButton, PageHeader, Panel, StatCard } from "@/components/ui";
import { createCashMovementAction } from "@/app/actions";
import { useLiveData } from "@/components/use-live-data";
import { money, type Trip } from "@/lib/data";

export default function CajaPage() {
  const [open, setOpen] = useState(false);
  const { cashMovements, drivers, trips, units } = useLiveData();
  const findDriver = (slug: string) => drivers.find((driver) => driver.slug === slug);
  const findTrip = (slug: string) => trips.find((trip) => trip.slug === slug);
  const findUnit = (id: string) => units.find((unit) => unit.id === id.toLowerCase());
  const totalAssigned = trips.reduce((sum, trip) => sum + trip.assignedCash, 0);
  const totalSpent = trips.reduce((sum, trip) => sum + trip.spentCash, 0);
  const openDifferences = trips.reduce((sum, trip) => sum + Math.max(trip.spentCash - trip.assignedCash, 0), 0);

  return (
    <div>
      <PageHeader
        title="Caja"
        description="Control de dinero asignado, gastos, rendiciones y saldos por viaje."
        actions={
          <>
            <LinkButton href="/api/export?type=caja">
              <Download size={18} />
              Exportar Excel
            </LinkButton>
            <Button onClick={() => setOpen(true)}>
              <Plus size={18} />
              Nuevo movimiento
            </Button>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Caja disponible" value={money(2450000)} icon={<Wallet size={18} />} />
        <StatCard title="Asignado a choferes" value={money(totalAssigned)} icon={<ArrowUpCircle size={18} />} tone="amber" />
        <StatCard title="Gastos rendidos" value={money(totalSpent)} icon={<Receipt size={18} />} />
        <StatCard title="Diferencias abiertas" value={money(openDifferences)} icon={<ArrowDownCircle size={18} />} tone={openDifferences > 0 ? "red" : "green"} />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Resumen por viaje">
          {trips.slice(0, 3).map((trip) => {
            const balance = trip.assignedCash - trip.spentCash;
            return (
              <div key={trip.slug} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/viajes/${trip.slug}/rendicion`} className="font-semibold text-blue-600 hover:underline">
                    {trip.id}
                  </Link>
                  <span className={`text-sm font-bold ${balance < 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {money(balance)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <User size={16} />
                    {findDriver(trip.driverSlug)?.name ?? "Sin chofer"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Truck size={16} />
                    {findUnit(trip.unitId)?.plate ?? "Sin unidad"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Wallet size={16} />
                    Asignado: {money(trip.assignedCash)} · Gastado: {money(trip.spentCash)}
                  </span>
                </div>
              </div>
            );
          })}
        </Panel>

        <Panel title="Gastos por categoría">
          {["Peajes", "Combustible", "Gomería", "Repuestos", "Estacionamiento", "Viáticos"].map((category, index) => (
            <Category key={category} name={category} value={money([185000, 240500, 82000, 65000, 18000, 22000][index])} percent={[58, 72, 31, 24, 11, 14][index]} />
          ))}
        </Panel>

        <Panel title="Alertas administrativas">
          <Badge tone="red">Luis Gómez gastó $14.800 más de lo asignado.</Badge>
          <Badge tone="amber">Falta comprobante de gomería en VJ-000125.</Badge>
          <Badge tone="amber">Peaje sin rendir en viaje VJ-000124.</Badge>
          <Badge tone="green">Caja general conciliada hasta ayer.</Badge>
        </Panel>
      </section>

      <DataTable
        data={cashMovements}
        getKey={(movement) => movement.id}
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
          {
            header: "Viaje",
            cell: (movement) => {
              const trip = findTrip(movement.tripSlug);
              return trip ? (
                <Link href={`/viajes/${trip.slug}/rendicion`} className="font-medium text-blue-600 hover:underline">
                  {trip.id}
                </Link>
              ) : (
                "Sin viaje"
              );
            },
          },
          { header: "Chofer", cell: (movement) => findDriver(movement.driverSlug)?.name ?? "Sin chofer" },
          { header: "Unidad", cell: (movement) => findUnit(movement.unitId)?.plate ?? "Sin unidad" },
          { header: "Monto", cell: (movement) => <span className={movement.amount < 0 ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>{money(movement.amount)}</span> },
          { header: "Estado", cell: (movement) => <Badge tone={movement.risk ? "red" : movement.type === "Ingreso" ? "blue" : "green"}>{movement.status}</Badge> },
        ]}
      />

      {open ? <NewMovementModal trips={trips} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function NewMovementModal({ trips, onClose }: { trips: Trip[]; onClose: () => void }) {
  return (
    <ModalFrame
      title="Nuevo movimiento"
      description="Registrá un ingreso, egreso o asignación de caja vinculado a un viaje."
      onClose={onClose}
      size="md"
      footer={<ModalActions onCancel={onClose} confirmLabel="Guardar movimiento" submit formId="new-movement-form" />}
    >
      <form id="new-movement-form" action={createCashMovementAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SelectField name="type" label="Tipo" options={["Ingreso", "Egreso"]} required />
        <SelectField name="category" label="Categoría" options={["Asignación a chofer", "Peaje", "Combustible", "Gomería", "Repuesto", "Viático"]} required />
        <SelectField name="tripCode" label="Viaje" options={trips.map((trip) => trip.id)} required />
        <Field name="amount" label="Monto" placeholder="Ej: 120000" required />
        <Field name="date" label="Fecha" type="date" required />
        <SelectField name="status" label="Estado" options={["Asignado", "Rendido", "Falta comprobante"]} required />
      </form>
    </ModalFrame>
  );
}

function Category({
  name,
  value,
  percent,
}: {
  name: string;
  value: string;
  percent: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-600">{name}</span>
        <span className="font-semibold text-slate-950">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
