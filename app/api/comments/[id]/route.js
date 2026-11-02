import connectToDatabase from "@/app/lib/db";
import Comment from "@/models/Comment";
import { requireAdmin } from "@/app/lib/auth";
import mongoose from "mongoose";

export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.authorized) {
      return auth.response;
    }
    await connectToDatabase();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { message: "شناسه نظر معتبر نیست." },
        { status: 400 },
      );
    }
    const body = await request.json();

    if (typeof body.isApproved !== "boolean") {
      return Response.json(
        { message: "وضعیت تأیید نظر معتبر نیست." },
        { status: 400 },
      );
    }

    const { isApproved } = body;

    const comment = await Comment.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true, runValidators: true },
    );

    if (!comment) {
      return new Response(JSON.stringify({ message: "نظر پیدا نشد" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    }

    return new Response(JSON.stringify(comment), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("PATCH COMMENT ERROR:", error);

    return Response.json(
      { message: "خطای داخلی سرور رخ داده است." },
      { status: 500 },
    );
  }
}
