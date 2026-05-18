import { BarChart3, CreditCard, Database, ShieldCheck, Smartphone, Users } from "lucide-react";
import { Badge, Card, LinkButton, PageHeader } from "@/components/ui";

const plans = [
  {
    name: "Base",
    price: "Para arrancar",
    tone: "blue" as const,
    features: ["Hasta 5 usuarios", "10 choferes", "20 unidades", "Viajes y documentos", "Portal chofer"],
  },
  {
    name: "Profesional",
    price: "Operacion diaria",
    tone: "green" as const,
    features: ["Usuarios por rol", "Choferes y unidades ampliados", "Caja y rendiciones", "Alertas operativas", "Exportaciones"],
  },
  {
    name: "Enterprise",
    price: "Multi-sucursal",
    tone: "purple" as const,
    features: ["Tenants avanzados", "Auditoria completa", "Integraciones", "SLA y soporte", "Reportes ejecutivos"],
  },
];

export default function PlanesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="SaaS"
        title="Planes y monetizacion"
        description="Estructura visual para pensar limites por plan, facturacion y crecimiento multiempresa."
        actions={
          <>
            <LinkButton href="/onboarding">Onboarding</LinkButton>
            <LinkButton href="/estado-v1" tone="dark">Checklist V1</LinkButton>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="p-6">
            <Badge tone={plan.tone}>{plan.name}</Badge>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{plan.price}</h2>
            <div className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex gap-3 text-sm text-slate-600">
                  <span className="mt-1 h-2 w-2 rounded-full bg-slate-300" />
                  {feature}
                </div>
              ))}
            </div>
            <LinkButton href="/registro" tone={plan.name === "Profesional" ? "dark" : "light"} className="mt-6 w-full">
              Simular contratacion
            </LinkButton>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <SectionTitle icon={<CreditCard size={20} />} title="Billing futuro" />
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Item icon={<Users size={18} />} title="Usuarios" text="Limite por usuario activo, rol y sucursal." />
            <Item icon={<Smartphone size={18} />} title="Choferes" text="Limite por chofer habilitado y dispositivo activo." />
            <Item icon={<Database size={18} />} title="Storage" text="Documentos, remitos, fotos y comprobantes por tenant." />
            <Item icon={<BarChart3 size={18} />} title="Reportes" text="KPIs avanzados y exportaciones segun plan." />
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle icon={<ShieldCheck size={20} />} title="Reglas SaaS" />
          <p className="mt-5 text-sm leading-6 text-slate-500">
            Cada tenant debe tener sus planes, usuarios, limites, estado de pago, feature flags y auditoria propia. Nada de viajes,
            documentos, caja o choferes puede consultarse sin tenantId y permisos server-side.
          </p>
        </Card>
      </section>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-500">{icon}</span>
      <h2 className="font-semibold text-slate-950">{title}</h2>
    </div>
  );
}

function Item({ icon, text, title }: { icon: React.ReactNode; text: string; title: string }) {
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
