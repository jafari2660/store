import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/app/lib/auth";
import mongoose from "mongoose";

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

    const user = await User.findById(id);

    if (!user) {
      return Response.json(
        { message: "کاربر پیدا نشد." },
        { status: 404 }
      );
    }

    return Response.json(user, { status: 200 });

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

    if (
      typeof phone !== "string" ||
      !/^(\+98|0)?9\d{9}$/.test(phone.trim())
    ) {
      return Response.json(
        { message: "شماره موبایل معتبر نیست." },
        { status: 400 }
      );
    }

    if (
      role !== undefined &&
      !["USER", "ADMIN"].includes(role)
    ) {
      return Response.json(
        { message: "نقش کاربر معتبر نیست." },
        { status: 400 }
      );
    }

    const updateData = {
      name: name.trim(),
      phone: phone.trim(),
      email:
        typeof email === "string" && email.trim()
          ? email.trim().toLowerCase()
          : null,
    };

    if (role !== undefined) {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return Response.json(
        { message: "کاربر پیدا نشد." },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "اطلاعات کاربر با موفقیت ویرایش شد.",
        user,
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
    const { role } = body;

    if (!["USER", "ADMIN"].includes(role)) {
      return Response.json(
        { message: "نقش کاربر معتبر نیست." },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return Response.json(
        { message: "کاربر پیدا نشد." },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "نقش کاربر با موفقیت تغییر کرد.",
        user,
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

  
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return Response.json(
        { message: "کاربر پیدا نشد." },
        { status: 404 }
      );
    }

    return new Response(null, { status: 204 });

  } catch (error) {
    console.error("Delete User Error:", error);

    return Response.json(
      { message: "خطا در حذف کاربر." },
      { status: 500 }
    );
  }
}