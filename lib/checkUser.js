"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function checkUser() {
  try {
    const clerk = await currentUser();

    if (!clerk?.id) return null;

    const {
      id: clerkUserId,
      firstName,
      lastName,
      emailAddresses,
      imageUrl,
    } = clerk;

    let user = await prisma.user.findUnique({
      where: {
        clerkUserId,
      },
    });

    if (user) return user;

    const email = emailAddresses?.[0].emailAddress;

    const name = firstName
      ? `${firstName} ${lastName}`
      : `${email.split("@")[0]}`;

    user = await prisma.user.create({
      data: {
        clerkUserId,
        email,
        imageUrl,
        name,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("Error while creating new user ", error);
    return null;
  }
}
