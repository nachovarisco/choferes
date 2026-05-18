import { switchMockSessionAction } from "@/app/actions";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { getConfigurationData } from "@/lib/configuration";

export default async function LoginPage() {
  const data = await getConfigurationData();

  return (
    <div>
      <PageHeader
        eyebrow="Fase 2"
        title="Login mock por tenant"
        description="Sesion local testeable con cookie server-side. No es auth real, pero permite validar multiempresa, roles y permisos."
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1fr]">
        <Card className="p-6">
          <h2 className="font-semibold text-slate-950">Entrar al entorno</h2>
          <form action={switchMockSessionAction} className="mt-5 space-y-4">
            <input type="hidden" name="returnTo" value="/dashboard" />
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Empresa / tenant</span>
              <select name="tenantId" defaultValue={data.session.tenantId} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
                <option value={data.session.tenantId}>{data.tenant?.name ?? data.session.tenantName} - {data.tenant?.code ?? data.session.tenantCode}</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Usuario</span>
              <select name="userId" defaultValue={data.session.userId} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
                {data.users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name} - {user.roleRef?.name ?? user.role}</option>
                ))}
              </select>
            </label>
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-slate-950">Sesion activa</h2>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Info label="Tenant" value={data.session.tenantName} />
            <Info label="Codigo" value={data.session.tenantCode} />
            <Info label="Usuario" value={data.session.userName} />
            <Info label="Rol" value={data.session.role} />
          </div>
          <Badge tone="blue" className="mt-5">Cookie mock server-side</Badge>
        </Card>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <p className="mt-1 font-medium text-slate-950">{value}</p>
    </div>
  );
}
