import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { phone, name, email, type } = await request.json();

    if (!type || !["register", "login"].includes(type)) {
      return Response.json(
        { message: "نوع درخواست نامعتبر است." },
        { status: 400 }
      );
    }

    const phoneRegex = /^(\+98|0)?9\d{9}$/;

    if (!phone || !phoneRegex.test(phone)) {
      return Response.json(
        { message: "شماره موبایل وارد شده صحیح نیست." },
        { status: 400 }
      );
    }

    if (type === "register") {
      if (!name || name.trim().length < 3 || name.trim().length > 30) {
        return Response.json(
          { message: "نام و نام خانوادگی باید بین 3 تا 30 کاراکتر باشد." },
          { status: 400 }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!email || !emailRegex.test(email.trim())) {
        return Response.json(
          { message: "آدرس ایمیل وارد شده صحیح نیست." },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({
        $or: [
          { phone },
          { email: email.trim().toLowerCase() },
        ],
      });

      if (existingUser) {
        return Response.json(
          { message: "کاربر با این مشخصات قبلاً ثبت‌نام کرده است." },
          { status: 409 }
        );
      }
    }

    if (type === "login") {
      const existingUser = await User.findOne({ phone });

      if (!existingUser) {
        return Response.json(
          { message: "کاربر با این شماره موبایل ثبت‌نام نکرده است." },
          { status: 404 }
        );
      }

      if (!existingUser.isActive) {
        return Response.json(
          { message: "حساب کاربری شما غیرفعال است." },
          { status: 403 }
        );
      }
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();

    // ارسال پیامک کد otpCode به شماره موبایل

    await Otp.create({
      phone,
      ...(type === "register" && {
        email: email.trim().toLowerCase(),
      }),
      code: otpCode,
      kind: type === "register" ? 1 : 2,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return Response.json(
      { message: "کد تأیید برای شما ارسال شد." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Send OTP Error:", error);

    return Response.json(
      { message: "خطای داخلی سرور رخ داده است." },
      { status: 500 }
    );
  }
}
