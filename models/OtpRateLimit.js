
import mongoose from "mongoose";

const OtpRateLimitSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    windowStart: {
      type: Date,
      required: true,
    },
    blockedUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.OtpRateLimit ||
  mongoose.model("OtpRateLimit", OtpRateLimitSchema);