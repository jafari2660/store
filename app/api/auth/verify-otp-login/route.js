import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";

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
    const body = await request.json();
    const { identifier, phone, code } = body ?? {};

    const rawIdentifier =
      typeof identifier === "string"
        ? identifier.trim()
        : typeof phone === "string"
          ? phone.trim()
          : "";

    if (
      !rawIdentifier ||
      typeof code !== "string" ||
      !/^\d{6}$/.test(code.trim())
    ) {
      return Response.json(
        { message: "ایمیل یا شماره موبایل یا کد تأیید نامعتبر است." },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim();

    let channel;
    let normalizedPhone = "";
    let normalizedEmail = "";
    let user;

    if (rawIdentifier.includes("@")) {
      normalizedEmail = rawIdentifier.toLowerCase();

      if (!isValidEmail(normalizedEmail)) {
        return Response.json(
          { message: "آدرس ایمیل یا کد تأیید نامعتبر است." },
          { status: 400 }
        );
      }

      channel = "email";
    } else {
      normalizedPhone = normalizePhone(rawIdentifier);

      if (!/^09\d{9}$/.test(normalizedPhone)) {
        return Response.json(
          { message: "شماره موبایل یا کد تأیید نامعتبر است." },
          { status: 400 }
        );
      }

      channel = "sms";
    }

    await connectToDatabase();

    user =
      channel === "email"
        ? await User.findOne({ email: normalizedEmail })
        : await User.findOne({ phone: normalizedPhone });

    if (!user) {
      return Response.json(
        { message: "کاربر یافت نشد." },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return Response.json(
        { message: "حساب کاربری شما غیرفعال است." },
        { status: 403 }
      );
    }

    const now = new Date();
    const MAX_ATTEMPTS = 3;

    const otpQuery = {
      kind: 2,
      channel,
      expiresAt: { $gt: now },
      ...(channel === "email"
        ? { email: normalizedEmail }
        : { phone: normalizedPhone }),
    };

    const activeOtp = await Otp.findOne(otpQuery).sort({
      createdAt: -1,
    });

    if (!activeOtp) {
      return Response.json(
        { message: "کد تأیید نامعتبر یا منقضی شده است." },
        { status: 401 }
      );
    }

    if (activeOtp.attempts >= MAX_ATTEMPTS) {
      await Otp.deleteOne({ _id: activeOtp._id });

      return Response.json(
        {
          message:
            "تعداد تلاش‌های مجاز تمام شده است. کد جدید درخواست کنید.",
        },
        { status: 429 }
      );
    }

    if (activeOtp.code !== normalizedCode) {
      const updatedOtp = await Otp.findOneAndUpdate(
        {
          _id: activeOtp._id,
          attempts: { $lt: MAX_ATTEMPTS },
          expiresAt: { $gt: new Date() },
        },
        {
          $inc: { attempts: 1 },
        },
        {
          new: true,
        }
      );

      if (updatedOtp && updatedOtp.attempts >= MAX_ATTEMPTS) {
        await Otp.deleteOne({
          _id: updatedOtp._id,
          attempts: { $gte: MAX_ATTEMPTS },
        });
      }

      return Response.json(
        { message: "کد تأیید نامعتبر است." },
        { status: 401 }
      );
    }

    const consumedOtp = await Otp.findOneAndDelete({
      _id: activeOtp._id,
      code: normalizedCode,
      attempts: { $lt: MAX_ATTEMPTS },
      expiresAt: { $gt: new Date() },
    });

    if (!consumedOtp) {
      return Response.json(
        { message: "کد تأیید نامعتبر یا منقضی شده است." },
        { status: 401 }
      );
    }

    return Response.json(
      { message: "اطلاعات تأیید شد." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return Response.json(
      { message: "خطای داخلی سرور رخ داده است." },
      { status: 500 }
    );
  }
}