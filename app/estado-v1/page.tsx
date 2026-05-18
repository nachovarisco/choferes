import {
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle2,
  CircleDashed,
  Cloud,
  CreditCard,
  Database,
  FileSpreadsheet,
  FileText,
  ListChecks,
  LockKeyhole,
  Route,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Badge, Card, LinkButton, PageHeader, StatCard } from "@/components/ui";
import type { Tone } from "@/lib/data";

const ready = [
  "Dashboard operativo visual con KPIs principales.",
  "Viajes, detalles, paradas, clientes del viaje y rendicion.",
  "Clientes con codigo, ficha e historial.",
  "Choferes, unidades, documentos, caja, mantenimiento y alertas con UI base.",
  "Portal Chofer mobile-first mockeado en /chofer y /app-chofer.",
  "Configuracion visual y estructura de empresa, roles, permisos y listas maestras.",
  "Onboarding, registro, planes, notificaciones y demo operativa agregados como rutas visuales.",
  "Store demo local compartido para clientes, choferes, unidades, viajes, documentos, caja e incidencias.",
  "Rutas puente de login, invitacion, usuarios, sucursales, auditoria, suscripcion y dispositivos.",
  "Backend local SQLite/Prisma con tenantId, sesion mock, auditoria basica y datos SaaS por empresa.",
  "Importacion Excel/CSV preparada en pantalla.",
];

const simulated = [
  "Portal Chofer usa datos mock y estado local.",
  "Onboarding SaaS, invitaciones y codigo de empresa estan disenados en frontend; falta backend.",
  "Pagos, planes y limites de plan son conceptuales.",
  "Notificaciones push estan disenadas, no conectadas a FCM/APNs/Web Push.",
  "Exportacion a Excel esta parcialmente preparada; falta flujo visual final y XLSX.",
  "Permisos filtran menu con usuario actual, pero falta login/sesion real.",
  "Branding demo usa localStorage para probar marca sin storage externo.",
  "Login mock usa cookies server-side; falta autenticacion real con credenciales.",
];

const incomplete = [
  "Auth real por rol y tenant.",
  "Aislamiento multiempresa avanzado con RLS/politicas server-side.",
  "Onboarding guiado con persistencia completa de empresa y chofer.",
  "Flujo de invitacion con expiracion, aceptacion y validacion por celular.",
  "Validacion avanzada de formularios con errores por campo.",
  "Push notifications reales y permisos de dispositivo.",
  "Auditoria completa de acciones criticas.",
  "Planes, billing y feature flags por plan.",
];

const missingRoutes = [
  "/api/auth/*",
  "/api/storage/*",
  "/api/billing/*",
  "/api/notifications/*",
];

const buttonAudit = [
  "Acciones rapidas del Portal Chofer cambian estado local y registran incidencias/documentos demo.",
  "Botones de alta guardan en snapshot local; falta loading server-side y validacion avanzada por campo.",
  "Exportar datos necesita XLSX real o Google Sheets cuando se decida proveedor.",
  "Subida de documentos debe pasar a storage con vista previa, tipo de archivo, vencimiento y asociacion.",
  "Confirmaciones criticas deben exigir doble validacion y auditoria antes de avanzar estados.",
];

const entities = [
  "Tenant/Empresa",
  "Sucursal",
  "Usuario",
  "Rol",
  "Permiso",
  "Invitacion",
  "Plan/Suscripcion",
  "Chofer",
  "Unidad",
  "Cliente",
  "Viaje",
  "Parada",
  "Orden de carga",
  "Documento/Archivo",
  "Incidencia",
  "Movimiento de caja",
  "Notificacion",
  "Dispositivo",
  "Auditoria",
];

const v1Flows = [
  { label: "Crear empresa/logistica", status: "Mock visual", tone: "blue" as Tone },
  { label: "Personalizar logo, nombre y colores", status: "Preview local", tone: "green" as Tone },
  { label: "Crear usuarios y roles", status: "SQLite local", tone: "green" as Tone },
  { label: "Crear chofer/unidad/cliente", status: "Demo local", tone: "green" as Tone },
  { label: "Crear viaje y paradas", status: "Demo local", tone: "green" as Tone },
  { label: "Asignar chofer y unidad", status: "Demo local", tone: "green" as Tone },
  { label: "Simular vista chofer", status: "Demo local", tone: "green" as Tone },
  { label: "Cambiar estados", status: "Demo local", tone: "green" as Tone },
  { label: "Registrar incidencia", status: "Demo local", tone: "green" as Tone },
  { label: "Subir documento visualmente", status: "Demo local", tone: "green" as Tone },
  { label: "Caja/rendicion visual", status: "Demo local", tone: "green" as Tone },
  { label: "Exportar datos", status: "Preparado CSV", tone: "blue" as Tone },
  { label: "Estadisticas con mock/local", status: "Demo local", tone: "green" as Tone },
];

const roadmap = [
  {
    title: "Fase 1 - Demo frontend completa",
    text: "Completada: snapshot local compartido, onboarding visual, portal chofer, altas demo, checklist y navegacion cerrada.",
  },
  {
    title: "Fase 2 - Backend simple testeable",
    text: "Completada: SQLite/Prisma con tenantId, sesion mock por cookie, seed/backfill realista, auditoria basica y pantallas SaaS reales.",
  },
  {
    title: "Fase 3 - SaaS real",
    text: "Supabase/PostgreSQL, storage, auth, invitaciones, planes, permisos server-side y notificaciones.",
  },
  {
    title: "Fase 4 - Operacion premium",
    text: "PWA/app, push confiable, geolocalizacion, offline, metricas avanzadas y facturacion.",
  },
];

export default function EstadoV1Page() {
  return (
    <div>
      <PageHeader
        eyebrow="Producto"
        title="Estado del sistema / Checklist V1"
        description="Mapa tecnico y funcional para llevar la plataforma a una version operativa, testeable y lista para conectar backend real."
        actions={
          <>
            <LinkButton href="/chofer">
              <Smartphone size={18} />
              Probar chofer
            </LinkButton>
            <LinkButton href="/demo-operativa">
              Demo operativa
            </LinkButton>
            <LinkButton href="/configuracion" tone="dark">
              Configuracion
            </LinkButton>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard title="Visual listo" value={String(ready.length)} icon={<CheckCircle2 size={18} />} tone="green" />
        <StatCard title="Simulado" value={String(simulated.length)} icon={<CircleDashed size={18} />} tone="blue" />
        <StatCard title="Faltante clave" value={String(incomplete.length)} icon={<AlertTriangle size={18} />} tone="amber" />
        <StatCard title="Entidades reales" value={String(entities.length)} icon={<Database size={18} />} tone="purple" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChecklistCard title="Visualmente listo" icon={<CheckCircle2 size={20} />} items={ready} tone="green" />
        <ChecklistCard title="Solo simulado" icon={<CircleDashed size={20} />} items={simulated} tone="blue" />
        <ChecklistCard title="Incompleto o roto para operacion real" icon={<AlertTriangle size={20} />} items={incomplete} tone="amber" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-6">
          <SectionTitle icon={<Route size={20} />} title="Flujos que debe permitir la V1 testeable" />
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {v1Flows.map((flow) => (
              <div key={flow.label} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="text-sm font-medium text-slate-800">{flow.label}</span>
                <Badge tone={flow.tone}>{flow.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle icon={<FileText size={20} />} title="Rutas que faltan o conviene agregar" />
          <div className="mt-5 flex flex-wrap gap-2">
            {missingRoutes.map((route) => (
              <Badge key={route} tone="slate">{route}</Badge>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Ya quedaron agregadas las rutas visuales principales. Lo que falta es login real, invitaciones profundas y administracion SaaS.
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="p-6">
          <SectionTitle icon={<AlertTriangle size={20} />} title="Botones y acciones a auditar antes del backend" />
          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {buttonAudit.map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1fr]">
        <Card className="p-6">
          <SectionTitle icon={<Database size={20} />} title="Datos que deben ser entidades reales" />
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {entities.map((entity) => (
              <div key={entity} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                {entity}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle icon={<Cloud size={20} />} title="Arquitectura SaaS recomendada" />
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ArchitectureItem icon={<Building2 size={18} />} title="Multiempresa" text="tenantId obligatorio en usuarios, viajes, choferes, clientes, caja, documentos y configuracion." />
            <ArchitectureItem icon={<LockKeyhole size={18} />} title="Auth" text="login por email/celular, codigo de empresa, invitacion y permisos server-side." />
            <ArchitectureItem icon={<CreditCard size={18} />} title="Monetizacion" text="planes por cantidad de usuarios, choferes, unidades, storage, notificaciones y reportes." />
            <ArchitectureItem icon={<Bell size={18} />} title="Notificaciones" text="FCM/Web Push para PWA, APNs si luego se hace app iOS nativa." />
            <ArchitectureItem icon={<FileSpreadsheet size={18} />} title="Exportaciones" text="CSV ahora, XLSX/Sheets despues, reportes por tenant y periodo." />
            <ArchitectureItem icon={<ShieldCheck size={18} />} title="Auditoria" text="trazabilidad por accion, actor, entidad, tenant, dispositivo y fecha." />
          </div>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-4">
        {roadmap.map((item, index) => (
          <Card key={item.title} className="p-6">
            <Badge tone={index === 0 ? "green" : index === 1 ? "blue" : index === 2 ? "amber" : "purple"}>Fase {index + 1}</Badge>
            <h2 className="mt-4 font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
          </Card>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <SectionTitle icon={<ListChecks size={20} />} title="Decision recomendada antes del backend definitivo" />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Decision title="PWA primero" text="Para choferes conviene empezar PWA: instalable, barata, rapida de iterar. Si iOS push se vuelve critico, evaluar app nativa despues." />
          <Decision title="Supabase/Postgres" text="Mejor equilibrio para SaaS: Postgres, auth, storage y RLS. Google Cloud SQL es robusto pero mas caro y con mas DevOps." />
          <Decision title="Mock global antes de auth" text="Un store local compartido permite probar empresa, usuarios, viaje, chofer, documentos y caja antes de bloquearse con backend." />
        </div>
      </section>
    </div>
  );
}

function ChecklistCard({
  icon,
  items,
  title,
  tone,
}: {
  icon: React.ReactNode;
  items: string[];
  title: string;
  tone: Tone;
}) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
          {icon}
        </div>
        <div>
          <h2 className="font-semibold text-slate-950">{title}</h2>
          <Badge tone={tone} className="mt-1">{items.length} items</Badge>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm leading-5 text-slate-600">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-300" />
            {item}
          </div>
        ))}
      </div>
    </Card>
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

function ArchitectureItem({ icon, text, title }: { icon: React.ReactNode; text: string; title: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 font-semibold text-slate-950">
        {icon}
        {title}
      </div>
      <p className="text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function Decision({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}
