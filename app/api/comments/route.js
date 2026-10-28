import connectToDatabase from "@/app/lib/db";
import Comment from "@/models/Comment";
import User from "@/models/User";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    const comments = await Comment.find({})
      .populate({ path: "user", model: User, select: "name phone" })
      .populate({ path: "product", model: Product, select: "name" })
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(comments), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
     console.error("GET COMMENTS ERROR:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}