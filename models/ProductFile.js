import mongoose from "mongoose";

const ProductFileSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    storedName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    extension: {
      type: String,
      required: true,
      lowercase: true,
     enum: ["pdf", "zip", "rar", "mp3", "wav", "m4a"],
    },

    mimeType: {
      type: String,
      default: "application/octet-stream",
    },

    size: {
      type: Number,
      required: true,
      min: 1,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

ProductFileSchema.index({ product: 1, order: 1 });

export default mongoose.models.ProductFile ||
  mongoose.model("ProductFile", ProductFileSchema);
