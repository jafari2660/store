
import connectToDatabase from "@/app/lib/db";
import Tag from "@/models/Tag";
import Product from "@/models/Product";
import mongoose from "mongoose";

const jsonResponse = (data, status) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "شناسه برچسب نامعتبر است" }, 400);
    }

    const tag = await Tag.findById(id);

    if (!tag) {
      return jsonResponse({ message: "برچسب پیدا نشد" }, 404);
    }

    return jsonResponse(tag, 200);
  } catch (error) {
    return jsonResponse({ message: "دریافت برچسب با خطا مواجه شد" }, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "شناسه برچسب نامعتبر است" }, 400);
    }

    const body = await request.json();
    const name = body.name;

    if (typeof name !== "string" || name.trim() === "") {
      return jsonResponse({ message: "نام برچسب الزامی می‌باشد" }, 400);
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 3 || trimmedName.length > 30) {
      return jsonResponse(
        { message: "نام برچسب باید بین ۳ تا ۳۰ کاراکتر باشد" },
        400
      );
    }

    const tag = await Tag.findById(id);

    if (!tag) {
      return jsonResponse({ message: "برچسب پیدا نشد" }, 404);
    }

    tag.name = trimmedName;
    await tag.save();

    return jsonResponse(tag, 200);
  } catch (error) {
    if (error.code === 11000) {
      return jsonResponse({ message: "این نام برچسب قبلاً ثبت شده است" }, 409);
    }

    if (error.name === "ValidationError") {
      return jsonResponse({ message: error.message }, 400);
    }

    return jsonResponse({ message: "ویرایش برچسب با خطا مواجه شد" }, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "شناسه برچسب نامعتبر است" }, 400);
    }

    const tag = await Tag.findById(id);

    if (!tag) {
      return jsonResponse({ message: "برچسب پیدا نشد" }, 404);
    }

    const productsUsingTag = await Product.exists({
      tags: tag._id,
    });

    if (productsUsingTag) {
      return jsonResponse(
        {
          message:
            "این برچسب به یک یا چند محصول متصل است. ابتدا برچسب را از محصولات مربوطه حذف کنید.",
        },
        409
      );
    }

    await Tag.findByIdAndDelete(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return jsonResponse({ message: "حذف برچسب با خطا مواجه شد" }, 500);
  }
}
