import connectToDatabase from "@/app/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
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
          credentials?.identifier || credentials?.phone
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

        if (
          !identifier ||
          typeof code !== "string" ||
          !/^\d{6}$/.test(code)
        ) {
          throw new Error("اطلاعات ورود معتبر نیست.");
        }

        const user = await User.findOne({
          [identifier.type]: identifier.value,
        });

        if (!user || !user.isActive) {
          throw new Error("کد تأیید یا اطلاعات حساب معتبر نیست.");
        }

        const now = new Date();
        const identifierQuery =
          identifier.type === "email"
            ? { email: identifier.value }
            : { phone: identifier.value };

        const channelQuery =
          identifier.type === "email"
            ? { channel: "email" }
            : {
                $or: [
                  { channel: "sms" },
                  { channel: { $exists: false } },
                ],
              };

        const otp = await Otp.findOne({
          ...identifierQuery,
          ...channelQuery,
          kind: 2,
          expiresAt: { $gt: now },
          attempts: { $lt: 3 },
        }).sort({ createdAt: -1 });

        if (!otp) {
          throw new Error("کد تأیید معتبر نیست یا منقضی شده است.");
        }

        if (otp.code !== code) {
          const updatedOtp = await Otp.findOneAndUpdate(
            {
              _id: otp._id,
              attempts: { $lt: 3 },
              expiresAt: { $gt: new Date() },
            },
            { $inc: { attempts: 1 } },
            { new: true }
          );

          if (updatedOtp && updatedOtp.attempts >= 3) {
            await Otp.deleteOne({
              _id: otp._id,
              attempts: { $gte: 3 },
            });
          }

          throw new Error("کد تأیید اشتباه است.");
        }

        const consumedOtp = await Otp.findOneAndDelete({
          _id: otp._id,
          code,
          attempts: { $lt: 3 },
          expiresAt: { $gt: new Date() },
        });

        if (!consumedOtp) {
          throw new Error("کد تأیید معتبر نیست یا قبلاً استفاده شده است.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
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