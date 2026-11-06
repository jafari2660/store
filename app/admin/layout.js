import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  await connectToDatabase();

  const user = await User.findById(session.user.id)
    .select("role isActive")
    .lean();

  if (!user || !user.isActive || user.role !== "ADMIN") {
    redirect("/unauthorize");
  }

  return <>{children}</>;
}