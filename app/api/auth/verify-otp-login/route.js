import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { phone, code } = await request.json();

    if (!phone || !code) {
      return Response.json(
        { message: "شماره موبایل و کد تأیید الزامی است." },
        { status: 400 }
      );
    }

    const otp = await Otp.findOne({
      phone,
      code,
      kind: 2,
    });

    if (!otp) {
      return Response.json(
        { message: "کد تأیید صحیح نیست." },
        { status: 401 }
      );
    }

    if (otp.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otp._id });

      return Response.json(
        { message: "کد تأیید منقضی شده است." },
        { status: 401 }
      );
    }

    const user = await User.findOne({ phone });

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


