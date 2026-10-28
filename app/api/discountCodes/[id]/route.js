import connectToDatabase from "@/app/lib/db";
import DiscountCode from "@/models/DiscountCode";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه کد تخفیف نامعتبر است" },
        { status: 400 }
      );
    }

    const discountCode = await DiscountCode.findById(id).lean();

    if (!discountCode) {
      return Response.json(
        { message: "کد تخفیف یافت نشد" },
        { status: 404 }
      );
    }

    return Response.json(discountCode, { status: 200 });
  } catch (error) {
    console.error("GET discount code error:", error);

    return Response.json(
      { message: "خطا در دریافت کد تخفیف" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه کد تخفیف نامعتبر است" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const { code, percentage, expiresDate, isActive } = body;

    if (typeof code !== "string" || code.trim().length < 3) {
      return Response.json(
        { message: "کد تخفیف باید حداقل ۳ کاراکتر داشته باشد" },
        { status: 400 }
      );
    }

    const numericPercentage = Number(percentage);

    if (
      !Number.isFinite(numericPercentage) ||
      numericPercentage < 1 ||
      numericPercentage > 100
    ) {
      return Response.json(
        { message: "درصد تخفیف باید بین ۱ تا ۱۰۰ باشد" },
        { status: 400 }
      );
    }

    const parsedExpiresDate = new Date(expiresDate);

    if (
      typeof expiresDate !== "string" ||
      !expiresDate.trim() ||
      Number.isNaN(parsedExpiresDate.getTime())
    ) {
      return Response.json(
        { message: "تاریخ انقضا نامعتبر است" },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return Response.json(
        { message: "وضعیت فعال بودن نامعتبر است" },
        { status: 400 }
      );
    }

    const discountCode = await DiscountCode.findByIdAndUpdate(
      id,
      {
        code: code.trim(),
        percentage: numericPercentage,
        expiresDate: parsedExpiresDate,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!discountCode) {
      return Response.json(
        { message: "کد تخفیف یافت نشد" },
        { status: 404 }
      );
    }

    return Response.json(discountCode, { status: 200 });
  } catch (error) {
    console.error("PUT discount code error:", error);

    return Response.json(
      { message: error.message || "خطا در ویرایش کد تخفیف" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه کد تخفیف نامعتبر است" },
        { status: 400 }
      );
    }

    const discountCode = await DiscountCode.findByIdAndDelete(id);

    if (!discountCode) {
      return Response.json(
        { message: "کد تخفیف یافت نشد" },
        { status: 404 }
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE discount code error:", error);

    return Response.json(
      { message: "خطا در حذف کد تخفیف" },
      { status: 500 }
    );
  }
}