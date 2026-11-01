import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { phone, code, password } = await request.json();

    if (!phone || !code || !password) {
      return Response.json(
        { message: "تمام فیلدها الزامی هستند." },
        { status: 400 },
      );
    }

    const phoneRegex = /^(\+98|0)?9\d{9}$/;

    if (typeof phone !== "string" || !phoneRegex.test(phone)) {
      return Response.json(
        { message: "شماره موبایل صحیح نیست." },
        { status: 400 },
      );
    }

    if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return Response.json(
        { message: "کد تأیید باید ۶ رقم باشد." },
        { status: 400 },
      );
    }

    if (password.length < 8 || password.length > 128) {
      return Response.json(
        { message: "رمز عبور باید بین ۸ تا ۱۲۸ کاراکتر باشد." },
        { status: 400 },
      );
    }

    const user = await User.findOne({ phone }).select("+password");

    if (!user) {
      return Response.json(
        { message: "کاربری با این شماره موبایل پیدا نشد." },
        { status: 404 },
      );
    }

    if (!user.isActive) {
      return Response.json(
        { message: "حساب کاربری شما غیرفعال است." },
        { status: 403 },
      );
    }

    if (user.password) {
      return Response.json(
        { message: "شما قبلاً رمز عبور تعیین کرده‌اید." },
        { status: 409 },
      );
    }

    const otp = await Otp.findOne({
      phone,
      code,
      kind: 3,
    });

    if (!otp) {
      return Response.json({ message: "کد تأیید صحیح نیست." }, { status: 400 });
    }

    if (otp.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otp._id });

      return Response.json(
        { message: "کد تأیید منقضی شده است." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    await user.save();

    await Otp.deleteOne({ _id: otp._id });

    return Response.json(
      { message: "رمز عبور با موفقیت ثبت شد." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Set Password Error:", error);

    return Response.json(
      { message: "خطای داخلی سرور رخ داده است." },
      { status: 500 },
    );
  }
}
