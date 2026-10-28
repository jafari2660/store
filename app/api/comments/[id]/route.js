import connectToDatabase from "@/app/lib/db";
import Comment from "@/models/Comment";

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const { isApproved } = await request.json();

    const comment = await Comment.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true, runValidators: true },
    );

    if (!comment) {
      return new Response(
        JSON.stringify({ message: "نظر پیدا نشد" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }

    return new Response(JSON.stringify(comment), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }
}