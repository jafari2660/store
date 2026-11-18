
import mongoose from "mongoose";

const SlideSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "تصویر اسلاید الزامی است"],
      trim: true,
    },

    link: {
      type: String,
      required: [true, "لینک اسلاید الزامی است"],
      trim: true,
    },

    position: {
      type: String,
      enum: ["main", "sideTop", "sideBottom"],
      required: true,
      default: "main",
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
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

export default mongoose.models.Slide ||
  mongoose.model("Slide", SlideSchema);
