import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        _id: { type: String }, // custom ID or random string
        productId: { type: String, required: true },
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        title: { type: String, required: true, trim: true },
        body: { type: String, required: true },
        attributes: {
            quality: { type: Number, min: 1, max: 5, default: 5 },
            accuracy: { type: Number, min: 1, max: 5, default: 5 },
            packaging: { type: Number, min: 1, max: 5, default: 5 },
        },
        helpfulCount: { type: Number, default: 0 },
        verifiedPurchase: { type: Boolean, default: false },
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

const Review = mongoose.model("Review", reviewSchema);
export default Review;
