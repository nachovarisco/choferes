"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Search, Truck, Wrench } from "lucide-react";
import { Field, ModalActions, ModalFrame, SearchBox, SelectField, TextArea } from "@/components/controls";
import { Badge, Button, DataTable, PageHeader, StatCard } from "@/components/ui";
import { createMaintenanceAction } from "@/app/actions";
import { useLiveData } from "@/components/use-live-data";
import { statusTone, type Unit } from "@/lib/data";

export default function MantenimientoPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { maintenanceJobs, units } = useLiveData();
  const findUnit = (id: string) => units.find((unit) => unit.id === id.toLowerCase());
  const getUnitMaintenanceJob = (unitId: string) => maintenanceJobs.find((job) => job.unitId === unitId);
  const getMaintenanceTone = (unitId: string) => {
    const unit = findUnit(unitId);
    const job = getUnitMaintenanceJob(unitId);

    if (job?.risk || unit?.status === "Bloqueada" || unit?.status === "Mantenimiento") {
      return "red";
    }

    if (unit?.hasRisk || job) {
      return "amber";
    }

    return "green";
  };
  const getMaintenanceLabel = (unitId: string) => {
    const tone = getMaintenanceTone(unitId);

    if (tone === "red") {
      return "Crítico";
    }

    if (tone === "amber") {
      return "A revisar";
    }

    return "Óptimo";
  };
  const getUnitMaintenanceDetail = (unitId: string) => {
    const unit = findUnit(unitId);
    const job = getUnitMaintenanceJob(unitId);

    if (job) {
      return `${job.issue} · ${job.next}`;
    }

    if (unit?.hasRisk) {
      return [...unit.docs, ...unit.technicalNotes].join(" · ");
    }

    return "Sin observaciones críticas";
  };

  const normalized = query.trim().toLowerCase();
  const filteredUnits = normalized
    ? units.filter((unit) =>
        [
          unit.plate,
          unit.brand,
          unit.model,
          unit.status,
          unit.base,
          unit.docs.join(" "),
          unit.technicalNotes.join(" "),
          getUnitMaintenanceDetail(unit.id),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
    : units;

  return (
    <div>
      <PageHeader
        title="Mantenimiento"
        description="Services, reparaciones, controles preventivos y flota detenida."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Wrench size={18} />
            Nuevo service
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="En taller" value={String(maintenanceJobs.filter((job) => job.status === "En taller").length)} icon={<Wrench size={18} />} tone="red" />
        <StatCard title="Service próximos" value={String(maintenanceJobs.filter((job) => job.status === "Próximo" || job.status === "Programado").length)} icon={<Calendar size={18} />} tone="amber" />
        <StatCard title="Reparaciones abiertas" value={String(maintenanceJobs.filter((job) => job.risk).length)} icon={<Search size={18} />} tone="red" />
        <StatCard title="Unidades operativas" value={String(units.filter((unit) => unit.status === "Operativa").length)} icon={<Truck size={18} />} tone="green" />
      </section>

      <section className="mb-6">
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar patente, unidad o tipo de reparación..." />
      </section>

      <DataTable
        data={filteredUnits}
        getKey={(unit) => unit.id}
        columns={[
          {
            header: "Unidad",
            cell: (unit) => (
              <div>
                <Link href={`/unidades/${unit.id}`} className="font-semibold text-blue-600 hover:underline">
                  {unit.plate}
                </Link>
                <p className="text-xs text-slate-500">
                  {unit.brand} {unit.model} · Base {unit.base}
                </p>
              </div>
            ),
          },
          { header: "Estado", cell: (unit) => <Badge tone={getMaintenanceTone(unit.id)}>{getMaintenanceLabel(unit.id)}</Badge> },
          { header: "Operación", cell: (unit) => <Badge tone={statusTone(unit.status)}>{unit.status}</Badge> },
          { header: "Próximo control", cell: (unit) => unit.serviceDue },
          { header: "Detalle", cell: (unit) => getUnitMaintenanceDetail(unit.id) },
          {
            header: "Acción",
            cell: (unit) => (
              <Link href={`/unidades/${unit.id}`} className="font-medium text-blue-600 hover:underline">
                Ver detalle
              </Link>
            ),
          },
        ]}
      />

      {open ? <NewServiceModal units={units} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function NewServiceModal({ units, onClose }: { units: Unit[]; onClose: () => void }) {
  return (
    <ModalFrame
      title="Nuevo service"
      description="Programá una intervención técnica y dejá la unidad marcada para seguimiento."
      onClose={onClose}
      size="lg"
      footer={<ModalActions onCancel={onClose} confirmLabel="Guardar service" submit formId="new-service-form" />}
    >
      <form id="new-service-form" action={createMaintenanceAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SelectField name="unitPlate" label="Unidad" options={units.map((unit) => `${unit.plate} · ${unit.brand} ${unit.model}`)} required />
        <SelectField name="kind" label="Tipo de intervención" options={["Service preventivo", "Reparación", "Inspección", "Documentación"]} required />
        <Field name="date" label="Fecha programada" type="date" />
        <SelectField name="priority" label="Prioridad" options={["Normal", "Alta", "Crítica"]} />
        <div className="md:col-span-2">
          <TextArea name="detail" label="Detalle" placeholder="Qué hay que hacerle, repuestos necesarios, taller asignado o documentación a renovar." required />
        </div>
      </form>
    </ModalFrame>
  );
}
