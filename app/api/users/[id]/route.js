
import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/app/lib/auth";
import mongoose from "mongoose";

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

function normalizePhone(phone) {
  let normalized = phone.trim();

  if (normalized.startsWith("+98")) {
    normalized = `0${normalized.slice(3)}`;
  } else if (normalized.startsWith("9")) {
    normalized = `0${normalized}`;
  }

  return normalized;
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

async function getAdminCount() {
  return User.countDocuments({
    role: "ADMIN",
    isActive: true,
  });
}

export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }

    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه کاربر معتبر نیست." },
        { status: 400 }
      );
    }

    const user = await User.findById(id)
      .select("name phone email role isActive createdAt updatedAt")
      .lean();

    if (!user) {
      return Response.json(
        { message: "کاربر پیدا نشد." },
        { status: 404 }
      );
    }

    return Response.json(safeUser(user), { status: 200 });
  } catch (error) {
    console.error("Get User Error:", error);

    return Response.json(
      { message: "خطا در دریافت اطلاعات کاربر." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }

    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه کاربر معتبر نیست." },
        { status: 400 }
      );
    }

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

    if (role !== undefined && !["USER", "ADMIN"].includes(role)) {
      return Response.json(
        { message: "نقش کاربر معتبر نیست." },
        { status: 400 }
      );
    }

    if (
      email !== undefined &&
      email !== null &&
      typeof email !== "string"
    ) {
      return Response.json(
        { message: "ایمیل معتبر نیست." },
        { status: 400 }
      );
    }

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (normalizedEmail && !validEmail(normalizedEmail)) {
      return Response.json(
        { message: "آدرس ایمیل معتبر نیست." },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return Response.json(
        { message: "کاربر پیدا نشد." },
        { status: 404 }
      );
    }

    if (
      String(auth.token.id) === String(id) &&
      role === "USER"
    ) {
      return Response.json(
        { message: "نمی‌توانید نقش مدیریتی حساب خودتان را حذف کنید." },
        { status: 403 }
      );
    }

    if (
      targetUser.role === "ADMIN" &&
      targetUser.isActive &&
      role === "USER"
    ) {
      const adminCount = await getAdminCount();

      if (adminCount <= 1) {
        return Response.json(
          { message: "نمی‌توان آخرین مدیر فعال را به کاربر عادی تبدیل کرد." },
          { status: 409 }
        );
      }
    }

    const updateData = {
      name: name.trim(),
      phone: normalizedPhone,
    };

    const updateQuery = { $set: updateData };

    if (role !== undefined) {
      updateData.role = role;
    }

    if (email !== undefined) {
      if (normalizedEmail) {
        updateData.email = normalizedEmail;
      } else {
        updateQuery.$unset = { email: 1 };
      }
    }

    const user = await User.findByIdAndUpdate(id, updateQuery, {
      new: true,
      runValidators: true,
    }).select("name phone email role isActive createdAt updatedAt");

    if (!user) {
      return Response.json(
        { message: "کاربر پیدا نشد." },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "اطلاعات کاربر با موفقیت ویرایش شد.",
        user: safeUser(user),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update User Error:", error);

    if (error.code === 11000) {
      return Response.json(
        { message: "شماره موبایل یا ایمیل قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    return Response.json(
      { message: "خطا در ویرایش اطلاعات کاربر." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }

    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه کاربر معتبر نیست." },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json(
        { message: "اطلاعات ارسالی معتبر نیست." },
        { status: 400 }
      );
    }

    const { role } = body;

    if (!["USER", "ADMIN"].includes(role)) {
      return Response.json(
        { message: "نقش کاربر معتبر نیست." },
        { status: 400 }
      );
    }

    if (String(auth.token.id) === String(id) && role === "USER") {
      return Response.json(
        { message: "نمی‌توانید نقش مدیریتی حساب خودتان را حذف کنید." },
        { status: 403 }
      );
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return Response.json(
        { message: "کاربر پیدا نشد." },
        { status: 404 }
      );
    }

    if (
      targetUser.role === "ADMIN" &&
      targetUser.isActive &&
      role === "USER"
    ) {
      const adminCount = await getAdminCount();

      if (adminCount <= 1) {
        return Response.json(
          { message: "نمی‌توان آخرین مدیر فعال را به کاربر عادی تبدیل کرد." },
          { status: 409 }
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      {
        new: true,
        runValidators: true,
      }
    ).select("name phone email role isActive createdAt updatedAt");

    return Response.json(
      {
        message: "نقش کاربر با موفقیت تغییر کرد.",
        user: safeUser(user),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change User Role Error:", error);

    return Response.json(
      { message: "خطا در تغییر نقش کاربر." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }

    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه کاربر معتبر نیست." },
        { status: 400 }
      );
    }

    if (String(auth.token.id) === String(id)) {
      return Response.json(
        { message: "نمی‌توانید حساب کاربری خودتان را حذف کنید." },
        { status: 403 }
      );
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return Response.json(
        { message: "کاربر پیدا نشد." },
        { status: 404 }
      );
    }

    if (targetUser.role === "ADMIN" && targetUser.isActive) {
      const adminCount = await getAdminCount();

      if (adminCount <= 1) {
        return Response.json(
          { message: "نمی‌توان آخرین مدیر فعال را حذف کرد." },
          { status: 409 }
        );
      }
    }

    await User.findByIdAndDelete(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Delete User Error:", error);

    return Response.json(
      { message: "خطا در حذف کاربر." },
      { status: 500 }
    );
  }
}
