
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();

    const products = await Product.find({
      isActive: true,
    })
      .select("name price image category createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .limit(12)
      .lean();

    return NextResponse.json(products, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Latest products error:", error);

    return NextResponse.json(
      { message: "خطا در دریافت تازه‌ترین کتاب‌ها" },
      { status: 500 }
    );
  }
}
