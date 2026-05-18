import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge, Card, LinkButton, PageHeader } from "@/components/ui";

export function MockRoutePage({
  actions,
  description,
  items,
  title,
}: {
  actions?: ReactNode;
  description: string;
  items: Array<{ title: string; text: string; status?: string }>;
  title: string;
}) {
  return (
    <div>
      <PageHeader
        eyebrow="Fase 1"
        title={title}
        description={description}
        actions={actions ?? <LinkButton href="/estado-v1" tone="dark">Checklist V1</LinkButton>}
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title} className="p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
            <Badge tone="blue" className="mt-4">{item.status ?? "Mock visual"}</Badge>
          </Card>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
        Esta pantalla existe para cerrar navegacion y validar UX antes de conectar autenticacion, base real, storage o pagos.
      </section>
    </div>
  );
}
