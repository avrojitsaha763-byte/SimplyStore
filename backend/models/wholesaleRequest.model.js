import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: { type: String, required: true },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now }
    },
    { _id: false }
);

const wholesaleRequestSchema = new mongoose.Schema(
    {
        _id: { type: String }, // unique ID
        buyerId: { type: String, required: true },
        buyerName: { type: String, required: true },
        vendorId: { type: String, required: true },
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        offeredPrice: { type: Number, required: true },
        status: { type: String, enum: ["Pending", "Countered", "Accepted", "Rejected"], default: "Pending" },
        messages: [messageSchema]
    },
    {
        timestamps: true,
        _id: false,
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

const WholesaleRequest = mongoose.model("WholesaleRequest", wholesaleRequestSchema);
export default WholesaleRequest;
