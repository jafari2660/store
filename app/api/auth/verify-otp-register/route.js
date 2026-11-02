import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json(
        { message: "اطلاعات ارسالی معتبر نیست." },
        { status: 400 }
      );
    }

    const { phone, code, name, email } = body;

    if (
      typeof phone !== "string" ||
      typeof code !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string"
    ) {
      return Response.json(
        { message: "نوع اطلاعات ارسالی معتبر نیست." },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.trim();
    const normalizedCode = code.trim();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const phoneRegex = /^(\+98|0)?9\d{9}$/;

    if (!phoneRegex.test(normalizedPhone)) {
      return Response.json(
        { message: "شماره موبایل معتبر نیست." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      return Response.json(
        { message: "کد تأیید باید یک رشته شش‌رقمی باشد." },
        { status: 400 }
      );
    }

    if (
      normalizedName.length < 3 ||
      normalizedName.length > 30
    ) {
      return Response.json(
        { message: "نام باید بین ۳ تا ۳۰ کاراکتر باشد." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(normalizedEmail)) {
      return Response.json(
        { message: "ایمیل معتبر نیست." },
        { status: 400 }
      );
    }

    const otp = await Otp.findOne({
      phone: normalizedPhone,
      code: normalizedCode,
      kind: 1,
    });

    if (!otp) {
      return Response.json(
        { message: "کد وارد شده صحیح نیست." },
        { status: 400 }
      );
    }

    if (otp.expiresAt <= new Date()) {
      await Otp.deleteOne({ _id: otp._id });

      return Response.json(
        { message: "کد تأیید منقضی شده است." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      $or: [
        { phone: normalizedPhone },
        { email: normalizedEmail },
      ],
    });

    if (existingUser) {
      return Response.json(
        { message: "شماره موبایل یا ایمیل قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      name: normalizedName,
      phone: normalizedPhone,
      email: normalizedEmail,
      role: "USER",
      isActive: true,
    });

    await Otp.deleteOne({ _id: otp._id });

    return Response.json(
      {
        message: "ثبت‌نام با موفقیت انجام شد. اکنون رمز عبور خود را تعیین کنید.",
        nextStep: "set-password",
        phone: newUser.phone,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Register OTP Error:", error);

    if (error.code === 11000) {
      return Response.json(
        { message: "شماره موبایل یا ایمیل قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    return Response.json(
      { message: "خطای داخلی سرور رخ داده است." },
      { status: 500 }
    );
  }
}
