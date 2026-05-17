import Link from "next/link";
import { SearchX } from "lucide-react";
import { Card, LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        <SearchX size={26} />
      </div>
      <h1 className="text-2xl font-bold text-slate-950">No encontramos esta pantalla</h1>
      <p className="mt-2 text-sm text-slate-500">
        Puede que el registro no exista o que la dirección haya cambiado.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <LinkButton href="/dashboard" tone="dark">
          Ir al dashboard
        </LinkButton>
        <Link href="/viajes" className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Ver viajes
        </Link>
      </div>
    </Card>
  );
}
