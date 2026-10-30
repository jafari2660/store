import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";

export async function POST(request) {
  await connectToDatabase();

  try {
    const { phone, code, name ,email } = await request.json();

    if (!phone || !code || !name || !email) {
      return new Response(
        JSON.stringify({ message: "فیلد ها الزامی میباشند" }),
        {
          status: 400,
        }
      );
    }

    const otp = await Otp.findOne({ phone, code });

    if (!otp) {
      return new Response(
        JSON.stringify({ message: "کد وارد شده صحیح نیست" }),
        {
          status: 400,
        }
      );
    }

    if (otp.expiresAt < new Date()) {
      return new Response(JSON.stringify({ message: "کد منقضی شده است" }), {
        status: 400,
      });
    }

    const user = await User.create({
      name,
      phone,
       email: email.trim(),
      role: "USER",
      isActive: true,
    });

    await Otp.deleteOne({ _id: otp._id });

    return new Response(
      JSON.stringify({ message: "ثبت نام با موفقیت انجام شد" })
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
