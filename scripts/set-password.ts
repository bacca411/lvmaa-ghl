import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const staffId = "cmo9a3026003zktpl2skine9b";
  const password = "Test1234!";

  const hash = await bcrypt.hash(password, 10);

  const updated = await prisma.staff.update({
    where: { id: staffId },
    data: {
      passwordHash: hash,
      isActive: true,
    },
  });

  console.log("Password set for:", updated.email);
  console.log("Use this password to test login:", password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });