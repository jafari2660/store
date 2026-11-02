
import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/app/lib/auth";

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);

   
    if (!auth.authorized) {
      return auth.response;
    }

    await connectToDatabase();
    const users = await User.find({});
    return Response.json(users, { status: 200 });

  } catch (error) {
    console.error("Get Users Error:", error);

    return Response.json(
      { message: "خطا در دریافت کاربران." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }

    await connectToDatabase();

    const body = await request.json();
    const { name, phone, email, role } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof phone !== "string" ||
      !phone.trim()
    ) {
      return Response.json(
        { message: "نام و شماره کاربر الزامی است." },
        { status: 400 }
      );
    }

    if (role !== undefined && !["USER", "ADMIN"].includes(role)) {
      return Response.json(
        { message: "نقش کاربر معتبر نیست." },
        { status: 400 }
      );
    }

    const userData = {
      name: name.trim(),
      phone: phone.trim(),
      role: role || "USER",
    };

    if (typeof email === "string" && email.trim()) {
      userData.email = email.trim().toLowerCase();
    }
    const user = await User.create(userData);

    return Response.json(user, { status: 201 });

  } catch (error) {
    console.error("Create User Error:", error);

    if (error.code === 11000) {
      return Response.json(
        { message: "این شماره یا ایمیل قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    return Response.json(
      { message: "خطا در ایجاد کاربر." },
      { status: 500 }
    );
  }
}