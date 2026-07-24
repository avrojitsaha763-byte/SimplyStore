import mongoose from "mongoose";

const pricingRuleSchema = new mongoose.Schema(
    {
        _id: { type: String }, // custom ID
        vendorId: { type: String, required: true },
        productId: { type: String, required: true },
        ruleType: { type: String, enum: ["time-based", "stock-based", "demand-based"], required: true },
        condition: {
            minStock: { type: Number },
            maxStock: { type: Number },
            startTime: { type: String }, // e.g., "18:00"
            endTime: { type: String }, // e.g., "22:00"
            dayOfWeek: { type: Number }, // 0 = Sunday, 1 = Monday, etc.
            minViews: { type: Number }, // for demand-based pricing
        },
        adjustment: {
            type: { type: String, enum: ["percentage", "flat"], required: true },
            value: { type: Number, required: true }, // e.g. -10 for 10% discount, +5 for $5 increase
        },
        active: { type: Boolean, default: true },
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

const PricingRule = mongoose.model("PricingRule", pricingRuleSchema);
export default PricingRule;
