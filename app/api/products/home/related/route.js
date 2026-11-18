
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
    const {searchParams} = new URL(req.url);
    const categoryId =searchParams.get("category");
     
    if (!categoryId) {
      return NextResponse.json(
        { message: "محصولی با این دسته بندی در دیتابیس پیدا نشد", id },
        { status: 404 }
      );
    }

      await connectToDatabase();
  
    try {
   

    const relatedProducts = await Product.find({category: categoryId}).limit(8)
      
      .select("name price image category")
      .lean();

    if (!relatedProducts) {
      return NextResponse.json(
        { message: "محصولی با این شناسه در دیتابیس پیدا نشد", id },
        { status: 404 }
      );
    }

    return NextResponse.json(relatedProducts, { status: 200 });

  } catch (error) {
    console.error("GET HOME PRODUCT ERROR:", error);

    return NextResponse.json(
      { message: error.message || "خطا در دریافت محصول" },
      { status: 500 }
    );
  }
}
