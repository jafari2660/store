import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";

export async function GET(request, { params }) {
  await connectToDatabase();

  try {
    const { id } = await params;
    const user = await User.findById(id);

    if (!user) {
      return new Response(JSON.stringify({ message: ";کاربر پیدا نشد" }), {
        status: 404,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    return new Response(JSON.stringify(user), {
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

export async function PUT(request, { params }) {
  await connectToDatabase();

  try {
    const { id } = await params;
    const { name, phone, email, role } = await request.json();

    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      name.trim().length < 3 ||
      name.trim().length > 30
    ) {
      return new Response(
        JSON.stringify({ message: "نام باید بین ۳ تا ۳۰ کاراکتر باشد" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    if (typeof phone !== "string" || phone.trim() === "") {
      return new Response(
        JSON.stringify({ message: "شماره موبایل الزامی است" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    if (role && !["USER", "ADMIN"].includes(role)) {
      return new Response(
        JSON.stringify({ message: "نقش کاربر معتبر نیست" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    const updateData = {
      name: name.trim(),
      phone: phone.trim(),
      email: typeof email === "string" && email.trim()
        ? email.trim().toLowerCase()
        : undefined,
    };

    if (role) {
      updateData.role = role;
    }

    if (updateData.email === undefined) {
      updateData.email = null;
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "کاربر پیدا نشد" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    return new Response(JSON.stringify(user), {
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

export async function PATCH(request, { params }) {
  await connectToDatabase();

  try {
    const { id } = await params;
    const { role } = await request.json();

    if (!["USER", "ADMIN"].includes(role)) {
      return new Response(JSON.stringify({ message: "نقش کاربر معتبر نیست" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true },
    );

    if (!user) {
      return new Response(JSON.stringify({ message: "کاربر پیدا نشد" }), {
        status: 404,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    return new Response(JSON.stringify(user), {
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

export async function DELETE(request, { params }) {
  await connectToDatabase();

  try {
    const { id } = await params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return new Response(JSON.stringify({ message: "کاربر پیدا نشد" }), {
        status: 404,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}
