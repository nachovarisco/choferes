"use client";

import { AlertTriangle } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-red-100 text-red-700">
        <AlertTriangle size={26} />
      </div>
      <h1 className="text-2xl font-bold text-slate-950">Algo no salió bien</h1>
      <p className="mt-2 text-sm text-slate-500">La pantalla no pudo cargarse. Probá reiniciar la vista.</p>
      <Button className="mt-6" onClick={reset}>
        Reintentar
      </Button>
    </Card>
  );
}
