import { getLiveData } from "@/lib/queries";

export async function GET() {
  const data = await getLiveData();

  return Response.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
