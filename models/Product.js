
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "نام محصول الزامی است"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    file: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tag",
        },
      ],
      default: [],
    },
    fileType: {
      type: String,
      enum: ["PDF", "DOCX", "AUDIO", "ZIP", "RAR"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    saleStatus: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    discountPrice: {
      type: Number,
      default: null,
      min: 0,
      validate: [
        {
          validator: function (value) {
            return value == null || value < this.price;
          },
          message: "قیمت تخفیفی باید کمتر از قیمت اصلی باشد",
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
