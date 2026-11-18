import connectToDatabase from "@/app/lib/db";
import Product from "@/models/Product";
import ProductFile from "@/models/ProductFile";
import { requireAdmin } from "@/app/lib/auth";
import mongoose from "mongoose";
import { join } from "path";
import { unlink } from "fs/promises";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const { productId, fileId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(fileId)
    ) {
      return Response.json({ message: "شناسه نامعتبر است." }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findById(productId);

    if (!product) {
      return Response.json({ message: "محصول پیدا نشد." }, { status: 404 });
    }

    const file = await ProductFile.findOne({
      _id: fileId,
      product: productId,
    });

    if (!file) {
      return Response.json({ message: "فایل پیدا نشد." }, { status: 404 });
    }

    const body = await request.json();
    const { author, speaker, translator } = body;

    // اعتبارسنجی نویسنده
    if (
      typeof author !== "string" ||
      author.trim().length < 2 ||
      author.trim().length > 100
    ) {
      return Response.json(
        {
          message: "نام نویسنده باید بین ۲ تا ۱۰۰ کاراکتر باشد.",
        },
        { status: 400 },
      );
    }

    // اعتبارسنجی مترجم
    if (translator !== undefined && typeof translator !== "string") {
      return Response.json(
        { message: "نام مترجم معتبر نیست." },
        { status: 400 },
      );
    }

    const updatedTranslator =
      typeof translator === "string" ? translator.trim() : "";

    if (updatedTranslator.length > 100) {
      return Response.json(
        {
          message: "نام مترجم نباید بیشتر از ۱۰۰ کاراکتر باشد.",
        },
        { status: 400 },
      );
    }

    const isAudioFile = ["mp3", "wav", "m4a"].includes(
      String(file.extension).toLowerCase(),
    );

    let updatedSpeaker = file.speaker || "";

    if (isAudioFile) {
      if (speaker !== undefined && typeof speaker !== "string") {
        return Response.json(
          { message: "نام گوینده معتبر نیست." },
          { status: 400 },
        );
      }

      if (speaker !== undefined) {
        updatedSpeaker = speaker.trim();
      }

      if (updatedSpeaker.length < 2 || updatedSpeaker.length > 100) {
        return Response.json(
          {
            message: "نام گوینده باید بین ۲ تا ۱۰۰ کاراکتر باشد.",
          },
          { status: 400 },
        );
      }
    } else {
      updatedSpeaker = "";
    }

    // ذخیره اطلاعات
    file.author = author.trim();
    file.translator = updatedTranslator;
    file.speaker = updatedSpeaker;

    await file.save();

    const updatedFile = {
      _id: file._id,
      title: file.title,
      author: file.author,
      translator: file.translator,
      speaker: file.speaker,
      extension: file.extension,
      size: file.size,
    };

    return Response.json({
      message: "اطلاعات فایل با موفقیت ویرایش شد.",
      author: file.author,
      translator: file.translator,
      speaker: file.speaker,
      file: updatedFile,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { message: "خطا در ویرایش اطلاعات فایل." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const { productId, fileId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(fileId)
    ) {
      return Response.json({ message: "شناسه نامعتبر است." }, { status: 400 });
    }

    await connectToDatabase();

    const file = await ProductFile.findOne({
      _id: fileId,
      product: productId,
    });

    if (!file) {
      return Response.json({ message: "فایل پیدا نشد." }, { status: 404 });
    }

    const path = join(
      process.cwd(),
      "private_uploads",
      "products",
      productId,
      file.storedName,
    );

    await unlink(path).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });

    await ProductFile.deleteOne({
      _id: fileId,
    });

    return Response.json({
      message: "فایل حذف شد.",
    });
  } catch (error) {
    console.error(error);

    return Response.json({ message: "خطا در حذف فایل." }, { status: 500 });
  }
}
