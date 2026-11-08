import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import { verifyOtp } from "@/app/lib/verifyOtp";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import bcrypt from "bcryptjs";

function normalizeIdentifier(value) {
  if (typeof value !== "string") return null;

  const raw = value.trim();

  if (raw.includes("@")) {
    const email = raw.toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
      ? { type: "email", value: email }
      : null;
  }

  let phone = raw;

  if (phone.startsWith("+98")) {
    phone = `0${phone.slice(3)}`;
  } else if (phone.startsWith("9")) {
    phone = `0${phone}`;
  }

  if (!/^09\d{9}$/.test(phone)) return null;

  return { type: "phone", value: phone };
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await connectToDatabase();

        const identifier = normalizeIdentifier(
          credentials?.identifier || credentials?.phone,
        );

        const password = credentials?.password;

        if (!identifier || typeof password !== "string" || !password) {
          throw new Error("اطلاعات ورود معتبر نیست.");
        }

        const user = await User.findOne({
          [identifier.type]: identifier.value,
        }).select("+password");

        if (!user || !user.password) {
          throw new Error("اطلاعات ورود اشتباه است.");
        }

        if (!user.isActive) {
          throw new Error("حساب کاربری شما غیرفعال است.");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error("اطلاعات ورود اشتباه است.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          authVersion: user.authVersion ?? 0,
        };
      },
    }),

    CredentialsProvider({
      id: "otp-login",
      name: "OTP Login",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        code: { label: "OTP Code", type: "text" },
      },

      async authorize(credentials) {
        await connectToDatabase();

        const identifier = normalizeIdentifier(credentials?.identifier);
        const code = credentials?.code;

        if (!identifier || typeof code !== "string" || !/^\d{6}$/.test(code)) {
          throw new Error("اطلاعات ورود معتبر نیست.");
        }

        const user = await User.findOne({
          [identifier.type]: identifier.value,
        });

        if (!user || !user.isActive) {
          throw new Error("کد تأیید یا اطلاعات حساب معتبر نیست.");
        }
        const otpResult = await verifyOtp({
          phone: identifier.type === "phone" ? identifier.value : undefined,

          email: identifier.type === "email" ? identifier.value : undefined,

          code: code.trim(),
          kind: 2,
        });

        if (!otpResult.success) {
          throw new Error(otpResult.message);
        }

        return {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
           authVersion: user.authVersion ?? 0,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },

  jwt: {
    maxAge: 8 * 60 * 60,
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
        token.authVersion = user.authVersion ?? 0;
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
         authVersion: token.authVersion ?? 0,
      };

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
