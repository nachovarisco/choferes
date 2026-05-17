import { Bell, Building2, Shield, User } from "lucide-react";
import { Badge, PageHeader, Panel, StatCard } from "@/components/ui";

export default function PerfilPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Usuario"
        title="Ignacio"
        description="Perfil operativo, permisos y preferencias de notificación."
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Rol" value="Administrador" icon={<Shield size={18} />} tone="blue" />
        <StatCard title="Sucursal" value="Paraná" icon={<Building2 size={18} />} />
        <StatCard title="Alertas activas" value="3" icon={<Bell size={18} />} tone="amber" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Datos del usuario">
          <Info icon={<User size={18} />} label="Nombre" value="Ignacio" />
          <Info icon={<Shield size={18} />} label="Perfil" value="Administrador general" />
          <Info icon={<Building2 size={18} />} label="Empresa" value="Transporte Nexo SRL" />
        </Panel>

        <Panel title="Permisos">
          <Badge tone="green">Puede crear viajes</Badge>
          <Badge tone="green">Puede cargar documentos</Badge>
          <Badge tone="green">Puede administrar caja</Badge>
          <Badge tone="blue">Puede configurar usuarios</Badge>
        </Panel>

        <Panel title="Preferencias">
          <Badge tone="amber">Alertas críticas en cabecera</Badge>
          <Badge tone="blue">Resumen operativo diario</Badge>
          <Badge tone="slate">Vista compacta de tablas</Badge>
        </Panel>
      </section>
    </div>
  );
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
