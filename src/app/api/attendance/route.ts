import { syncStudentToGhl } from "@/lib/ghl";

await prisma.student.update({
  where: { id: studentId },
  data: {
    lastAttended: attendance.checkInTime,
    lastAttendedClassName: attendance.class.className,
  },
});

const updatedStudent = await prisma.student.findUnique({
  where: { id: studentId },
});

if (updatedStudent) {
  try {
    await syncStudentToGhl({
      ghlContactId: updatedStudent.ghlContactId,
      firstName: updatedStudent.firstName,
      lastName: updatedStudent.lastName,
      phone: updatedStudent.phone,
      email: updatedStudent.email,
      studentNumber: updatedStudent.studentNumber,
      program: updatedStudent.program,
      status: updatedStudent.status,
      beltRank: updatedStudent.beltRank,
      lastAttended: updatedStudent.lastAttended,
    });
  } catch (ghlError) {
    console.error("GHL ATTENDANCE SYNC ERROR:", ghlError);
  }
}