import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const studentCount = await prisma.student.count();
    const classCount = await prisma.class.count();
    const staffCount = await prisma.staff.count();

    if (studentCount === 0) {
      await prisma.student.createMany({
        data: [
          {
            firstName: "Johnny",
            lastName: "Smith",
            phone: "5551112222",
            beltRank: "Yellow",
            status: "active",
          },
          {
            firstName: "Sally",
            lastName: "Jones",
            phone: "5553334444",
            beltRank: "White",
            status: "active",
          },
        ],
      });
    }

    if (classCount === 0) {
      await prisma.class.createMany({
        data: [
          {
            className: "Kids TKD 5:00 PM",
            program: "Taekwondo",
            ageGroup: "Kids",
            instructorName: "Mr. Lusk",
            dayOfWeek: "Monday",
            startTime: "17:00",
            endTime: "17:45",
            isActive: true,
          },
          {
            className: "Adults TKD 6:00 PM",
            program: "Taekwondo",
            ageGroup: "Adults",
            instructorName: "Mr. Lusk",
            dayOfWeek: "Monday",
            startTime: "18:00",
            endTime: "18:50",
            isActive: true,
          },
        ],
      });
    }

    if (staffCount === 0) {
      await prisma.staff.createMany({
        data: [
          {
            firstName: "Matthew",
            lastName: "Lusk",
            email: "matt@example.com",
            role: "Owner",
            pinCode: "1234",
            isActive: true,
          },
          {
            firstName: "Front",
            lastName: "Desk",
            email: "desk@example.com",
            role: "Staff",
            pinCode: "5678",
            isActive: true,
          },
        ],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SEED ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}