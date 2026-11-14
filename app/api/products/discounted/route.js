import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const products = await Product.find({
      isActive: true,
      saleStatus: true,
      discountPrice: { $gt: 0, $ne: null },
      $expr: { $lt: ["$discountPrice", "$price"] },
    })
      .select("name price discountPrice image")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Discounted products error:", error);

    return NextResponse.json(
      { message: "خطا در دریافت کتاب‌های تخفیف‌خورده" },
      { status: 500 }
    );
  }
}