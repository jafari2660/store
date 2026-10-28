import connectToDatabase from "@/app/lib/db";
import DiscountCode from "@/models/DiscountCode";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    await connectToDatabase();

    const discountCodes = await DiscountCode.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(discountCodes, {
      status: 200,
    });
  } catch (error) {
    console.error("GET DISCOUNT CODES ERROR:", error);

    return NextResponse.json(
      { message: "خطا در دریافت کدهای تخفیف" },
      { status: 500 },
    );
  }
}


export async function POST(request) {
  try {
    await connectToDatabase();

    const data = await request.json();

    const code =
      typeof data.code === "string"
        ? data.code.trim().toUpperCase()
        : "";

    const percentage = data.percentage;
    const expiresDate = data.expiresDate;

    if (!code) {
      return NextResponse.json(
        { message: "کد تخفیف الزامی است" },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(percentage) ||
      percentage < 1 ||
      percentage > 100
    ) {
      return NextResponse.json(
        { message: "درصد تخفیف باید عددی بین ۱ تا ۱۰۰ باشد" },
        { status: 400 },
      );
    }

    if (
      typeof expiresDate !== "string" ||
      !expiresDate.trim() ||
      Number.isNaN(Date.parse(expiresDate))
    ) {
      return NextResponse.json(
        { message: "تاریخ انقضا معتبر نیست" },
        { status: 400 },
      );
    }

    const expirationDate = new Date(expiresDate);

    if (expirationDate <= new Date()) {
      return NextResponse.json(
        { message: "تاریخ انقضا باید در آینده باشد" },
        { status: 400 },
      );
    }

    const discountCode = await DiscountCode.create({
      code,
      percentage,
      expiresDate: expirationDate,
      isActive: true,
    });

    return NextResponse.json(discountCode, {
      status: 201,
    });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "این کد تخفیف قبلاً ثبت شده است" },
        { status: 409 },
      );
    }

    console.error("CREATE DISCOUNT CODE ERROR:", error);

    return NextResponse.json(
      { message: "خطا در ایجاد کد تخفیف" },
      { status: 500 },
    );
  }
}


