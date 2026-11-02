import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {

      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      enum: ["PENDING", "SUCCESS", "FAILED"],

      type: String,
      default: "PENDING",
      required: true,
    },

    transactionId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true }
);

PurchaseSchema.index(
  { user: 1, product: 1, status: 1 },
  { name: "user_product_purchase_status" }
);


export default mongoose.models.Purchase ||
  mongoose.model("Purchase", PurchaseSchema);
