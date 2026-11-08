import Otp from "@/models/Otp";

export async function verifyOtp({ phone, email, code, kind = 2 }) {
  if ((!phone && !email) || (phone && email)) {
    return {
      success: false,
      message: "شماره موبایل یا ایمیل معتبر نیست.",
    };
  }

  if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
    return {
      success: false,
      message: "کد تأیید معتبر نیست.",
    };
  }

  const isEmail = Boolean(email);

  const identifierQuery = isEmail
    ? { email: email.trim().toLowerCase(), channel: "email" }
    : {
        phone: phone.trim(),
        $or: [
          { channel: "sms" },
          { channel: { $exists: false } },
        ],
      };

  const otp = await Otp.findOne({
    ...identifierQuery,
    kind,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 3 },
  }).sort({ createdAt: -1 });

  if (!otp) {
    return {
      success: false,
      message: "کد تأیید معتبر نیست یا منقضی شده است.",
    };
  }

  if (otp.code !== code.trim()) {
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
      await Otp.deleteOne({
        _id: otp._id,
        attempts: { $gte: 3 },
      });
    }

    return {
      success: false,
      message: "کد تأیید اشتباه است.",
    };
  }

  const consumedOtp = await Otp.findOneAndDelete({
    _id: otp._id,
    code: code.trim(),
    attempts: { $lt: 3 },
    expiresAt: { $gt: new Date() },
  });

  if (!consumedOtp) {
    return {
      success: false,
      message: "کد تأیید معتبر نیست یا قبلاً استفاده شده است.",
    };
  }

  return {
    success: true,
    message: "کد تأیید شد.",
  };
}