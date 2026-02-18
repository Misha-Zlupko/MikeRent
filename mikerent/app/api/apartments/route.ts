import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const apartments = await prisma.apartment.findMany();
  return NextResponse.json(apartments);
}

