import mongoose from "mongoose";

const vendorStatsSchema = new mongoose.Schema(
    {
        _id: { type: String }, // same as vendorId
        vendorId: { type: String, required: true },
        fulfillmentRate: { type: Number, default: 100 }, // percentage
        returnRate: { type: Number, default: 0 }, // percentage
        avgRating: { type: Number, default: 5.0 },
        responseTime: { type: Number, default: 24 }, // in hours
        stockAccuracy: { type: Number, default: 100 }, // percentage
        slaScore: { type: Number, default: 100 }, // computed rating (0-100)
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

const VendorStats = mongoose.model("VendorStats", vendorStatsSchema);
export default VendorStats;
