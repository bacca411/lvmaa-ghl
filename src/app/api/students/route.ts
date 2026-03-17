import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const students = await prisma.student.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return NextResponse.json(students);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      beltRank,
      status,
      ghlContactId,
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required." },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        phone: phone || null,
        email: email || null,
        beltRank: beltRank || null,
        status: status || "active",
        ghlContactId: ghlContactId || null,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("CREATE STUDENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create student." },
      { status: 500 }
    );
  }
}