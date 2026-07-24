import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
    {
        _id: { type: String }, // unique referral ID
        referrerId: { type: String, required: true },
        referredEmail: { type: String, required: true, lowercase: true, trim: true },
        status: { type: String, enum: ["pending", "signed_up", "completed"], default: "pending" },
        creditEarned: { type: Number, default: 0 },
        orderId: { type: String, default: null }
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

const Referral = mongoose.model("Referral", referralSchema);
export default Referral;
