
import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/app/lib/auth";

function normalizePhone(phone) {
  let normalized = phone.trim();

  if (normalized.startsWith("+98")) {
    normalized = `0${normalized.slice(3)}`;
  } else if (normalized.startsWith("9")) {
    normalized = `0${normalized}`;
  }

  return normalized;
}

function safeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }

    await connectToDatabase();

    const users = await User.find({})
      .select("name phone email role isActive createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(users.map(safeUser), { status: 200 });
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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json(
        { message: "اطلاعات ارسالی معتبر نیست." },
        { status: 400 }
      );
    }

    const { name, phone, email, role } = body;

    if (
      typeof name !== "string" ||
      name.trim().length < 3 ||
      name.trim().length > 30
    ) {
      return Response.json(
        { message: "نام باید بین ۳ تا ۳۰ کاراکتر باشد." },
        { status: 400 }
      );
    }

    if (typeof phone !== "string") {
      return Response.json(
        { message: "شماره موبایل معتبر نیست." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      return Response.json(
        { message: "شماره موبایل معتبر نیست." },
        { status: 400 }
      );
    }

    if (email !== undefined && email !== null && typeof email !== "string") {
      return Response.json(
        { message: "ایمیل معتبر نیست." },
        { status: 400 }
      );
    }

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (
      normalizedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)
    ) {
      return Response.json(
        { message: "آدرس ایمیل معتبر نیست." },
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
      phone: normalizedPhone,
      role: role || "USER",
    };

    if (normalizedEmail) {
      userData.email = normalizedEmail;
    }

    const user = await User.create(userData);

    return Response.json(safeUser(user), { status: 201 });
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
