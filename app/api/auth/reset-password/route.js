
import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { phone, code, password } = body || {};

    if (
      typeof phone !== "string" ||
      typeof code !== "string" ||
      typeof password !== "string"
    ) {
      return Response.json(
        { message: "تمام فیلدها الزامی هستند." },
        { status: 400 }
      );
    }

    let normalizedPhone = phone.trim();

    if (normalizedPhone.startsWith("+98")) {
      normalizedPhone = `0${normalizedPhone.slice(3)}`;
    } else if (normalizedPhone.startsWith("9")) {
      normalizedPhone = `0${normalizedPhone}`;
    }

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      return Response.json(
        { message: "شماره موبایل وارد شده صحیح نیست." },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      return Response.json(
        { message: "کد تأیید باید شامل ۶ رقم باشد." },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 128) {
      return Response.json(
        { message: "رمز عبور باید بین ۸ تا ۱۲۸ کاراکتر باشد." },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      phone: normalizedPhone,
    }).select("+password");

    if (!user) {
      return Response.json(
        { message: "کاربری با این شماره موبایل یافت نشد." },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return Response.json(
        { message: "حساب کاربری شما غیرفعال است." },
        { status: 403 }
      );
    }

    if (!user.password) {
      return Response.json(
        {
          message:
            "شما هنوز رمز عبور تعیین نکرده‌اید. ابتدا باید رمز اولیه خود را تعیین کنید.",
        },
        { status: 409 }
      );
    }

    const now = new Date();

    const otp = await Otp.findOne({
      phone: normalizedPhone,
      channel: "sms",
      kind: 4,
      expiresAt: { $gt: now },
      attempts: { $lt: 3 },
    }).sort({ createdAt: -1 });

    if (!otp) {
      return Response.json(
        {
          message:
            "کد تأیید معتبر نیست یا منقضی شده است. دوباره کد دریافت کنید.",
        },
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
        { message: "کد تأیید وارد شده صحیح نیست." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const consumedOtp = await Otp.findOneAndDelete({
      _id: otp._id,
      code: normalizedCode,
      channel: "sms",
      kind: 4,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: 3 },
    });

    if (!consumedOtp) {
      return Response.json(
        {
          message:
            "کد تأیید معتبر نیست یا قبلاً استفاده شده است.",
        },
        { status: 400 }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        isActive: true,
        password: { $exists: true, $ne: null },
      },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        { message: "امکان تغییر رمز عبور وجود ندارد." },
        { status: 409 }
      );
    }

    return Response.json(
      { message: "رمز عبور شما با موفقیت تغییر کرد." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset Password Error:", error);

    return Response.json(
      { message: "خطای داخلی سرور رخ داده است." },
      { status: 500 }
    );
  }
}
