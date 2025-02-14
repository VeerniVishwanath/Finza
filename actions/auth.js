import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("No User Found");
  }

  return {
    clerkUserId: userId,
    userId: user.id,
  };
}
