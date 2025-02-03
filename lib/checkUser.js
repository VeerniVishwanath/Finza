"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function checkUser() {
  try {
    const {
      id: clerkUserId,
      firstName,
      lastName,
      emailAddresses,
      imageUrl,
    } = await currentUser();

    if (!clerkUserId) return null;

    const loggedInUser = await prisma.user.findUnique({
      where: {
        clerkUserId,
      },
    });

    if (loggedInUser) return loggedInUser;

    const name = `${firstName} ${lastName}`;

    const email = emailAddresses?.[0].emailAddress;

    const newUser = await prisma.user.create({
      data: {
        clerkUserId,
        email,
        imageUrl,
        name,
      },
    });

    return { user: newUser };
  } catch (error) {
    console.error("Error while creating new user ", error);
  }
}
