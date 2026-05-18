import { CheckCircle2, CircleDashed, ClipboardList, Route, Smartphone, Truck } from "lucide-react";
import { Badge, Card, LinkButton, PageHeader } from "@/components/ui";

const flow = [
  { label: "Personalizar empresa", href: "/configuracion", status: "Listo para probar" },
  { label: "Crear cliente", href: "/clientes", status: "Listo local" },
  { label: "Crear chofer", href: "/choferes", status: "Listo local" },
  { label: "Crear unidad", href: "/unidades", status: "Listo local" },
  { label: "Armar viaje", href: "/viajes", status: "Listo local" },
  { label: "Simular chofer", href: "/chofer", status: "Mock mobile" },
  { label: "Registrar documento", href: "/documentos", status: "Parcial" },
  { label: "Registrar caja", href: "/caja", status: "Parcial" },
];

export default function DemoOperativaPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Prueba"
        title="Demo operativa punta a punta"
        description="Recorrido recomendado para validar la plataforma completa antes de conectar Supabase, Firebase o Postgres."
        actions={
          <>
            <LinkButton href="/estado-v1">Checklist V1</LinkButton>
            <LinkButton href="/chofer" tone="dark">
              <Smartphone size={18} />
              Portal Chofer
            </LinkButton>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <Route size={20} className="text-slate-500" />
            <h2 className="font-semibold text-slate-950">Flujo testeable</h2>
          </div>
          <div className="space-y-3">
            {flow.map((item, index) => (
              <div key={item.label} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{index + 1}</span>
                  <div>
                    <p className="font-medium text-slate-950">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.status}</p>
                  </div>
                </div>
                <LinkButton href={item.href} className="sm:min-w-32">Abrir</LinkButton>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={22} />
          </div>
          <h2 className="font-semibold text-slate-950">Criterio de aprobado</h2>
          <div className="mt-5 space-y-3">
            <Criteria text="Se puede navegar sin callejones sin salida." done />
            <Criteria text="Los botones principales llevan a rutas reales." done />
            <Criteria text="El chofer entiende su proxima accion en celular." done />
            <Criteria text="Los datos mock alimentan estadisticas y detalles." done />
            <Criteria text="El store local comparte cambios entre modulos." done />
          </div>
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
            Fase 1 queda lista para prueba operativa. La siguiente mejora natural es reemplazar el snapshot local por base multiempresa con tenantId.
          </div>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <MiniCard icon={<ClipboardList size={20} />} title="Ordenes" text="Deben poder convertirse en viaje cuando tengan carga, cliente, chofer y unidad." />
        <MiniCard icon={<Truck size={20} />} title="Viajes" text="Deben validar documentos, disponibilidad de unidad y estados configurados." />
        <MiniCard icon={<Smartphone size={20} />} title="Chofer" text="Debe confirmar acciones, subir comprobantes y reportar incidencias." />
      </section>
    </div>
  );
}

function Criteria({ done = false, text }: { done?: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
      {done ? <CheckCircle2 size={18} className="text-emerald-600" /> : <CircleDashed size={18} className="text-slate-400" />}
      {text}
    </div>
  );
}

function MiniCard({ icon, text, title }: { icon: React.ReactNode; text: string; title: string }) {
  return (
    <Card className="p-6">
      <div className="mb-3 text-slate-500">{icon}</div>
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
      <Badge tone="blue" className="mt-4">V1</Badge>
    </Card>
  );
}
