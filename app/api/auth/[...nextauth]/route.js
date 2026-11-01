import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          await connectToDatabase();

          const { phone, password } = credentials || {};

          if (
            typeof phone !== "string" ||
            typeof password !== "string" ||
            !phone.trim() ||
            !password
          ) {
            throw new Error("شماره موبایل و رمز عبور الزامی است.");
          }

          const normalizedPhone = phone.trim();

          // دریافت کاربر و رمز عبور از دیتابیس
          const user = await User.findOne({
            phone: normalizedPhone,
          }).select("+password");

          if (!user || !user.password) {
            throw new Error("شماره موبایل یا رمز عبور اشتباه است.");
          }

          if (!user.isActive) {
            throw new Error("حساب کاربری شما غیرفعال است.");
          }

          // بررسی رمز عبور
          const isValid = await bcrypt.compare(
            password,
            user.password
          );

          if (!isValid) {
            throw new Error("شماره موبایل یا رمز عبور اشتباه است.");
          }

          return {
            id: user._id.toString(),
            phone: user.phone,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Login Error:", error);
          throw error;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.phone = user.phone;
        token.email = user.email;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        phone: token.phone,
        email: token.email,
        role: token.role,
      };

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
