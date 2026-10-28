
import connectToDatabase from "@/app/lib/db";


import User from "@/models/User";


export async function GET() {
  try {
    
    await connectToDatabase();

    const users = await User.find({});
    return new Response(JSON.stringify(users), {
      status: 200,

      headers: { "Content-Type": "application/json; charset=utf-8" },
    });

  } catch (error) {
    
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,

      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, phone, email, role } = body;

    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      typeof phone !== "string" ||
      phone.trim() === ""
    ) {
      return new Response(
        JSON.stringify({ message: "نام و شماره کاربر الزامی است" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    const userData = {
      name: name.trim(),
      phone: phone.trim(),
      role: role === "ADMIN" ? "ADMIN" : "USER",
    };

    if (typeof email === "string" && email.trim() !== "") {
      userData.email = email.trim().toLowerCase();
    }

    const user = await User.create(userData);

    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    if (error.code === 11000) {
      return new Response(
        JSON.stringify({ message: "این شماره یا ایمیل قبلاً ثبت شده است" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}