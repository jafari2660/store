
import mongoose from "mongoose";

const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
      maxlength: [50, "Tag name cannot exceed 50 characters"],
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
  },
  { timestamps: true }
);

TagSchema.pre("validate", function () {
  if (this.name) {
    this.normalizedName = this.name
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }
});

export default mongoose.models.Tag ||
  mongoose.model("Tag", TagSchema);
