"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Search, Truck, Wrench } from "lucide-react";
import { Field, ModalActions, ModalFrame, SearchBox, SelectField } from "@/components/controls";
import { Badge, Button, Card, PageHeader, StatCard } from "@/components/ui";
import { useLiveData } from "@/components/use-live-data";
import { statusTone, type Unit } from "@/lib/data";
import type { LiveData } from "@/lib/live-data";
import { addDemoUnit, saveDemoLiveData } from "@/lib/demo-store";

export default function UnidadesPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const data = useLiveData();
  const { units } = data;

  const filteredUnits = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return units;
    }

    return units.filter((unit) =>
      [unit.plate, unit.brand, unit.model, unit.status, unit.base, unit.docs.join(" "), unit.technicalNotes.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, units]);

  return (
    <div>
      <PageHeader
        title="Unidades"
        description="Gestión de flota, documentación, mantenimiento y estado operativo."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Truck size={18} />
            Nueva unidad
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Operativas" value={String(units.filter((unit) => unit.status === "Operativa").length)} icon={<CheckCircle2 size={18} />} tone="green" />
        <StatCard title="En viaje" value={String(units.filter((unit) => unit.status === "En viaje").length)} icon={<Truck size={18} />} tone="blue" />
        <StatCard title="Mantenimiento" value={String(units.filter((unit) => unit.status === "Mantenimiento" || unit.status === "Bloqueada").length)} icon={<Wrench size={18} />} tone="red" />
        <StatCard title="Documentación OK" value={String(units.filter((unit) => !unit.hasRisk).length)} icon={<Search size={18} />} />
      </section>

      <section className="mb-6">
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar por patente, marca, modelo o estado..." />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {filteredUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </section>

      {open ? <NewUnitModal data={data} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function NewUnitModal({ data, onClose }: { data: LiveData; onClose: () => void }) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = addDemoUnit(data, new FormData(event.currentTarget));
    saveDemoLiveData(result.data, result.label);
    onClose();
  };

  return (
    <ModalFrame
      title="Nueva unidad"
      description="Alta inicial de camión o semirremolque con documentación mínima."
      onClose={onClose}
      size="lg"
      footer={<ModalActions onCancel={onClose} confirmLabel="Guardar unidad" submit formId="new-unit-form" />}
    >
      <form id="new-unit-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field name="plate" label="Patente" placeholder="Ej: AH123BC" required />
        <SelectField name="type" label="Tipo" options={["Camión", "Semirremolque", "Utilitario"]} required />
        <Field name="brand" label="Marca" placeholder="Ej: Volvo" required />
        <Field name="model" label="Modelo" placeholder="Ej: VM 330" required />
        <Field name="km" label="Kilómetros actuales" placeholder="Ej: 482000" />
        <SelectField name="base" label="Base" options={["Paraná", "Rosario", "Santa Fe", "Córdoba", "Buenos Aires"]} required />
        <Field name="insuranceDue" label="Vencimiento seguro" type="date" />
        <Field name="vtvDue" label="Vencimiento VTV" type="date" />
      </form>
    </ModalFrame>
  );
}

function UnitCard({ unit }: { unit: Unit }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Truck size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-950">{unit.plate}</h2>
            <p className="text-sm text-slate-500">
              {unit.brand} {unit.model}
            </p>
          </div>
        </div>

        <Badge tone={statusTone(unit.status)}>{unit.status}</Badge>
      </div>

      <div className={`mb-4 rounded-lg border p-4 ${unit.hasRisk ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
        <div className="mb-3 flex items-center gap-2">
          {unit.hasRisk ? <AlertTriangle size={18} className="text-amber-700" /> : <CheckCircle2 size={18} className="text-emerald-600" />}
          <p className="text-sm font-semibold text-slate-950">Estado documental / técnico</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[...unit.docs, ...unit.technicalNotes].map((tag) => (
            <Badge key={tag} tone={unit.hasRisk ? "amber" : "slate"}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Wrench size={16} />
        Último control hace 14 días
      </div>

      <Link href={`/unidades/${unit.id}`} className="flex w-full justify-center rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
        Ver unidad
      </Link>
    </Card>
  );
}
