import { Badge, DataTable, LinkButton, PageHeader, StatCard } from "@/components/ui";
import { getConfigurationData } from "@/lib/configuration";

export default async function UsuariosPage() {
  const data = await getConfigurationData();

  return (
    <div>
      <PageHeader
        eyebrow="Fase 2"
        title="Usuarios por empresa"
        description="Usuarios filtrados por tenant activo. La gestion profunda sigue en Configuracion."
        actions={<LinkButton href="/configuracion#usuarios" tone="dark">Gestionar usuarios</LinkButton>}
      />
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard title="Usuarios" value={String(data.users.length)} />
        <StatCard title="Administradores" value={String(data.users.filter((user) => user.roleRef?.slug === "administrador").length)} tone="red" />
        <StatCard title="Administrativos" value={String(data.users.filter((user) => user.roleRef?.slug === "administrativo").length)} tone="blue" />
        <StatCard title="Choferes" value={String(data.users.filter((user) => user.roleRef?.slug === "chofer").length)} tone="green" />
      </section>
      <DataTable
        data={data.users}
        getKey={(user) => user.id}
        columns={[
          { header: "Usuario", cell: (user) => <span className="font-medium text-slate-950">{user.name}</span> },
          { header: "Email", cell: (user) => user.email },
          { header: "Rol", cell: (user) => <Badge tone={user.roleRef?.slug === "administrador" ? "red" : user.roleRef?.slug === "chofer" ? "green" : "blue"}>{user.roleRef?.name ?? user.role}</Badge> },
          { header: "Sucursal", cell: (user) => user.branch },
          { header: "Estado", cell: (user) => <Badge tone={user.status === "Activo" ? "green" : "slate"}>{user.status}</Badge> },
        ]}
      />
    </div>
  );
}
