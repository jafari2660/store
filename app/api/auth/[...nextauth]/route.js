import connectToDatabase from "@/app/lib/db";
import Otp from "@/models/Otp";
import User from "@/models/User";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "OTP", type: "text" },
      },

      async authorize(credentials) {
        try {
          await connectToDatabase();

          const { phone, code } = credentials || {};

          if (!phone || !code) {
            throw new Error("شماره موبایل و کد تأیید الزامی است.");
          }

          const otp = await Otp.findOne({
            phone,
            code,
            kind: 2,
          });

          if (!otp) {
            throw new Error("کد تأیید صحیح نیست.");
          }

          if (otp.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otp._id });
            throw new Error("کد تأیید منقضی شده است.");
          }

          const user = await User.findOne({ phone });

          if (!user) {
            throw new Error("کاربر یافت نشد.");
          }

          if (!user.isActive) {
            throw new Error("حساب کاربری شما غیرفعال است.");
          }

          await Otp.deleteOne({ _id: otp._id });

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
