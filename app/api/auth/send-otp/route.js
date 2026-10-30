import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import crypto from "crypto";

export async function POST(request) {
  await connectToDatabase();
  try {
    const { phone, name , email } = await request.json();

    if (!name || name.trim().length < 3 || name.trim().length > 30) {
      return new Response(
        JSON.stringify({
          message: "نام و نام خانوادگی باید بین 3 تا 30 کاراکتر باشد.",
        }),
        {
          status: 400,
        }
      );
    }

    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return new Response(
        JSON.stringify({
          message: "شماره تلفن وارد شده صحیح نیست.",
        }),
        {
          status: 400,
        }
      );
    }

    const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

if (!email || !emailRegex.test(email.trim())) {
  return new Response(
    JSON.stringify({
      message: "آدرس ایمیل وارد شده صحیح نیست.",
    }),
    {
      status: 400,
    }
  );
}

    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Send SMS otpCode to phone number

    const otp = await Otp.create({
      phone,
       email: email.trim(),
      code: otpCode,
      kind: 1,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return new Response(
      JSON.stringify({
        message: "کد تایید برای شما ارسال شد.",
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
