import { getToken } from "next-auth/jwt";

export async function requireAdmin(request) {
  try {

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return {
        authorized: false,
        response: Response.json(
          {
            message: "ابتدا وارد حساب کاربری شوید.",
          },
          { status: 401 }
        ),
      };
    }

    if (token.role !== "ADMIN") {
      return {
        authorized: false,
        response: Response.json(
          {
            message: "شما اجازه دسترسی به این بخش را ندارید.",
          },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      token,
    };

  } catch (error) {
    console.error("Admin Authorization Error:", error);

    return {
      authorized: false,
      response: Response.json(
        {
          message: "خطا در بررسی دسترسی.",
        },
        { status: 500 }
      ),
    };
  }
}

export async function requireUser(request) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.id) {
      return {
        authorized: false,
        response: Response.json(
          { message: "ابتدا وارد حساب کاربری شوید." },
          { status: 401 }
        ),
      };
    }

    return {
      authorized: true,
      token,
    };
  } catch (error) {
    console.error("User Authorization Error:", error);

    return {
      authorized: false,
      response: Response.json(
        { message: "خطا در بررسی احراز هویت." },
        { status: 500 }
      ),
    };
  }
}