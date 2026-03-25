import { prisma } from "@/lib/prisma";
import { syncStudentToGhl } from "@/lib/ghl";

export async function syncStudentById(studentId: string) {
  await prisma.student.update({
    where: { id: studentId },
    data: {
      ghlSyncInProgress: true,
      ghlSyncError: null,
    },
  });

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const ghlContact = await syncStudentToGhl({
      ghlContactId: student.ghlContactId,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      email: student.email,
      studentNumber: student.studentNumber,
      program: student.program,
      status: student.status,
      beltRank: student.beltRank,
      lastAttended: student.lastAttended,
    });

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        ghlContactId: ghlContact?.id || student.ghlContactId,
        ghlLastSyncedAt: new Date(),
        ghlSyncInProgress: false,
        ghlSyncError: null,
      },
    });

    return updatedStudent;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown GHL sync error";

    await prisma.student.update({
      where: { id: studentId },
      data: {
        ghlSyncInProgress: false,
        ghlSyncError: message,
      },
    });

    throw error;
  }
}