import { revalidateLocationDisplayPages } from "@/lib/cache/revalidate-location-pages";
import type { LocationRevalidationPlan } from "@/lib/cache/revalidate-location-pages";

export const runtime = "nodejs";

function isLocationPlan(value: unknown): value is LocationRevalidationPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Record<string, unknown>;
  return (
    Array.isArray(plan.citySlugs) &&
    Array.isArray(plan.neighborhoodSlugs) &&
    Array.isArray(plan.propertySlugs) &&
    Array.isArray(plan.stateSlugs)
  );
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    return Response.json(
      { error: "REVALIDATION_SECRET não configurado" },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const plan =
    body &&
    typeof body === "object" &&
    "plan" in body &&
    isLocationPlan((body as { plan: unknown }).plan)
      ? (body as { plan: LocationRevalidationPlan }).plan
      : isLocationPlan(body)
        ? body
        : null;

  if (!plan) {
    return Response.json({ error: "Plano de revalidação inválido" }, { status: 400 });
  }

  revalidateLocationDisplayPages(plan);

  return Response.json({ ok: true });
}
