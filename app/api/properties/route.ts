import { NextResponse } from "next/server";
import { getAllPublishedProperties } from "@/lib/queries/properties";

export async function GET() {
  try {
    const properties = await getAllPublishedProperties();
    return NextResponse.json(properties);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar imóveis" },
      { status: 500 }
    );
  }
}
