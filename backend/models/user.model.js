import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        _id: { type: String },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "vendor", "customer"], default: "customer" },
        shopName: { type: String, default: null },
        approved: { type: Boolean, default: false },
        resetPasswordToken: { type: String },
        resetPasswordExpire: { type: Date },
        wishlist: [{ type: String }], // array of product _ids (strings)
        kycStatus: { type: String, enum: ["pending", "under_review", "approved", "rejected"], default: null },
        kycDocuments: [
            {
                documentType: { type: String }, // e.g., GSTIN, PAN, BANK
                fileUrl: { type: String },
                status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
                submittedAt: { type: Date, default: Date.now }
            }
        ],
        pushSubscriptions: [{ type: mongoose.Schema.Types.Mixed }],
    },
    {
        timestamps: true,
        _id: false, // we manage _id ourselves as a string
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

userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);
export default User;