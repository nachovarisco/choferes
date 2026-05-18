import { MockRoutePage } from "@/components/saas/MockRoutePage";
import { LinkButton } from "@/components/ui";

export default function RecuperarAccesoPage() {
  return (
    <MockRoutePage
      title="Recuperar acceso"
      description="Flujo visual para recuperar usuario con email, celular o codigo de empresa."
      actions={<LinkButton href="/login" tone="dark">Volver al login</LinkButton>}
      items={[
        { title: "Email", text: "Administrativos recuperan acceso por email validado." },
        { title: "Celular", text: "Choferes reciben PIN para entrar desde el telefono habilitado." },
        { title: "Auditoria", text: "Cada recuperacion debe quedar registrada por tenant y usuario." },
      ]}
    />
  );
}
