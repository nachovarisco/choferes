import { getLiveData } from "@/lib/queries";

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function toCsv(rows: Array<Array<string | number>>) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "operacion";
  const data = await getLiveData();

  const rows = type === "caja"
    ? [
        ["Fecha", "Tipo", "Categoría", "Viaje", "Chofer", "Unidad", "Monto", "Estado"],
        ...data.cashMovements.map((movement) => {
          const trip = data.trips.find((item) => item.slug === movement.tripSlug);
          const driver = data.drivers.find((item) => item.slug === movement.driverSlug);
          const unit = data.units.find((item) => item.id === movement.unitId);

          return [
            movement.date,
            movement.type,
            movement.category,
            trip?.id ?? movement.tripSlug,
            driver?.name ?? "Sin chofer",
            unit?.plate ?? "Sin unidad",
            movement.amount,
            movement.status,
          ];
        }),
      ]
    : [
        ["Viaje", "Fecha", "Estado", "Origen", "Destino", "Chofer", "Unidad", "Clientes", "Alerta", "Caja asignada", "Caja gastada"],
        ...data.trips.map((trip) => {
          const driver = data.drivers.find((item) => item.slug === trip.driverSlug);
          const unit = data.units.find((item) => item.id === trip.unitId);
          const clients = trip.clientSlugs
            .map((slug) => data.clients.find((client) => client.slug === slug)?.name ?? slug)
            .join(" + ");

          return [
            trip.id,
            trip.date,
            trip.status,
            trip.origin,
            trip.destination,
            driver?.name ?? "Sin chofer",
            unit?.plate ?? "Sin unidad",
            clients,
            trip.alert,
            trip.assignedCash,
            trip.spentCash,
          ];
        }),
      ];

  return new Response(`\uFEFF${toCsv(rows)}`, {
    headers: {
      "Content-Disposition": `attachment; filename="nexo-${type}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
