import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { phone, name, email, type } = await request.json();

    if (
      !type ||
      !["register", "set-password", "reset-password"].includes(type)
    ) {
      return Response.json(
        { message: "نوع درخواست نامعتبر است." },
        { status: 400 },
      );
    }


    const normalizedPhone = phone.trim();
    const phoneRegex = /^(\+98|0)?9\d{9}$/;

    if (!phoneRegex.test(normalizedPhone)) {
      return Response.json(
        { message: "شماره موبایل وارد شده صحیح نیست." },
        { status: 400 },
      );
    }

    if (type === "register") {
      if (
        typeof name !== "string" ||
        name.trim().length < 3 ||
        name.trim().length > 30
      ) {
        return Response.json(
          { message: "نام و نام خانوادگی باید بین 3 تا 30 کاراکتر باشد." },
          { status: 400 },
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (typeof email !== "string" || !emailRegex.test(email.trim())) {
        return Response.json(
          { message: "آدرس ایمیل وارد شده صحیح نیست." },
          { status: 400 },
        );
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        $or: [{ phone: normalizedPhone }, { email: normalizedEmail }],
      });

      if (existingUser) {
        return Response.json(
          { message: "کاربر با این مشخصات قبلاً ثبت‌نام کرده است." },
          { status: 409 },
        );
      }
    }

    if (type === "set-password" || type === "reset-password") {
      const existingUser = await User.findOne({
        phone: normalizedPhone,
      }).select("+password");

      if (!existingUser) {
        return Response.json(
          { message: "کاربری با این شماره موبایل ثبت‌نام نکرده است." },
          { status: 404 },
        );
      }

      if (!existingUser.isActive) {
        return Response.json(
          { message: "حساب کاربری شما غیرفعال است." },
          { status: 403 },
        );
      }

      if (type === "set-password" && existingUser.password) {
        return Response.json(
          {
            message:
              "شما قبلاً رمز عبور تعیین کرده‌اید. برای بازیابی رمز از بخش فراموشی رمز استفاده کنید.",
          },
          { status: 409 },
        );
      }

      if (type === "reset-password" && !existingUser.password) {
        return Response.json(
          {
            message:
              "شما هنوز رمز عبور تعیین نکرده‌اید. ابتدا باید رمز اولیه خود را تعیین کنید.",
          },
          { status: 409 },
        );
      }
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();

    const kind = type === "register" ? 1 : type === "set-password" ? 3 : 4;

    await Otp.deleteMany({ phone: normalizedPhone, kind });
    await Otp.create({
      phone: normalizedPhone,
      code: otpCode,
      kind,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

        await sendSms(phone, `کد تایید شما: ${otpCode}`);


    return Response.json(
      { message: "کد تأیید برای شما ارسال شد." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Send OTP Error:", error);

    return Response.json(
      { message: "خطای داخلی سرور رخ داده است." },
      { status: 500 },
    );
  }
}
