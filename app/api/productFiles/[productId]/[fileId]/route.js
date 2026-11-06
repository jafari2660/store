
import connectToDatabase from "@/app/lib/db";
import ProductFile from "@/models/ProductFile";
import { requireAdmin } from "@/app/lib/auth";
import mongoose from "mongoose";
import { join } from "path";
import { unlink } from "fs/promises";

export const runtime = "nodejs";

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return auth.response;

    const { productId, fileId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(fileId)
    ) {
      return Response.json(
        { message: "شناسه نامعتبر است." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const file = await ProductFile.findOne({
      _id: fileId,
      product: productId,
    });

    if (!file) {
      return Response.json(
        { message: "فایل پیدا نشد." },
        { status: 404 }
      );
    }

    const path = join(
      process.cwd(),
      "private_uploads",
      "products",
      productId,
      file.storedName
    );

    await unlink(path).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });

    await ProductFile.deleteOne({ _id: fileId });

    return Response.json({ message: "فایل حذف شد." });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "خطا در حذف فایل." },
      { status: 500 }
    );
  }
}
