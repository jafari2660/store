import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import bcrypt from "bcryptjs";

function normalizePhone(phone) {
  let normalized = phone.trim();

  if (normalized.startsWith("+98")) {
    normalized = `0${normalized.slice(3)}`;
  } else if (normalized.startsWith("9")) {
    normalized = `0${normalized}`;
  }

  return normalized;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json(
        { message: "اطلاعات ارسالی معتبر نیست." },
        { status: 400 },
      );
    }

    const { identifier, phone, email, code, password } = body;

    if (typeof code !== "string" || typeof password !== "string") {
      return Response.json(
        { message: "تمام فیلدها الزامی هستند." },
        { status: 400 },
      );
    }

    const rawIdentifier = (
      typeof identifier === "string" && identifier.trim()
        ? identifier
        : typeof email === "string" && email.trim()
          ? email
          : typeof phone === "string"
            ? phone
            : ""
    ).trim();

    if (!rawIdentifier) {
      return Response.json(
        { message: "ایمیل یا شماره موبایل الزامی است." },
        { status: 400 },
      );
    }

    let normalizedPhone = "";
    let normalizedEmail = "";
    let channel = "sms";
    let user = null;
    let otpQuery = {};

    if (rawIdentifier.includes("@")) {
      normalizedEmail = rawIdentifier.toLowerCase();

      if (!isValidEmail(normalizedEmail)) {
        return Response.json(
          { message: "آدرس ایمیل وارد شده صحیح نیست." },
          { status: 400 },
        );
      }

      channel = "email";

      user = await User.findOne({
        email: normalizedEmail,
      }).select("+password");

      otpQuery = {
        email: normalizedEmail,
        channel: "email",
      };
    } else {
      normalizedPhone = normalizePhone(rawIdentifier);

      if (!/^09\d{9}$/.test(normalizedPhone)) {
        return Response.json(
          { message: "شماره موبایل وارد شده صحیح نیست." },
          { status: 400 },
        );
      }

      channel = "sms";

      user = await User.findOne({
        phone: normalizedPhone,
      }).select("+password");

      otpQuery = {
        phone: normalizedPhone,
        $or: [{ channel: "sms" }, { channel: { $exists: false } }],
      };
    }

    if (!user) {
      return Response.json(
        { message: "کاربری با این مشخصات یافت نشد." },
        { status: 404 },
      );
    }

    if (!user.isActive) {
      return Response.json(
        { message: "حساب کاربری شما غیرفعال است." },
        { status: 403 },
      );
    }

    if (!user.password) {
      return Response.json(
        {
          message:
            "شما هنوز رمز عبور تعیین نکرده‌اید. ابتدا باید رمز اولیه خود را تعیین کنید.",
        },
        { status: 409 },
      );
    }

    const normalizedCode = code.trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      return Response.json(
        { message: "کد تأیید باید شامل ۶ رقم باشد." },
        { status: 400 },
      );
    }

    if (password.length < 8 || password.length > 128) {
      return Response.json(
        { message: "رمز عبور باید بین ۸ تا ۱۲۸ کاراکتر باشد." },
        { status: 400 },
      );
    }

    const now = new Date();

    const otp = await Otp.findOne({
      ...otpQuery,
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
        { status: 400 },
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
        { new: true },
      );

      if (updatedOtp && updatedOtp.attempts >= 3) {
        await Otp.deleteOne({
          _id: updatedOtp._id,
        });
      }

      return Response.json(
        { message: "کد تأیید وارد شده صحیح نیست." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        isActive: true,
        password: { $exists: true, $ne: null },
      },
      {
        $set: {
          password: hashedPassword,
        },
        $inc: {
          authVersion: 1,
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      return Response.json(
        { message: "امکان تغییر رمز عبور وجود ندارد." },
        { status: 409 },
      );
    }

    const consumedOtp = await Otp.findOneAndDelete({
      _id: otp._id,
      ...otpQuery,
      code: normalizedCode,
      kind: 4,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: 3 },
    });

    if (!consumedOtp) {
      console.error("OTP could not be consumed after password update");
    }

    return Response.json(
      {
        message: "رمز عبور شما با موفقیت تغییر کرد.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset Password Error:", error);

    return Response.json(
      { message: "خطای داخلی سرور رخ داده است." },
      { status: 500 },
    );
  }
}
