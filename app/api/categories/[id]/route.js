
import connectToDatabase from "@/app/lib/db";
import Category from "@/models/Category";

export async function GET(request, { params }) {
  await connectToDatabase();

  try {
    const { id } = await params;
    const category = await Category.findById(id);

    if (!category) {
      return new Response(
        JSON.stringify({ message: "دسته‌بندی پیدا نشد" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    return new Response(JSON.stringify(category), {
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
    const body = await request.json();

    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim() === ""
    ) {
      return new Response(
        JSON.stringify({ message: "نام دسته‌بندی الزامی می‌باشد" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    const name = body.name.trim();

    if (name.length < 3 || name.length > 30) {
      return new Response(
        JSON.stringify({ message: "نام باید بین ۳ تا ۳۰ کاراکتر باشد" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!category) {
      return new Response(
        JSON.stringify({ message: "دسته‌بندی پیدا نشد" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    return new Response(JSON.stringify(category), {
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
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return new Response(
        JSON.stringify({ message: "دسته‌بندی پیدا نشد" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}
