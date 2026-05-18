import { KeyRound, LockKeyhole, Mail, Phone, ShieldCheck, Users } from "lucide-react";
import { Card, LinkButton, PageHeader } from "@/components/ui";

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100";

export default function RegistroPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Acceso"
        title="Registro demo por empresa"
        description="Pantalla mock para validar la logica futura de tenant, invitacion, rol y validacion por celular."
        actions={
          <>
            <LinkButton href="/onboarding">Onboarding</LinkButton>
            <LinkButton href="/dashboard" tone="dark">Entrar demo</LinkButton>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1fr]">
        <Card className="p-6">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">
            <KeyRound size={22} />
          </div>
          <h2 className="text-xl font-bold text-slate-950">Alta con codigo de empresa</h2>
          <div className="mt-5 space-y-4">
            <Field label="Codigo empresa" placeholder="TNX-4421" />
            <Field label="Nombre y apellido" placeholder="Juan Perez" />
            <Field label="Email" placeholder="juan@empresa.com" type="email" />
            <Field label="Celular" placeholder="+54 9 343 000 0000" />
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Rol solicitado</span>
              <select className={fieldClass} defaultValue="Chofer">
                <option>Administrador</option>
                <option>Administrativo</option>
                <option>Chofer</option>
              </select>
            </label>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LinkButton href="/chofer" tone="dark">
              <Phone size={18} />
              Probar chofer
            </LinkButton>
            <LinkButton href="/configuracion">
              <Users size={18} />
              Configurar roles
            </LinkButton>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-slate-950">Validacion prevista</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Validation icon={<Mail size={18} />} title="Email" text="Confirma identidad administrativa y recuperacion de cuenta." />
            <Validation icon={<Phone size={18} />} title="Celular" text="Recibe PIN y queda asociado a un dispositivo principal." />
            <Validation icon={<ShieldCheck size={18} />} title="Empresa" text="El codigo decide el tenant; el admin habilita el usuario." />
            <Validation icon={<LockKeyhole size={18} />} title="Permisos" text="El rol limita datos, rutas, acciones y reportes visibles." />
          </div>
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            En backend real, la invitacion debe expirar, registrar auditoria y evitar que un usuario vea datos de otro tenant.
          </div>
        </Card>
      </section>
    </div>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-600">{label}</span>
      <input className={fieldClass} placeholder={placeholder} type={type} />
    </label>
  );
}

function Validation({ icon, text, title }: { icon: React.ReactNode; text: string; title: string }) {
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
