import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  phone: {
    type: String,
    trim: true,
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
  },

  channel: {
    type: String,
    enum: ["sms", "email"],
    default: "sms",
  },

  code: {
    type: String,
    required: [true, "Code is required"],
  },

  kind: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
    default: 1,
    comment: "1 for register, 2 for login, 3 for set password, 4 for reset password",
  },

  expiresAt: {
    type: Date,
    required: true,
  },

    attempts: {
    type: Number,
    default: 0,
    min: 0,
    max: 3,
  },

}, { timestamps: true });

OtpSchema.pre("validate", function () {
  if (!this.phone && !this.email) {
    this.invalidate("phone", "Phone or email is required");
  }

  if (this.phone && this.email) {
    this.invalidate("email", "Only one identifier is allowed");
  }

  if (this.phone && this.channel !== "sms") {
    this.invalidate("channel", "Phone OTP must use SMS channel");
  }

  if (this.email && this.channel !== "email") {
    this.invalidate("channel", "Email OTP must use email channel");
  }

  if (this.code && !/^\d{6}$/.test(this.code)) {
    this.invalidate("code", "OTP code must contain exactly 6 digits");
  }
});

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);