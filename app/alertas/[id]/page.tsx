import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock3, FileWarning, Truck, User } from "lucide-react";
import { resolveIncidentAction } from "@/app/actions";
import { Badge, Button, LinkButton, PageHeader, Panel, StatCard } from "@/components/ui";
import { getLiveData } from "@/lib/queries";

export default async function AlertaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getLiveData();
  const incident = data.incidents.find((item) => item.id === id);

  if (!incident) {
    notFound();
  }

  const owner = resolveOwner(incident.title);

  return (
    <div>
      <PageHeader
        eyebrow="Alertas e incidencias"
        title={incident.title}
        description={incident.detail}
        actions={
          <>
            {owner.href ? <LinkButton href={owner.href}>Ver asociado</LinkButton> : null}
            <LinkButton href="/alertas" tone="dark">
              Volver a alertas
            </LinkButton>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Prioridad" value={incident.type} icon={<AlertTriangle size={18} />} tone={incident.tone} />
        <StatCard title="Estado" value={incident.type === "Resuelta" ? "Cerrada" : "Abierta"} icon={<CheckCircle2 size={18} />} tone={incident.type === "Resuelta" ? "green" : "amber"} />
        <StatCard title="SLA" value={incident.type === "Crítica" ? "Hoy" : "48 hs"} icon={<Clock3 size={18} />} tone={incident.type === "Crítica" ? "red" : "blue"} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Detalle operativo" className="xl:col-span-2">
          <Info icon={owner.icon} label="Asociado" value={owner.label} />
          <Info icon={<AlertTriangle size={18} />} label="Motivo" value={incident.detail} />
          <Info icon={<Clock3 size={18} />} label="Detectada" value="16/05/2026 · 09:15" />
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Revisar documentación, validar bloqueo operativo si corresponde y dejar observación interna antes de cerrar.
          </div>
        </Panel>

        <Panel title="Próximas acciones">
          <Badge tone={incident.tone}>Asignar responsable</Badge>
          <Badge tone="blue">Adjuntar comprobante</Badge>
          {incident.type !== "Resuelta" ? (
            <form action={resolveIncidentAction}>
              <input type="hidden" name="id" value={incident.id} />
              <Button type="submit" tone="light" className="w-full">
                Marcar como resuelta
              </Button>
            </form>
          ) : (
            <Badge tone="green">Incidencia cerrada</Badge>
          )}
          <Link href="/documentos" className="text-sm font-medium text-blue-600 hover:underline">
            Ver documentos relacionados
          </Link>
        </Panel>
      </section>
    </div>
  );
}

function resolveOwner(title: string) {
  const lower = title.toLowerCase();

  if (lower.includes("ae321jk")) {
    return { label: "Unidad AE321JK", href: "/unidades/ae321jk", icon: <Truck size={18} /> };
  }

  if (lower.includes("ag987no")) {
    return { label: "Unidad AG987NO", href: "/unidades/ag987no", icon: <Truck size={18} /> };
  }

  if (lower.includes("juan")) {
    return { label: "Juan Pérez", href: "/choferes/juan-perez", icon: <User size={18} /> };
  }

  if (lower.includes("easy")) {
    return { label: "Viaje Easy", href: "/viajes/vj-000124", icon: <Truck size={18} /> };
  }

  return { label: "Operación general", href: "", icon: <FileWarning size={18} /> };
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="text-slate-500">{icon}</span>
      <span>
        <span className="font-medium text-slate-800">{label}: </span>
        {value}
      </span>
    </div>
  );
}
