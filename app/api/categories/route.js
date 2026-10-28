
import connectToDatabase from "@/app/lib/db";
import Category from "@/models/Category";

export async function GET(request) {
  try {
    await connectToDatabase();

    const categories = await Category.find({});

    return new Response(JSON.stringify(categories), {
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
    const name = body.name;

    if (
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      return new Response(
        JSON.stringify({ message: "نام دسته‌بندی الزامی می‌باشد" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 3 || trimmedName.length > 30) {
      return new Response(
        JSON.stringify({ message: "طول نام باید بین ۳ تا ۳۰ حرف باشد" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    const category = await Category.create({ name: trimmedName });

    return new Response(JSON.stringify(category), {
      status: 201,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}
