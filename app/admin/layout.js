
import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { redirect } from "next/navigation";
import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";

export default async function AdminLayout({ children }) {
  const requestHeaders = await headers();

  const cookieStore = await cookies();

  const token = await getToken({
    req: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token?.id) {
    redirect("/auth/login");
  }

  await connectToDatabase();

  const user = await User.findById(token.id)
    .select("role isActive")
    .lean();

  if (!user || !user.isActive || user.role !== "ADMIN") {
    redirect("/unauthorize");
  }

  return <>{children}</>;
}
