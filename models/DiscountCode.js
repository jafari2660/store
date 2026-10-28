import mongoose from "mongoose";

const DiscountCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "کد تخفیف الزامی است"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    percentage: {
      type: Number,
      required: [true, "درصد تخفیف الزامی است"],
      min: 1,
      max: 100,
    },

    expiresDate: {
      type: Date,
      required: [true, "تاریخ انقضا الزامی است"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DiscountCode ||
  mongoose.model("DiscountCode", DiscountCodeSchema);

