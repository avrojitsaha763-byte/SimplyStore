import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        _id: { type: String }, // custom code or generated id
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        discount: { type: Number, required: true },
        type: { type: String, enum: ["percent", "percentage", "flat"], required: true },
        minOrder: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
        vendorId: { type: String, default: null }, // null means platform-wide admin coupon
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

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
