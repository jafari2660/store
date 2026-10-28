
import connectToDatabase from "@/app/lib/db";
import Tag from "@/models/Tag";

export async function GET(request) {
  try {
    await connectToDatabase();

    const tags = await Tag.find({}).sort({ createdAt: -1 });

    return new Response(JSON.stringify(tags), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "دریافت برچسب ها با خطا مواجه شد" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const name = body.name;

    if (typeof name !== "string" || name.trim() === "") {
      return new Response(
        JSON.stringify({ message: "نام برچسب الزامی می‌باشد" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 3 || trimmedName.length > 30) {
      return new Response(
        JSON.stringify({
          message: "طول نام برچسب باید بین ۳ تا ۳۰ کاراکتر باشد",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    const tag = await Tag.create({ name: trimmedName });

    return new Response(JSON.stringify(tag), {
      status: 201,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return new Response(
        JSON.stringify({ message: "این برچسب قبلاً ثبت شده است" }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    if (error.name === "ValidationError") {
      return new Response(
        JSON.stringify({ message: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "ثبت برچسب ها با خطا مواجه شد" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }
}
