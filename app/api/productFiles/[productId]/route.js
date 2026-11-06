
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import ProductFile from "@/models/ProductFile";
import { requireAdmin } from "@/app/lib/auth";
import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { extname, join } from "path";
import { mkdir, writeFile, unlink } from "fs/promises";

export const runtime = "nodejs";

const allowedExtensions = ["pdf", "zip", "rar", "mp3", "wav", "m4a"];

export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const { productId } = await params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return Response.json(
        { message: "شناسه محصول نامعتبر است." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) {
      return Response.json(
        { message: "محصول پیدا نشد." },
        { status: 404 }
      );
    }

    const files = await ProductFile.find({ product: productId })
      .select("_id title originalName extension size order createdAt")
      .sort({ order: 1 });

    return Response.json(files);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "خطا در دریافت فایل‌ها." },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  let savedPath;

  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const { productId } = await params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return Response.json(
        { message: "شناسه محصول نامعتبر است." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) {
      return Response.json(
        { message: "محصول پیدا نشد." },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title");

    if (!file || typeof file === "string" || file.size === 0) {
      return Response.json(
        { message: "فایلی انتخاب نشده است." },
        { status: 400 }
      );
    }

    const extension = extname(file.name).slice(1).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return Response.json(
        { message: "فرمت فایل مجاز نیست." },
        { status: 400 }
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      return Response.json(
        { message: "حداکثر حجم فایل ۱۰۰ مگابایت است." },
        { status: 400 }
      );
    }

    const storedName = `${randomUUID()}.${extension}`;
    const uploadDir = join(
      process.cwd(),
      "private_uploads",
      "products",
      productId
    );

    savedPath = join(uploadDir, storedName);

    await mkdir(uploadDir, { recursive: true });

    await writeFile(
      savedPath,
      Buffer.from(await file.arrayBuffer())
    );

    const count = await ProductFile.countDocuments({
      product: productId,
    });

    const newFile = await ProductFile.create({
      product: productId,
      title:
        typeof title === "string" && title.trim()
          ? title.trim()
          : file.name,
      originalName: file.name,
      storedName,
      extension,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      order: count,
    });

    return Response.json(
      {
        _id: newFile._id,
        title: newFile.title,
        originalName: newFile.originalName,
        extension: newFile.extension,
        size: newFile.size,
        order: newFile.order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    if (savedPath) {
      await unlink(savedPath).catch(() => {});
    }

    return Response.json(
      { message: "خطا در ذخیره فایل." },
      { status: 500 }
    );
  }
}
