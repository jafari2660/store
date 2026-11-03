
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

    let normalizedPhone = phone.trim();

    if (normalizedPhone.startsWith("+98")) {
      normalizedPhone = `0${normalizedPhone.slice(3)}`;
    } else if (normalizedPhone.startsWith("9")) {
      normalizedPhone = `0${normalizedPhone}`;
    }

    const normalizedCode = code.trim();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^09\d{9}$/.test(normalizedPhone)) {
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

    if (normalizedName.length < 3 || normalizedName.length > 30) {
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

    const now = new Date();

    const otp = await Otp.findOne({
      phone: normalizedPhone,
      channel: "sms",
      kind: 1,
      expiresAt: { $gt: now },
      attempts: { $lt: 3 },
    }).sort({ createdAt: -1 });

    if (!otp) {
      return Response.json(
        { message: "کد تأیید معتبر نیست یا منقضی شده است. دوباره کد بگیرید." },
        { status: 400 }
      );
    }

    if (otp.code !== normalizedCode) {
      const updatedOtp = await Otp.findOneAndUpdate(
        {
          _id: otp._id,
          attempts: { $lt: 3 },
          expiresAt: { $gt: new Date() },
        },
        { $inc: { attempts: 1 } },
        { new: true }
      );

      if (updatedOtp && updatedOtp.attempts >= 3) {
        await Otp.deleteOne({ _id: updatedOtp._id });
      }

      return Response.json(
        { message: "کد وارد شده صحیح نیست." },
        { status: 400 }
      );
    }

    const consumedOtp = await Otp.findOneAndDelete({
      _id: otp._id,
      code: normalizedCode,
      channel: "sms",
      kind: 1,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: 3 },
    });

    if (!consumedOtp) {
      return Response.json(
        { message: "کد تأیید معتبر نیست یا قبلاً استفاده شده است." },
        { status: 400 }
      );
    }

    const newUser = await User.create({
      name: normalizedName,
      phone: normalizedPhone,
      email: normalizedEmail,
      role: "USER",
      isActive: true,
    });

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
