import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },      // product _id
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        selectedColor: { type: String, default: null },
        selectedSize: { type: String, default: null },
    },
    { _id: false }
);

const shippingDetailsSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        phone: { type: String, required: true },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        _id: { type: String },
        userId: { type: String, default: null },
        items: [orderItemSchema],
        shippingDetails: { type: shippingDetailsSchema, required: true },
        paymentMethod: { type: String, required: true },
        total: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
            default: "Pending",
        },
        tracking: { type: String, default: null },
        gst: {
            rate: { type: Number, default: 0 },
            cgst: { type: Number, default: 0 },
            sgst: { type: Number, default: 0 },
            igst: { type: Number, default: 0 },
            invoiceNumber: { type: String, default: null },
        },
    },
    {
        timestamps: true,
        _id: false,
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                ret.createdAt = ret.createdAt ?? ret.updatedAt;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
