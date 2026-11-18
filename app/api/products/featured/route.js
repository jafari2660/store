
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();

    const featuredProducts = await Product.find({})
      .sort({ views: -1 })
      .limit(8)
      .select("name price image category views")
      .lean();

    return NextResponse.json(featuredProducts, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("FEATURED PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        error: "مشکلی در دریافت محصولات پربازدید رخ داده است",
      },
      { status: 500 }
    );
  }
}
