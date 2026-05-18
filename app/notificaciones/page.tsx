import { Bell, CheckCircle2, Clock3, FileText, Smartphone, TriangleAlert } from "lucide-react";
import { Badge, Card, LinkButton, PageHeader } from "@/components/ui";

const notifications = [
  { title: "Tenes un viaje asignado", meta: "Chofer - ahora", tone: "blue" as const },
  { title: "Dirigite a atracar", meta: "Carga - pendiente de confirmacion", tone: "amber" as const },
  { title: "Cliente requiere turno", meta: "Parada Easy Parana", tone: "amber" as const },
  { title: "Subi el remito firmado", meta: "Entrega - accion requerida", tone: "red" as const },
  { title: "Carga validada", meta: "Deposito - confirmado", tone: "green" as const },
];

const channels = [
  "Push PWA para avisos operativos.",
  "Email para administrativos y pagos.",
  "Notificacion in-app para trazabilidad.",
  "SMS/WhatsApp solo para criticidad alta o PIN.",
];

export default function NotificacionesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Operacion"
        title="Centro de notificaciones"
        description="Diseno mock para avisos mobile, permisos de dispositivo y eventos logisticos."
        actions={
          <>
            <LinkButton href="/chofer">
              <Smartphone size={18} />
              Portal Chofer
            </LinkButton>
            <LinkButton href="/alertas" tone="dark">
              Incidencias
            </LinkButton>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Bell size={20} />
              </span>
              <h2 className="font-semibold text-slate-950">Bandeja operativa</h2>
            </div>
            <Badge tone="blue">Mock</Badge>
          </div>
          <div className="space-y-3">
            {notifications.map((item) => (
              <div key={item.title} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-medium text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                </div>
                <Badge tone={item.tone}>{item.tone === "red" ? "Critica" : item.tone === "green" ? "OK" : "Aviso"}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-slate-950">Permisos mobile</h2>
          <div className="mt-5 space-y-3">
            <Step icon={<Smartphone size={18} />} title="Instalar PWA" text="El chofer debe abrir la app desde el celular y mantener sesion." />
            <Step icon={<Bell size={18} />} title="Permitir push" text="Pedir permiso en un momento con valor claro, no al primer segundo." />
            <Step icon={<Clock3 size={18} />} title="Reintentos" text="Si no hay push, mostrar pendientes dentro de la app y pedir confirmacion." />
            <Step icon={<TriangleAlert size={18} />} title="Criticos" text="Documentos vencidos, remitos faltantes y cambios de estado bloqueantes." />
          </div>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold text-slate-950">Canales</h2>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {channels.map((channel) => (
              <div key={channel} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                {channel}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-slate-950">Eventos que deben disparar avisos</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <Event icon={<FileText size={18} />} text="Viaje asignado, cambio de estado, solicitud de atracar, carga validada." />
            <Event icon={<TriangleAlert size={18} />} text="Incidencia nueva, reclamo, documento vencido, unidad bloqueada." />
            <Event icon={<Bell size={18} />} text="Recordatorio de turno, pedido de remito, comprobante pendiente." />
          </div>
        </Card>
      </section>
    </div>
  );
}

function Step({ icon, text, title }: { icon: React.ReactNode; text: string; title: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 font-semibold text-slate-950">
        <span className="text-slate-500">{icon}</span>
        {title}
      </div>
      <p className="text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function Event({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <span className="text-slate-500">{icon}</span>
      {text}
    </div>
  );
}
