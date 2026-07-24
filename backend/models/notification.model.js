import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        _id: { type: String }, // custom ID
        userId: { type: String, required: true }, // recipient user ID
        type: { type: String, enum: ["order_update", "price_drop", "back_in_stock", "flash_sale", "system"], required: true },
        title: { type: String, required: true },
        body: { type: String, required: true },
        link: { type: String, default: "" }, // link to page
        read: { type: Boolean, default: false },
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
            },
        },
    }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
