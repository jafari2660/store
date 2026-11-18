
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "شناسه محصول نامعتبر است" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findById(id)
      .populate("category", "name")
      .select(
        "name description price discountPrice image category stock views saleStatus isActive"
      )
      .lean();

    if (!product) {
      return NextResponse.json(
        { message: "محصولی با این شناسه در دیتابیس پیدا نشد", id },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });

  } catch (error) {
    console.error("GET HOME PRODUCT ERROR:", error);

    return NextResponse.json(
      { message: error.message || "خطا در دریافت محصول" },
      { status: 500 }
    );
  }
}
