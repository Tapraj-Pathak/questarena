import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function requireDatabaseUser() {
  const session = await auth();
  if (!session.userId) return null;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(session.userId);
  const email = clerkUser.emailAddresses.find((entry) => entry.id === clerkUser.primaryEmailAddressId)?.emailAddress;

  return prisma.user.upsert({
    where: { clerkUserId: session.userId },
    update: {
      displayName: clerkUser.fullName ?? clerkUser.username ?? email ?? "Player",
      username: clerkUser.username,
      email,
      phoneNumber: clerkUser.phoneNumbers.find((entry) => entry.id === clerkUser.primaryPhoneNumberId)?.phoneNumber,
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      clerkUserId: session.userId,
      displayName: clerkUser.fullName ?? clerkUser.username ?? email ?? "Player",
      username: clerkUser.username,
      email,
      phoneNumber: clerkUser.phoneNumbers.find((entry) => entry.id === clerkUser.primaryPhoneNumberId)?.phoneNumber,
      imageUrl: clerkUser.imageUrl,
    },
  });
}
