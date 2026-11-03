
import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import crypto from "crypto";
import { sendSms } from "@/app/lib/meliPayamak";
import { sendEmail } from "@/app/lib/email";
import OtpRateLimit from "@/models/OtpRateLimit";

async function checkOtpRateLimit(identifier) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 5 * 60 * 1000);

  let limit = await OtpRateLimit.findOneAndUpdate(
    {
      phone: identifier,
      windowStart: { $gt: windowStart },
      count: { $lt: 3 },
    },
    { $inc: { count: 1 } },
    { new: true }
  );

  if (limit) return true;

  limit = await OtpRateLimit.findOneAndUpdate(
    {
      phone: identifier,
      windowStart: { $lte: windowStart },
    },
    {
      $set: {
        count: 1,
        windowStart: now,
        blockedUntil: null,
      },
    },
    { new: true }
  );

  if (limit) return true;

  try {
    await OtpRateLimit.create({
      phone: identifier,
      count: 1,
      windowStart: now,
    });

    return true;
  } catch (error) {
    if (error.code !== 11000) throw error;

    limit = await OtpRateLimit.findOneAndUpdate(
      {
        phone: identifier,
        windowStart: { $gt: windowStart },
        count: { $lt: 3 },
      },
      { $inc: { count: 1 } },
      { new: true }
    );

    return Boolean(limit);
  }
}

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
        { status: 400 }
      );
    }

    const { phone, name, email, type, identifier } = body;

    const allowedTypes = [
      "register",
      "set-password",
      "reset-password",
      "login",
    ];

    if (typeof type !== "string" || !allowedTypes.includes(type)) {
      return Response.json(
        { message: "نوع درخواست نامعتبر است." },
        { status: 400 }
      );
    }

    let normalizedPhone = "";
    let normalizedEmail = "";
    let channel = "sms";
    let rateLimitIdentifier = "";

    if (type === "login") {
      if (typeof identifier !== "string" || !identifier.trim()) {
        return Response.json(
          { message: "ایمیل یا شماره موبایل را وارد کنید." },
          { status: 400 }
        );
      }

      const rawIdentifier = identifier.trim();

      if (rawIdentifier.includes("@")) {
        normalizedEmail = rawIdentifier.toLowerCase();

        if (!isValidEmail(normalizedEmail)) {
          return Response.json(
            { message: "آدرس ایمیل وارد شده صحیح نیست." },
            { status: 400 }
          );
        }

        channel = "email";
        rateLimitIdentifier = normalizedEmail;

        const existingUser = await User.findOne({
          email: normalizedEmail,
        });

        if (!existingUser) {
          return Response.json(
            { message: "کاربری با این ایمیل پیدا نشد." },
            { status: 404 }
          );
        }

        if (!existingUser.isActive) {
          return Response.json(
            { message: "حساب کاربری شما غیرفعال است." },
            { status: 403 }
          );
        }
      } else {
        normalizedPhone = normalizePhone(rawIdentifier);

        if (!/^09\d{9}$/.test(normalizedPhone)) {
          return Response.json(
            { message: "شماره موبایل وارد شده صحیح نیست." },
            { status: 400 }
          );
        }

        channel = "sms";
        rateLimitIdentifier = normalizedPhone;

        const existingUser = await User.findOne({
          phone: normalizedPhone,
        });

        if (!existingUser) {
          return Response.json(
            { message: "کاربری با این شماره موبایل پیدا نشد." },
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
    } else {
      if (typeof phone !== "string" || !phone.trim()) {
        return Response.json(
          { message: "شماره موبایل معتبر نیست." },
          { status: 400 }
        );
      }

      normalizedPhone = normalizePhone(phone);

      if (!/^09\d{9}$/.test(normalizedPhone)) {
        return Response.json(
          { message: "شماره موبایل وارد شده صحیح نیست." },
          { status: 400 }
        );
      }

      rateLimitIdentifier = normalizedPhone;

      if (type === "register") {
        if (
          typeof name !== "string" ||
          name.trim().length < 3 ||
          name.trim().length > 30
        ) {
          return Response.json(
            { message: "نام و نام خانوادگی باید بین ۳ تا ۳۰ کاراکتر باشد." },
            { status: 400 }
          );
        }

        if (typeof email !== "string") {
          return Response.json(
            { message: "آدرس ایمیل وارد شده صحیح نیست." },
            { status: 400 }
          );
        }

        normalizedEmail = email.trim().toLowerCase();

        if (!isValidEmail(normalizedEmail)) {
          return Response.json(
            { message: "آدرس ایمیل وارد شده صحیح نیست." },
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
            { message: "کاربر با این مشخصات قبلاً ثبت‌نام کرده است." },
            { status: 409 }
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
            { status: 404 }
          );
        }

        if (!existingUser.isActive) {
          return Response.json(
            { message: "حساب کاربری شما غیرفعال است." },
            { status: 403 }
          );
        }

        if (type === "set-password" && existingUser.password) {
          return Response.json(
            {
              message:
                "شما قبلاً رمز عبور تعیین کرده‌اید. برای تغییر رمز از بخش فراموشی رمز استفاده کنید.",
            },
            { status: 409 }
          );
        }

        if (type === "reset-password" && !existingUser.password) {
          return Response.json(
            {
              message:
                "شما هنوز رمز عبور تعیین نکرده‌اید. ابتدا باید رمز اولیه خود را تعیین کنید.",
            },
            { status: 409 }
          );
        }
      }
    }

    const canSendOtp = await checkOtpRateLimit(rateLimitIdentifier);

    if (!canSendOtp) {
      return Response.json(
        {
          message:
            "تعداد درخواست‌های ارسال کد بیش از حد مجاز است. لطفاً ۵ دقیقه دیگر تلاش کنید.",
        },
        { status: 429 }
      );
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();

    const kind =
      type === "register"
        ? 1
        : type === "login"
          ? 2
          : type === "set-password"
            ? 3
            : 4;

    if (channel === "email") {
      await Otp.deleteMany({
        email: normalizedEmail,
        kind,
      });
    } else {
      await Otp.deleteMany({
        phone: normalizedPhone,
        kind,
      });
    }

    const otpData = {
      code: otpCode,
      kind,
      channel,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
    };

    if (channel === "email") {
      otpData.email = normalizedEmail;
    } else {
      otpData.phone = normalizedPhone;
    }

    const otp = await Otp.create(otpData);

    try {
      if (channel === "email") {
        await sendEmail(
          normalizedEmail,
          "کد تأیید ورود",
          `کد تأیید شما: ${otpCode}`
        );
      } else {
        await sendSms(
          normalizedPhone,
          `کد تایید شما: ${otpCode}`
        );
      }
    } catch (error) {
      await Otp.deleteOne({ _id: otp._id });
      throw error;
    }

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
