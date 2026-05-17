import { Bell, Building2, Database, FileText, Shield, SlidersHorizontal, Users } from "lucide-react";
import { Badge, Card, LinkButton, PageHeader } from "@/components/ui";

const configItems = [
  {
    icon: <Building2 size={20} />,
    slug: "empresa",
    title: "Empresa",
    text: "Datos fiscales, razón social, sucursales y branding.",
  },
  {
    icon: <Users size={20} />,
    slug: "usuarios",
    title: "Usuarios y Roles",
    text: "Administradores, tráfico, choferes y permisos.",
  },
  {
    icon: <Shield size={20} />,
    slug: "permisos",
    title: "Permisos",
    text: "Qué puede ver o editar cada perfil.",
  },
  {
    icon: <FileText size={20} />,
    slug: "documentos",
    title: "Tipos de Documentos",
    text: "Licencia, VTV, seguros, ART, AFIP y personalizados.",
  },
  {
    icon: <Bell size={20} />,
    slug: "notificaciones",
    title: "Notificaciones",
    text: "Alertas de vencimientos, incidencias y viajes.",
  },
  {
    icon: <SlidersHorizontal size={20} />,
    slug: "operacion",
    title: "Operación",
    text: "Estados de viaje, categorías de choferes y etiquetas.",
  },
  {
    icon: <Database size={20} />,
    slug: "importar",
    title: "Importar datos",
    text: "Carga masiva desde Excel o CSV para clientes, choferes, unidades y órdenes.",
    href: "/importar",
  },
];

export default function ConfiguracionPage() {
  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Ajustes generales del sistema y estructura operativa."
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {configItems.map((item) => (
          <ConfigCard key={item.title} {...item} />
        ))}
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-950">Categorías internas de choferes</h2>
        <div className="flex flex-wrap gap-3">
          <Badge tone="blue">Nexo Aberturas</Badge>
          <Badge tone="purple">Tercero</Badge>
          <Badge tone="green">Mixto</Badge>
          <Badge tone="slate">General</Badge>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-950">Estados operativos de viaje</h2>
        <div className="flex flex-wrap gap-3">
          <Badge tone="slate">Pendiente</Badge>
          <Badge tone="blue">Asignado</Badge>
          <Badge tone="amber">En carga</Badge>
          <Badge tone="green">En viaje</Badge>
          <Badge tone="red">Demorado</Badge>
          <Badge tone="slate">Finalizado</Badge>
        </div>
      </section>
    </div>
  );
}

function ConfigCard({
  icon,
  slug,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  slug: string;
  title: string;
  text: string;
  href?: string;
}) {
  return (
    <Card className="p-6" >
      <div id={slug} />
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{text}</p>
      <LinkButton href={href ?? `/configuracion#${slug}`} className="mt-5">
        Configurar
      </LinkButton>
    </Card>
  );
}
