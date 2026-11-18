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

    fileTypes: {
      type: [
        {
          type: String,
          enum: ["PDF", "DOCX", "AUDIO", "ZIP", "RAR"],
        },
      ],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "حداقل یک نوع فایل باید انتخاب شود.",
      },
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
    discountPrice: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: function (value) {
          if (value == null) return true;

          const originalPrice = this.price ?? this.getUpdate?.()?.$set?.price;

          if (originalPrice == null) return true;

          return Number(value) < Number(originalPrice);
        },
        message: "قیمت تخفیفی باید کمتر از قیمت اصلی باشد",
      },
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
