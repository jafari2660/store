
import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import ProductFile from "@/models/ProductFile";
import { requireAdmin } from "@/app/lib/auth";
import mongoose from "mongoose";
import { randomUUID, createHash } from "crypto";
import { extname, join } from "path";
import { mkdir, writeFile, unlink } from "fs/promises";

export const runtime = "nodejs";

const allowedExtensionsByType = {
  PDF: ["pdf"],
  DOCX: ["docx"],
  AUDIO: ["mp3", "wav", "m4a"],
  ZIP: ["zip"],
  RAR: ["rar"],
};

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

    const files = await ProductFile.find({
      product: productId,
    })
      .select(
        "_id title author speaker originalName extension size order createdAt"
      )
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

    const productType = String(product.fileType || "").toUpperCase();

    const allowedExtensions =
      allowedExtensionsByType[productType];

    if (!allowedExtensions) {
      return Response.json(
        {
          message:
            "نوع محصول معتبر نیست یا فرمت مجازی برای آن تعریف نشده است.",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const title = formData.get("title");
    const author = formData.get("author");
    const speaker = formData.get("speaker");

    if (!file || typeof file === "string" || file.size === 0) {
      return Response.json(
        { message: "فایلی انتخاب نشده است." },
        { status: 400 }
      );
    }

    if (
      typeof author !== "string" ||
      author.trim().length < 2 ||
      author.trim().length > 100
    ) {
      return Response.json(
        {
          message: "نام نویسنده باید بین ۲ تا ۱۰۰ کاراکتر باشد.",
        },
        { status: 400 }
      );
    }

    if (productType === "AUDIO") {
      if (
        typeof speaker !== "string" ||
        speaker.trim().length < 2 ||
        speaker.trim().length > 100
      ) {
        return Response.json(
          {
            message: "نام گوینده باید بین ۲ تا ۱۰۰ کاراکتر باشد.",
          },
          { status: 400 }
        );
      }
    }

    const extension = extname(file.name)
      .slice(1)
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return Response.json(
        {
          message: `برای این محصول فقط فرمت ${allowedExtensions.join("، ")} مجاز است.`,
        },
        { status: 400 }
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      return Response.json(
        { message: "حداکثر حجم فایل ۱۰۰ مگابایت است." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileHash = createHash("sha256")
      .update(buffer)
      .digest("hex");

    const duplicateFile = await ProductFile.findOne({
      product: productId,
      fileHash,
    });

    if (duplicateFile) {
      return Response.json(
        {
          message: "این فایل قبلاً برای این محصول آپلود شده است.",
        },
        { status: 409 }
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

    await writeFile(savedPath, buffer);

    const count = await ProductFile.countDocuments({
      product: productId,
    });

    const newFile = await ProductFile.create({
      product: productId,

      title:
        typeof title === "string" && title.trim()
          ? title.trim()
          : file.name,

      author: author.trim(),

      speaker:
        productType === "AUDIO"
          ? speaker.trim()
          : "",

      originalName: file.name,
      storedName,
      extension,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      order: count,
      fileHash,
    });

    return Response.json(
      {
        _id: newFile._id,
        title: newFile.title,
        author: newFile.author,
        speaker: newFile.speaker,
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
