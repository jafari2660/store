import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { phone, code, password } = await request.json();

    const phoneRegex = /^(\+98|0)?9\d{9}$/;

    if (typeof phone !== "string" || !phoneRegex.test(phone)) {
      return Response.json(
        { message: "شماره موبایل وارد شده صحیح نیست." },
        { status: 400 }
      );
    }

    if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return Response.json(
        { message: "کد تأیید باید شامل ۶ رقم باشد." },
        { status: 400 }
      );
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return Response.json(
        { message: "رمز عبور باید بین ۸ تا ۱۲۸ کاراکتر باشد." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ phone }).select("+password");

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

    const otp = await Otp.findOne({
      phone,
      code,
      kind: 4,
    });

    if (!otp) {
      return Response.json(
        { message: "کد تأیید نامعتبر است." },
        { status: 400 }
      );
    }

    if (otp.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otp._id });

      return Response.json(
        { message: "زمان اعتبار کد تأیید به پایان رسیده است." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    await user.save();

    await Otp.deleteOne({ _id: otp._id });

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

