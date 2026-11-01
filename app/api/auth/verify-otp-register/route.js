import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { phone, code, name, email } = await request.json();

    if (!phone || !code || !name || !email) {
      return Response.json(
        { message: "تمام فیلدها الزامی هستند." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otp = await Otp.findOne({
      phone,
      code,
      kind: 1,
    });

    if (!otp) {
      return Response.json(
        { message: "کد وارد شده صحیح نیست." },
        { status: 400 }
      );
    }

    if (otp.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otp._id });

      return Response.json(
        { message: "کد منقضی شده است." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      $or: [
        { phone },
        { email: normalizedEmail },
      ],
    });

    if (existingUser) {
      return Response.json(
        { message: "شماره موبایل یا ایمیل قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      name: name.trim(),
      phone,
      email: normalizedEmail,
      role: "USER",
      isActive: true,
    });

    await Otp.deleteOne({ _id: otp._id });

    return Response.json(
      {
        message: "ثبت‌نام با موفقیت انجام شد. اکنون رمز عبور خود را تعیین کنید.",
        nextStep: "set-password",
        phone: newUser.phone,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Register OTP Error:", error);

    if (error.code === 11000) {
      return Response.json(
        { message: "شماره موبایل یا ایمیل قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    return Response.json(
      { message: "خطای داخلی سرور رخ داده است." },
      { status: 500 }
    );
  }
}
