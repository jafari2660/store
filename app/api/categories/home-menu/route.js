  import connectToDatabase from "@/app/lib/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();

  try {
    const categories = await Category.find({}).select("name");

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "مشکلی در دریافت دسته بندی ها  رخ داده است",
      },
      { status: 500 }
    );
  }
}
