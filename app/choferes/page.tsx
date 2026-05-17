"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, FileWarning, Truck, UserPlus } from "lucide-react";
import { Field, ModalActions, ModalFrame, SearchBox, SelectField } from "@/components/controls";
import { Badge, Button, Card, PageHeader, StatCard } from "@/components/ui";
import { createDriverAction } from "@/app/actions";
import { useLiveData } from "@/components/use-live-data";
import { statusTone, type Driver, type Unit } from "@/lib/data";

export default function ChoferesPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { drivers, units } = useLiveData();
  const findUnit = (id: string) => units.find((unit) => unit.id === id.toLowerCase());

  const normalized = query.trim().toLowerCase();
  const filteredDrivers = normalized
    ? drivers.filter((driver) => {
        const unit = driver.unitId ? findUnit(driver.unitId) : undefined;
        return [driver.name, driver.category, driver.status, driver.license, unit?.plate, unit?.brand, unit?.model]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
    : drivers;

  return (
    <div>
      <PageHeader
        title="Choferes"
        description="Estado operativo, clasificación interna, unidad asignada y documentación vinculada."
        actions={
          <Button onClick={() => setOpen(true)}>
            <UserPlus size={18} />
            Nuevo chofer
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Disponibles" value={String(drivers.filter((driver) => driver.status === "Disponible").length)} icon={<UserPlus size={18} />} tone="green" />
        <StatCard title="En viaje" value={String(drivers.filter((driver) => driver.status === "En viaje").length)} icon={<Truck size={18} />} tone="blue" />
        <StatCard title="Descansando" value={String(drivers.filter((driver) => driver.status === "Descansando").length)} icon={<Clock size={18} />} />
        <StatCard title="Con observaciones" value={String(drivers.filter((driver) => driver.licenseRisk).length)} icon={<FileWarning size={18} />} tone="red" />
      </section>

      <section className="mb-6">
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar por nombre, categoría, estado, unidad o patente..." />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <DriverCard key={driver.slug} driver={driver} unit={driver.unitId ? findUnit(driver.unitId) : undefined} />
        ))}
      </section>

      {open ? <NewDriverModal units={units} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function NewDriverModal({ units, onClose }: { units: Unit[]; onClose: () => void }) {
  return (
    <ModalFrame
      title="Nuevo chofer"
      description="Alta operativa de chofer, categoría interna y documentación inicial."
      onClose={onClose}
      size="lg"
      footer={<ModalActions onCancel={onClose} confirmLabel="Guardar chofer" submit formId="new-driver-form" />}
    >
      <form id="new-driver-form" action={createDriverAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field name="name" label="Nombre y apellido" placeholder="Ej: Pedro Ramírez" required />
        <Field name="dni" label="DNI" placeholder="Ej: 31.234.567" required />
        <Field name="phone" label="Teléfono" placeholder="Ej: 343 555-0000" required />
        <SelectField name="category" label="Categoría" options={["Nexo Aberturas", "Tercero", "Mixto"]} required />
        <Field name="licenseDue" label="Vencimiento licencia" type="date" />
        <SelectField name="unitPlate" label="Unidad asignada" options={["Sin asignar", ...units.map((unit) => unit.plate)]} />
      </form>
    </ModalFrame>
  );
}

function DriverCard({ driver, unit }: { driver: Driver; unit?: Unit }) {
  const unitRisk = unit?.hasRisk ?? false;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200 font-bold text-slate-700">
            {driver.initials}
          </div>

          <div>
            <h2 className="font-semibold text-slate-950">{driver.name}</h2>
            <p className="text-sm text-slate-500">{driver.phone}</p>
            <Badge tone={driver.category === "Tercero" ? "purple" : driver.category === "Mixto" ? "green" : "blue"} className="mt-2">
              {driver.category}
            </Badge>
          </div>
        </div>

        <Badge tone={statusTone(driver.status)}>{driver.status}</Badge>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Truck size={18} className="text-slate-600" />
          <p className="text-sm font-semibold text-slate-950">Unidad asignada</p>
        </div>

        <p className="text-sm text-slate-700">
          {unit ? (
            <>
              {unit.brand} {unit.model} · <span className="font-medium">{unit.plate}</span>
            </>
          ) : (
            "Sin unidad asignada"
          )}
        </p>

        <p className={`mt-2 text-xs ${unitRisk ? "text-red-600" : "text-slate-500"}`}>
          {unit ? unit.docs.join(" · ") : "Sin unidad asignada"}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <InfoRow
          icon={driver.licenseRisk ? <FileWarning size={18} /> : <CheckCircle2 size={18} />}
          danger={driver.licenseRisk}
          text={driver.license}
        />
        <InfoRow icon={<Clock size={18} />} text={`${driver.tripsThisMonth} viajes este mes`} />
      </div>

      <Link href={`/choferes/${driver.slug}`} className="mt-6 flex w-full justify-center rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
        Ver legajo completo
      </Link>
    </Card>
  );
}

function InfoRow({
  icon,
  text,
  danger = false,
}: {
  icon: React.ReactNode;
  text: string;
  danger?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 text-sm ${danger ? "text-red-600" : "text-slate-600"}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}
