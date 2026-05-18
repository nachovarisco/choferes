"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, FileWarning, Truck, User } from "lucide-react";
import { Field, ModalActions, ModalFrame, SearchBox, SelectField, TextArea } from "@/components/controls";
import { Badge, Button, Card, PageHeader, StatCard } from "@/components/ui";
import { useLiveData } from "@/components/use-live-data";
import type { Incident } from "@/lib/data";
import type { LiveData } from "@/lib/live-data";
import { addDemoIncident, saveDemoLiveData } from "@/lib/demo-store";

export default function AlertasPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const data = useLiveData();
  const { incidents } = data;

  const filteredIncidents = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return incidents;
    }

    return incidents.filter((incident) =>
      [incident.type, incident.title, incident.detail].join(" ").toLowerCase().includes(normalized),
    );
  }, [incidents, query]);

  return (
    <div>
      <PageHeader
        title="Alertas e Incidencias"
        description="Seguimiento de problemas operativos, documentación y demoras."
        actions={<Button onClick={() => setOpen(true)}>Nueva incidencia</Button>}
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Abiertas" value={String(incidents.filter((incident) => incident.type !== "Resuelta").length)} icon={<AlertTriangle size={18} />} tone="red" />
        <StatCard title="Críticas" value={String(incidents.filter((incident) => incident.type === "Crítica").length)} icon={<FileWarning size={18} />} tone="red" />
        <StatCard title="Resueltas hoy" value={String(incidents.filter((incident) => incident.type === "Resuelta").length)} icon={<CheckCircle2 size={18} />} tone="green" />
        <StatCard title="Pendientes revisión" value={String(incidents.filter((incident) => incident.type === "Alta" || incident.type === "Media").length)} icon={<Clock3 size={18} />} tone="amber" />
      </section>

      <section className="mb-6">
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar incidencia, chofer, patente o cliente..." />
      </section>

      <section className="space-y-4">
        {filteredIncidents.map((incident) => (
          <AlertCard key={incident.id} incident={incident} />
        ))}
      </section>

      {open ? <NewIncidentModal data={data} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function AlertCard({ incident }: { incident: Incident }) {
  const icon =
    incident.title.toLowerCase().includes("unidad") || incident.title.toLowerCase().includes("vtv") ? (
      <Truck size={18} />
    ) : incident.title.toLowerCase().includes("licencia") ? (
      <User size={18} />
    ) : incident.type === "Resuelta" ? (
      <CheckCircle2 size={18} />
    ) : (
      <AlertTriangle size={18} />
    );

  return (
    <Card className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${incident.tone === "red" ? "border-red-200 bg-red-100 text-red-700" : incident.tone === "amber" ? "border-amber-200 bg-amber-100 text-amber-700" : incident.tone === "green" ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-blue-200 bg-blue-100 text-blue-700"}`}>
          {icon}
        </div>
        <div>
          <h2 className="font-semibold text-slate-950">{incident.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{incident.detail}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Badge tone={incident.tone}>{incident.type}</Badge>
        <Link href={`/alertas/${incident.id}`} className="inline-flex min-h-8 items-center rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Ver
        </Link>
      </div>
    </Card>
  );
}

function NewIncidentModal({ data, onClose }: { data: LiveData; onClose: () => void }) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = addDemoIncident(data, new FormData(event.currentTarget));
    saveDemoLiveData(result.data, result.label);
    onClose();
  };

  return (
    <ModalFrame
      title="Nueva incidencia"
      description="Registrá una alerta operativa y vinculala a un viaje, chofer, unidad o cliente."
      onClose={onClose}
      size="md"
      footer={<ModalActions onCancel={onClose} confirmLabel="Crear incidencia" submit formId="new-incident-form" />}
    >
      <form id="new-incident-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField name="priority" label="Prioridad" options={["Crítica", "Alta", "Media"]} required />
          <SelectField name="type" label="Tipo" options={["Documentación", "Demora", "Unidad", "Chofer", "Cliente"]} required />
        </div>
        <Field name="title" label="Título" placeholder="Ej: VTV vencida en unidad..." required />
        <SelectField name="owner" label="Asociar a" options={["VJ-000124", "Juan Pérez", "AB123CD", "Easy", "Operación general"]} />
        <TextArea name="detail" label="Detalle" placeholder="Qué pasó, qué impacto tiene y qué hay que resolver." required />
      </form>
    </ModalFrame>
  );
}
