
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const LIMIT = 12;

const ALLOWED_FILE_TYPES = [
  "PDF",
  "DOCX",
  "AUDIO",
  "ZIP",
  "RAR",
];

const ALLOWED_SORTS = [
  "newest",
  "cheapest",
  "expensive",
  "popular",
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readPrice(value) {
  if (value === null || value.trim() === "") return null;

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return NaN;
  }

  return number;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // اعتبارسنجی شناسه دسته‌بندی
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "شناسه دسته‌بندی معتبر نیست." },
        { status: 400 }
      );
    }

    // دریافت پارامترهای URL
    const searchParams = new URL(request.url).searchParams;

    const pageValue = Number(searchParams.get("page") || 1);

    const page =
      Number.isInteger(pageValue) && pageValue > 0
        ? pageValue
        : 1;

    const sortValue = searchParams.get("sort") || "newest";

    const sort = ALLOWED_SORTS.includes(sortValue)
      ? sortValue
      : "newest";

    const minPrice = readPrice(searchParams.get("minPrice"));
    const maxPrice = readPrice(searchParams.get("maxPrice"));

    const inStock = searchParams.get("inStock") === "true";
    const discounted = searchParams.get("discounted") === "true";

    const fileTypeValue = (
      searchParams.get("fileType") || ""
    ).trim().toUpperCase();

    const fileType = ALLOWED_FILE_TYPES.includes(fileTypeValue)
      ? fileTypeValue
      : "";

    const query = (searchParams.get("q") || "")
      .trim()
      .slice(0, 80);

    // اعتبارسنجی قیمت‌ها
    if (Number.isNaN(minPrice) || Number.isNaN(maxPrice)) {
      return NextResponse.json(
        { message: "قیمت واردشده معتبر نیست." },
        { status: 400 }
      );
    }

    if (
      minPrice !== null &&
      maxPrice !== null &&
      minPrice > maxPrice
    ) {
      return NextResponse.json(
        {
          message:
            "حداقل قیمت نمی‌تواند از حداکثر قیمت بیشتر باشد.",
        },
        { status: 400 }
      );
    }

    // اتصال به دیتابیس
    await connectToDatabase();

    // بررسی وجود دسته‌بندی
    const category = await Category.findById(id)
      .select("name")
      .lean();

    if (!category) {
      return NextResponse.json(
        { message: "دسته‌بندی پیدا نشد." },
        { status: 404 }
      );
    }

    // فیلتر پایه محصولات
    const matchFilter = {
      category: new mongoose.Types.ObjectId(id),
      isActive: true,
      saleStatus: true,
    };

    if (inStock) {
      matchFilter.stock = { $gt: 0 };
    }

    if (fileType) {
      matchFilter.fileTypes = fileType;
    }

    if (query) {
      matchFilter.name = {
        $regex: escapeRegex(query),
        $options: "i",
      };
    }

    // مراحل مشترک فیلتر
    const filterStages = [
      {
        $match: matchFilter,
      },

      {
        $addFields: {
          effectivePrice: {
            $cond: [
              {
                $and: [
                  { $ne: ["$discountPrice", null] },
                  { $lt: ["$discountPrice", "$price"] },
                ],
              },
              "$discountPrice",
              "$price",
            ],
          },
        },
      },

      {
        $addFields: {
          isDiscounted: {
            $lt: ["$effectivePrice", "$price"],
          },
        },
      },

      ...(discounted
        ? [{ $match: { isDiscounted: true } }]
        : []),

      ...(minPrice !== null
        ? [
            {
              $match: {
                effectivePrice: { $gte: minPrice },
              },
            },
          ]
        : []),

      ...(maxPrice !== null
        ? [
            {
              $match: {
                effectivePrice: { $lte: maxPrice },
              },
            },
          ]
        : []),
    ];

    // شمارش کل محصولات
    const countResult = await Product.aggregate([
      ...filterStages,
      { $count: "total" },
    ]);

    const totalItems = countResult[0]?.total || 0;

    const totalPages = Math.ceil(totalItems / LIMIT);

    const currentPage = Math.min(
      page,
      Math.max(totalPages, 1)
    );

    const skip = (currentPage - 1) * LIMIT;

    // تنظیمات مرتب‌سازی
    const sortOptions = {
      newest: { createdAt: -1, _id: -1 },
      cheapest: { effectivePrice: 1, _id: -1 },
      expensive: { effectivePrice: -1, _id: -1 },
      popular: { views: -1, _id: -1 },
    };

    // دریافت محصولات
    const products = await Product.aggregate([
      ...filterStages,

      { $sort: sortOptions[sort] },

      { $skip: skip },

      { $limit: LIMIT },

      {
        $project: {
          name: 1,
          image: 1,
          price: 1,
          discountPrice: 1,
          effectivePrice: 1,
          isDiscounted: 1,
          stock: 1,
          views: 1,
          fileTypes: 1,
          createdAt: 1,
        },
      },
    ]);

    // پاسخ نهایی
    return NextResponse.json(
      {
        category: {
          _id: category._id,
          name: category.name,
        },

        products,

        pagination: {
          currentPage,
          totalPages,
          totalItems,
          limit: LIMIT,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

  } catch (error) {
    console.error(
      "خطا در دریافت محصولات دسته‌بندی:",
      error
    );

    return NextResponse.json(
      {
        message: "در دریافت محصولات مشکلی رخ داد.",
      },
      { status: 500 }
    );
  }
}
