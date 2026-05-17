"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Building2, CheckCircle2, Clock, FileText } from "lucide-react";
import { Field, ModalActions, ModalFrame, SearchBox, SelectField, TextArea } from "@/components/controls";
import { Badge, Button, Card, PageHeader, StatCard } from "@/components/ui";
import { createClientAction } from "@/app/actions";
import { useLiveData } from "@/components/use-live-data";
import type { Client } from "@/lib/data";

export default function ClientesPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { clients } = useLiveData();

  const normalized = query.trim().toLowerCase();
  const filteredClients = normalized
    ? clients.filter((client) =>
        [client.code, client.name, client.contact, client.status, client.tags.join(" "), client.requirements.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
    : clients;

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gestión de clientes, requisitos documentales, turnos y condiciones operativas."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Building2 size={18} />
            Nuevo cliente
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Clientes activos" value={String(clients.length)} icon={<Building2 size={18} />} />
        <StatCard title="Requieren turno" value={String(clients.filter((client) => client.requiresTurn).length)} icon={<Clock size={18} />} tone="amber" />
        <StatCard title="Documentación previa" value={String(clients.filter((client) => client.requirements.length >= 4).length)} icon={<FileText size={18} />} />
        <StatCard title="Viajes este mes" value={String(clients.reduce((sum, client) => sum + client.tripsThisMonth, 0))} icon={<CheckCircle2 size={18} />} tone="green" />
      </section>

      <section className="mb-6">
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar cliente, requisito, turno o condición operativa..." />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {filteredClients.map((client) => (
          <ClientCard key={client.slug} client={client} />
        ))}
      </section>

      {open ? <NewClientModal onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function NewClientModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalFrame
      title="Nuevo cliente"
      description="Cargá la ficha operativa con requisitos y condiciones antes del primer viaje."
      onClose={onClose}
      size="lg"
      footer={<ModalActions onCancel={onClose} confirmLabel="Guardar cliente" submit formId="new-client-form" />}
    >
      <form id="new-client-form" action={createClientAction} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field name="name" label="Razón social / nombre" placeholder="Ej: Cliente SA" required />
          <Field name="code" label="Código de cliente" placeholder="Ej: CLI-0006 o 6" />
          <Field name="contact" label="Contacto operativo" placeholder="Ej: Logística Regional" required />
          <Field name="phone" label="Teléfono" placeholder="Ej: 11 5555-0000" required />
          <Field name="reception" label="Horario de recepción" placeholder="Ej: 08:00 a 16:00" required />
          <SelectField name="requiresTurn" label="Requiere turno" options={["Sí", "No"]} required />
          <SelectField name="documentation" label="Documentación previa" options={["Básica", "Completa", "Personalizada"]} required />
        </div>
        <TextArea name="notes" label="Condiciones operativas" placeholder="Turnos, ingresos, restricciones, documentación y contactos de descarga." />
      </form>
    </ModalFrame>
  );
}

function ClientCard({ client }: { client: Client }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200">
            <Building2 size={22} className="text-slate-700" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-950">{client.name}</h2>
            <p className="text-sm text-slate-500">{client.code} · {client.contact}</p>
            <p className="mt-1 text-sm text-slate-500">{client.tripsThisMonth} viajes este mes</p>
          </div>
        </div>

        <Badge tone={client.requiresTurn ? "amber" : "green"}>{client.status}</Badge>
      </div>

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-700" />
          <p className="text-sm font-semibold text-amber-900">Condiciones operativas del cliente</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {client.tags.map((tag) => (
            <Badge key={tag} tone="amber">
              {tag.toLowerCase().includes("turno") || tag.toLowerCase().includes("horario") ? <Clock size={14} /> : <AlertTriangle size={14} />}
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileText size={18} className="text-slate-600" />
          <p className="text-sm font-semibold text-slate-950">Requisitos documentales</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {client.requirements.map((item) => (
            <Badge key={item} tone="slate">
              <CheckCircle2 size={14} className="text-emerald-500" />
              {item}
            </Badge>
          ))}
        </div>
      </div>

      <Link href={`/clientes/${client.slug}`} className="mt-6 flex w-full justify-center rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
        Ver cliente
      </Link>
    </Card>
  );
}
