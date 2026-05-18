import Image from "next/image";
import {
  Bell,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  LockKeyhole,
  Palette,
  Plus,
  Shield,
  SlidersHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import {
  createConfigOptionAction,
  createOperationalRuleAction,
  createSystemUserAction,
  toggleConfigOptionAction,
  updateCompanySettingsAction,
  updateRolePermissionsAction,
} from "@/app/actions";
import { BrandingDemo } from "@/components/configuracion/BrandingDemo";
import { Badge, Button, Card, DataTable, LinkButton, PageHeader, Panel, StatCard } from "@/components/ui";
import { configKindLabels, configKinds, getConfigurationData } from "@/lib/configuration";
import type { Tone } from "@/lib/data";

const fieldClass = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100";
const compactFieldClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

export default async function ConfiguracionPage() {
  const data = await getConfigurationData();
  const company = data.company;
  const activeOptions = data.options.filter((option) => option.active).length;
  const doubleValidation = data.options.filter((option) => option.requiresDoubleValidation).length + data.rules.filter((rule) => rule.doubleValidation).length;
  const adminRole = data.roles.find((role) => role.slug === "administrador");
  const brand = {
    name: company?.name ?? "Transporte Nexo",
    legalName: company?.legalName ?? "Transporte Nexo SRL",
    branchName: company?.branchName ?? "Parana",
    logoUrl: company?.logoUrl ?? undefined,
    primaryColor: company?.primaryColor ?? "#0f172a",
    accentColor: company?.accentColor ?? "#2563eb",
    backgroundColor: company?.backgroundColor ?? "#f1f5f9",
  };

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Personalización de empresa, roles, permisos, reglas operativas y listas maestras para una logística multiempresa."
        actions={
          <>
            <LinkButton href="/importar">
              <Database size={18} />
              Importar datos
            </LinkButton>
            <LinkButton href="/chofer" tone="dark">
              App chofer
            </LinkButton>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard title="Empresa" value={company?.name ?? "Transporte Nexo"} icon={<Building2 size={18} />} />
        <StatCard title="Opciones activas" value={String(activeOptions)} icon={<SlidersHorizontal size={18} />} tone="green" />
        <StatCard title="Doble validación" value={String(doubleValidation)} icon={<Shield size={18} />} tone="amber" />
        <StatCard title="Usuarios" value={String(data.users.length)} icon={<Users size={18} />} tone="blue" />
      </section>

      <BrandingDemo initialBrand={brand} />

      <section id="empresa" className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Empresa y branding">
          <form action={updateCompanySettingsAction} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field name="name" label="Nombre comercial" defaultValue={company?.name} required />
              <Field name="legalName" label="Razón social" defaultValue={company?.legalName} required />
              <Field name="taxId" label="CUIT / Identificación fiscal" defaultValue={company?.taxId} />
              <Field name="branchName" label="Sucursal principal" defaultValue={company?.branchName} required />
              <Field name="phone" label="Teléfono" defaultValue={company?.phone} />
              <Field name="email" label="Email operativo" type="email" defaultValue={company?.email} />
              <Field name="address" label="Dirección" defaultValue={company?.address} />
              <Field name="website" label="Web" defaultValue={company?.website} />
              <Field name="country" label="País" defaultValue={company?.country} required />
              <Field name="currency" label="Moneda" defaultValue={company?.currency} required />
              <Field name="timezone" label="Zona horaria" defaultValue={company?.timezone} required />
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">Logo</span>
                <input name="logo" type="file" accept="image/*" className={fieldClass} />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ColorField name="primaryColor" label="Color principal" defaultValue={company?.primaryColor ?? "#0f172a"} />
              <ColorField name="accentColor" label="Color acento" defaultValue={company?.accentColor ?? "#2563eb"} />
              <ColorField name="backgroundColor" label="Fondo sistema" defaultValue={company?.backgroundColor ?? "#f1f5f9"} />
            </div>

            <Button type="submit">
              <Palette size={18} />
              Guardar identidad
            </Button>
          </form>
        </Panel>

        <Panel title="Vista de marca">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                {company?.logoUrl ? (
                  <Image src={company.logoUrl} alt={company.name} fill sizes="64px" className="object-contain p-2" />
                ) : (
                  <Building2 size={28} className="text-slate-500" />
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-950">{company?.name}</p>
                <p className="text-sm text-slate-500">{company?.legalName}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Swatch label="Principal" color={company?.primaryColor ?? "#0f172a"} />
              <Swatch label="Acento" color={company?.accentColor ?? "#2563eb"} />
              <Swatch label="Fondo" color={company?.backgroundColor ?? "#f1f5f9"} />
            </div>
          </div>
          <InfoLine icon={<CheckCircle2 size={18} />}>Preparado para multiempresa, sucursales y personalización visual.</InfoLine>
          <InfoLine icon={<Shield size={18} />}>Las acciones sensibles quedan registradas en auditoría.</InfoLine>
        </Panel>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <OptionManager
          kind={configKinds.documentTypes}
          icon={<FileText size={18} />}
          options={data.optionsByKind[configKinds.documentTypes] ?? []}
        />
        <OptionManager
          kind={configKinds.expenseCategories}
          icon={<Wallet size={18} />}
          options={data.optionsByKind[configKinds.expenseCategories] ?? []}
        />
        <OptionManager
          kind={configKinds.tripStatuses}
          icon={<SlidersHorizontal size={18} />}
          options={data.optionsByKind[configKinds.tripStatuses] ?? []}
        />
        <OptionManager
          kind={configKinds.driverCategories}
          icon={<Users size={18} />}
          options={data.optionsByKind[configKinds.driverCategories] ?? []}
        />
        <OptionManager
          kind={configKinds.alertTypes}
          icon={<Bell size={18} />}
          options={data.optionsByKind[configKinds.alertTypes] ?? []}
        />
      </section>

      <section id="validaciones" className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Panel title="Alertas y validaciones operativas">
          <DataTable
            data={data.rules}
            getKey={(rule) => rule.id}
            columns={[
              { header: "Regla", cell: (rule) => <RuleName rule={rule} /> },
              { header: "Aplica a", cell: (rule) => rule.appliesTo },
              { header: "Severidad", cell: (rule) => <Badge tone={severityTone(rule.severity)}>{rule.severity}</Badge> },
              { header: "Validación", cell: (rule) => rule.doubleValidation ? <Badge tone="amber">Doble</Badge> : <Badge>Simple</Badge> },
              { header: "Estado", cell: (rule) => <Badge tone={rule.enabled ? "green" : "slate"}>{rule.enabled ? "Activa" : "Inactiva"}</Badge> },
            ]}
          />
        </Panel>

        <Panel title="Nueva regla">
          <form action={createOperationalRuleAction} className="space-y-4">
            <Field name="code" label="Código" placeholder="RULE-CARGA-001" />
            <Field name="name" label="Nombre" placeholder="Confirmar carga completa" required />
            <Field name="appliesTo" label="Módulo" placeholder="Viajes / Documentos / Caja" defaultValue="Viajes" required />
            <Field name="trigger" label="Disparador" placeholder="Estado, alerta o vencimiento" required />
            <Field name="action" label="Acción" placeholder="Bloquear, avisar o solicitar confirmación" required />
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Severidad</span>
              <select name="severity" defaultValue="Media" className={fieldClass}>
                <option>Critica</option>
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Descripción</span>
              <textarea name="description" required className="min-h-24 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Check name="enabled" label="Activa" defaultChecked />
              <Check name="doubleValidation" label="Doble validación" />
              <Check name="requiresAdmin" label="Autoriza admin" />
            </div>
            <Button type="submit">
              <Plus size={18} />
              Guardar regla
            </Button>
          </form>
        </Panel>
      </section>

      <section id="usuarios" className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Panel title="Usuarios">
          <DataTable
            data={data.users}
            getKey={(user) => user.id}
            columns={[
              { header: "Usuario", cell: (user) => <UserName user={user} /> },
              { header: "Rol", cell: (user) => <Badge tone={roleTone(user.roleRef?.slug ?? user.role)}>{user.roleRef?.name ?? user.role}</Badge> },
              { header: "Sucursal", cell: (user) => user.branch },
              { header: "Estado", cell: (user) => <Badge tone={user.status === "Activo" ? "green" : "slate"}>{user.status}</Badge> },
            ]}
          />
        </Panel>

        <Panel title="Nuevo usuario">
          <form action={createSystemUserAction} className="space-y-4">
            <Field name="name" label="Nombre" required />
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Teléfono" />
            <Field name="branch" label="Sucursal" defaultValue={company?.branchName ?? "Parana"} required />
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Rol</span>
              <select name="roleId" defaultValue={adminRole?.id} className={fieldClass}>
                {data.roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Estado</span>
              <select name="status" defaultValue="Activo" className={fieldClass}>
                <option>Activo</option>
                <option>Suspendido</option>
              </select>
            </label>
            <Field name="password" label="Contraseña inicial" placeholder="Por defecto: nexo1234" />
            <Button type="submit">
              <Users size={18} />
              Guardar usuario
            </Button>
          </form>
        </Panel>
      </section>

      <section id="roles" className="mb-6">
        <Panel title="Roles y permisos">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {data.roles.map((role) => {
              const assigned = new Set(role.permissions.map((item) => item.permission.key));

              return (
                <form key={role.id} action={updateRolePermissionsAction} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <input type="hidden" name="roleId" value={role.id} />
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">{role.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{role.description}</p>
                    </div>
                    <Badge tone={roleTone(role.slug)}>Nivel {role.level}</Badge>
                  </div>
                  <div className="max-h-[520px] space-y-4 overflow-y-auto pr-1">
                    {Object.entries(data.permissionsByModule).map(([module, permissions]) => (
                      <div key={`${role.id}-${module}`}>
                        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{module}</p>
                        <div className="space-y-2">
                          {permissions.map((permission) => (
                            <label key={`${role.id}-${permission.key}`} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                              <input name="permissionKey" type="checkbox" value={permission.key} defaultChecked={assigned.has(permission.key)} className="mt-1 h-4 w-4" />
                              <span>
                                <span className="font-medium text-slate-900">{permission.action}</span>
                                <span className="mt-0.5 block text-xs text-slate-500">{permission.description}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button type="submit" className="mt-5 w-full">
                    <LockKeyhole size={18} />
                    Guardar permisos
                  </Button>
                </form>
              );
            })}
          </div>
        </Panel>
      </section>

      <section id="auditoria" className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Auditoría reciente">
          <DataTable
            data={data.auditLogs}
            getKey={(log) => log.id}
            columns={[
              { header: "Acción", cell: (log) => <span className="font-medium text-slate-950">{log.action}</span> },
              { header: "Entidad", cell: (log) => `${log.entity} · ${log.entityId}` },
              { header: "Detalle", cell: (log) => log.detail },
              { header: "Fecha", cell: (log) => log.createdAt.toLocaleString("es-AR") },
            ]}
          />
        </Panel>

        <Card className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <Shield size={22} />
          </div>
          <h2 className="font-semibold text-slate-950">Arquitectura preparada</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>Roles diferenciados para administrador, administrativo y chofer.</p>
            <p>Listas maestras persistidas para documentos, gastos, estados, choferes y alertas.</p>
            <p>Reglas con doble validación para flujos como “Llevar a atracar”.</p>
            <p>Auditoría pensada para trazabilidad, estadísticas y crecimiento multiempresa.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}

function Field({
  defaultValue,
  label,
  name,
  placeholder,
  required = false,
  type = "text",
}: {
  defaultValue?: string | null;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-600">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue ?? ""} className={fieldClass} />
    </label>
  );
}

function ColorField({ defaultValue, label, name }: { defaultValue: string; label: string; name: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <input name={name} type="color" defaultValue={defaultValue} className="h-9 w-12 rounded border-0 bg-transparent p-0" />
        <input defaultValue={defaultValue} readOnly className="min-w-0 flex-1 text-sm outline-none" />
      </div>
    </label>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div>
      <div className="h-10 rounded-lg border border-slate-200" style={{ backgroundColor: color }} />
      <p className="mt-2 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function InfoLine({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <span className="text-slate-500">{icon}</span>
      {children}
    </div>
  );
}

function Check({ defaultChecked = false, label, name }: { defaultChecked?: boolean; label: string; name: string }) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4" />
      {label}
    </label>
  );
}

function OptionManager({
  icon,
  kind,
  options,
}: {
  icon: React.ReactNode;
  kind: string;
  options: Array<{
    id: string;
    label: string;
    value: string;
    description: string;
    color: string;
    sortOrder: number;
    active: boolean;
    requiresDoubleValidation: boolean;
    blocksOperation: boolean;
  }>;
}) {
  return (
    <Panel
      title={configKindLabels[kind] ?? kind}
      action={<span className="text-slate-500">{icon}</span>}
      className="scroll-mt-24"
    >
      <div id={kind} />
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={safeTone(option.color)}>{option.label}</Badge>
                  {option.requiresDoubleValidation ? <Badge tone="amber">Doble validación</Badge> : null}
                  {option.blocksOperation ? <Badge tone="red">Bloquea</Badge> : null}
                </div>
                <p className="mt-2 text-sm text-slate-500">{option.description || option.value}</p>
              </div>
              <form action={toggleConfigOptionAction}>
                <input type="hidden" name="id" value={option.id} />
                <input type="hidden" name="kind" value={kind} />
                <input type="hidden" name="active" value={option.active ? "false" : "true"} />
                <Button type="submit" tone="light" className="min-h-9 px-3 py-1 text-xs">
                  {option.active ? "Desactivar" : "Activar"}
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <form action={createConfigOptionAction} className="rounded-lg border border-slate-200 bg-white p-4">
        <input type="hidden" name="kind" value={kind} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input name="label" required placeholder="Nombre" className={compactFieldClass} />
          <input name="value" placeholder="Código interno opcional" className={compactFieldClass} />
          <select name="color" defaultValue="slate" className={compactFieldClass}>
            <option value="slate">Gris</option>
            <option value="blue">Azul</option>
            <option value="green">Verde</option>
            <option value="amber">Amarillo</option>
            <option value="red">Rojo</option>
            <option value="purple">Violeta</option>
          </select>
          <input name="sortOrder" type="number" placeholder="Orden" defaultValue={options.length + 1} className={compactFieldClass} />
        </div>
        <textarea name="description" placeholder="Descripción operativa" className="mt-3 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Check name="requiresDoubleValidation" label="Requiere doble validación" />
          <Check name="blocksOperation" label="Bloquea operación" />
        </div>
        <Button type="submit" className="mt-3">
          <Plus size={18} />
          Agregar
        </Button>
      </form>
    </Panel>
  );
}

function RuleName({ rule }: { rule: { name: string; code: string; description: string; requiresAdmin: boolean } }) {
  return (
    <div>
      <p className="font-medium text-slate-950">{rule.name}</p>
      <p className="mt-1 text-xs text-slate-500">{rule.code}</p>
      <p className="mt-1 text-xs text-slate-500">{rule.description}</p>
      {rule.requiresAdmin ? <Badge tone="red" className="mt-2">Autoriza admin</Badge> : null}
    </div>
  );
}

function UserName({ user }: { user: { name: string; email: string; phone: string } }) {
  return (
    <div>
      <p className="font-medium text-slate-950">{user.name}</p>
      <p className="text-xs text-slate-500">{user.email}</p>
      {user.phone ? <p className="text-xs text-slate-500">{user.phone}</p> : null}
    </div>
  );
}

function safeTone(value: string): Tone {
  return ["slate", "blue", "green", "amber", "red", "purple"].includes(value) ? value as Tone : "slate";
}

function severityTone(value: string): Tone {
  if (["Critica", "Crítica", "Alta"].includes(value)) return "red";
  if (value === "Media") return "amber";
  return "blue";
}

function roleTone(value: string): Tone {
  if (value.toLowerCase().includes("admin")) return "red";
  if (value.toLowerCase().includes("chofer")) return "green";
  return "blue";
}
