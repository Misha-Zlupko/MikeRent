import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const apartments = await prisma.apartment.findMany();
  const publicRows = apartments.map(
    ({ ownerPhone: _ownerPhone, ...rest }) => rest,
  );
  return NextResponse.json(publicRows);
}

