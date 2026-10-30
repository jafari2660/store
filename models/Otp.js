import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    code: {
      type: String,
      required: [true, "Code is required"],
    },
    kind: {
      type: Number,
      required: [true, "Kind is required"],
      default:1,
      comment :"1 for register , 2 for login"
    },
     expiresAt: {
      type: Date,
      required: [true, "ExpiresAt is required"],
    },
  },
  { timestamps: true },
);

export default mongoose.models.Otp ||
  mongoose.model("Otp", OtpSchema);
