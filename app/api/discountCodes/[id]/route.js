import connectToDatabase from "@/app/lib/db";
import DiscountCode from "@/models/DiscountCode";
import mongoose from "mongoose";
import { requireAdmin } from "@/app/lib/auth";

export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه کد تخفیف نامعتبر است" },
        { status: 400 },
      );
    }

    const discountCode = await DiscountCode.findById(id).lean();

    if (!discountCode) {
      return Response.json({ message: "کد تخفیف یافت نشد" }, { status: 404 });
    }

    return Response.json(discountCode, { status: 200 });
  } catch (error) {
    console.error("GET discount code error:", error);

    return Response.json(
      { message: "خطا در دریافت کد تخفیف" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه کد تخفیف نامعتبر است" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { code, percentage, expiresDate, isActive } = body;

    if (typeof code !== "string" || code.trim().length < 3) {
      return Response.json(
        { message: "کد تخفیف باید حداقل ۳ کاراکتر داشته باشد" },
        { status: 400 },
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
        { status: 400 },
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
        { status: 400 },
      );
    }

    if (typeof isActive !== "boolean") {
      return Response.json(
        { message: "وضعیت فعال بودن نامعتبر است" },
        { status: 400 },
      );
    }

    const discountCode = await DiscountCode.findByIdAndUpdate(
      id,
      {
       code: code.trim().toUpperCase(),
        percentage: numericPercentage,
        expiresDate: parsedExpiresDate,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!discountCode) {
      return Response.json({ message: "کد تخفیف یافت نشد" }, { status: 404 });
    }

    return Response.json(discountCode, { status: 200 });
  } catch (error) {
    if (error.code === 11000) {
  return Response.json(
    { message: "این کد تخفیف قبلاً ثبت شده است." },
    { status: 409 }
  );
}
    console.error("PUT discount code error:", error);

    return Response.json(
      { message: error.message || "خطا در ویرایش کد تخفیف" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }
    await connectToDatabase();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه کد تخفیف نامعتبر است" },
        { status: 400 },
      );
    }

    const discountCode = await DiscountCode.findByIdAndDelete(id);

    if (!discountCode) {
      return Response.json({ message: "کد تخفیف یافت نشد" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE discount code error:", error);

    return Response.json({ message: "خطا در حذف کد تخفیف" }, { status: 500 });
  }
}
