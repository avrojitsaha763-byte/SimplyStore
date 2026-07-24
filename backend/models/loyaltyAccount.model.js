import mongoose from "mongoose";

const loyaltyAccountSchema = new mongoose.Schema(
    {
        _id: { type: String }, // same as userId or unique ID
        userId: { type: String, required: true },
        points: { type: Number, default: 0 },
        tier: { type: String, enum: ["Bronze", "Silver", "Gold", "Platinum"], default: "Bronze" },
        history: [
            {
                event: { type: String, required: true }, // e.g., "order_earned", "review_bonus"
                points: { type: Number, required: true },
                date: { type: Date, default: Date.now }
            }
        ]
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

const LoyaltyAccount = mongoose.model("LoyaltyAccount", loyaltyAccountSchema);
export default LoyaltyAccount;
