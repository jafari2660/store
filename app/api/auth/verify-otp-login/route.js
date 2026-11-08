import connectToDatabase from "@/app/lib/db";
import { verifyOtp } from "@/app/lib/verifyOtp";
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
    const otpResult = await verifyOtp({
      phone: channel === "sms" ? normalizedPhone : undefined,
      email: channel === "email" ? normalizedEmail : undefined,
      code: normalizedCode,
      kind: 2,
    });

    if (!otpResult.success) {
      return Response.json(
        { message: otpResult.message },
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