import { Building2, CheckCircle2, ClipboardList, Smartphone, Truck, Users } from "lucide-react";
import { Badge, Card, LinkButton, PageHeader } from "@/components/ui";

const adminSteps = [
  { title: "Crear empresa", text: "Nombre, sucursal, logo, colores, moneda y reglas base.", href: "/configuracion" },
  { title: "Invitar equipo", text: "Administrador, administrativos y choferes con codigo de empresa.", href: "/registro" },
  { title: "Cargar maestros", text: "Clientes, choferes, unidades, documentos y categorias.", href: "/clientes" },
  { title: "Probar viaje", text: "Crear carga, armar paradas, asignar chofer y simular estados.", href: "/viajes" },
];

const driverSteps = [
  "Ingresar codigo de empresa.",
  "Validar celular con PIN.",
  "Esperar habilitacion de la empresa.",
  "Entrar al Portal Chofer y aceptar el viaje asignado.",
];

const modules = [
  "Dashboard",
  "Viajes",
  "Ordenes",
  "Clientes",
  "Choferes",
  "Unidades",
  "Documentos",
  "Caja",
  "Mantenimiento",
  "Reportes",
];

export default function OnboardingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Primer uso"
        title="Onboarding SaaS"
        description="Flujo visual para preparar una empresa, invitar usuarios y probar la operacion antes del backend real."
        actions={
          <>
            <LinkButton href="/registro">
              <Users size={18} />
              Registro demo
            </LinkButton>
            <LinkButton href="/estado-v1" tone="dark">
              Checklist V1
            </LinkButton>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-6">
          <SectionTitle icon={<Building2 size={20} />} title="Empresa y administracion" />
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {adminSteps.map((step, index) => (
              <div key={step.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <Badge tone={index === 0 ? "green" : "blue"}>Paso {index + 1}</Badge>
                <h2 className="mt-3 font-semibold text-slate-950">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
                <LinkButton href={step.href} className="mt-4 w-full">
                  Abrir
                </LinkButton>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle icon={<Smartphone size={20} />} title="Onboarding chofer" />
          <div className="mt-5 space-y-3">
            {driverSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
          <LinkButton href="/chofer" tone="dark" className="mt-5 w-full">
            Probar Portal Chofer
          </LinkButton>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1fr]">
        <Card className="p-6">
          <SectionTitle icon={<ClipboardList size={20} />} title="Codigo de empresa" />
          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm text-blue-900">Ejemplo para pruebas</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-blue-950">TNX-4421</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            En backend real este codigo debe pertenecer a un tenant y validar invitaciones, roles, sucursal y estado de habilitacion.
          </p>
        </Card>

        <Card className="p-6">
          <SectionTitle icon={<Truck size={20} />} title="Modulos a configurar" />
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
            {modules.map((module) => (
              <div key={module} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
                {module}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 size={18} />
            La V1 debe permitir recorrer este alta sin depender de soporte tecnico.
          </div>
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
