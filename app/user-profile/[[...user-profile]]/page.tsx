import { UserProfile } from "@clerk/nextjs";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

async function ProfileContent() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  return <UserProfile routing="path" path="/user-profile" />;
}

export default function ProfilePage() {
  return (
    <main className="profile-page">
      <Suspense fallback={<p>Loading account settings...</p>}>
        <ProfileContent />
      </Suspense>
    </main>
  );
}
