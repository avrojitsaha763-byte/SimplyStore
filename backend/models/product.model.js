import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
    {
        rate: { type: Number, default: 5.0 },
        count: { type: Number, default: 0 },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        _id: { type: String },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number, default: null },
        discount: { type: Number, default: 0 },
        flashSaleEndsAt: { type: Date, default: null },
        stock: { type: Number, required: true, default: 0 },
        image: { type: String, required: true },
        category: { type: String, required: true },
        brand: { type: String, default: null },
        tags: [{ type: String }],
        colors: [{ type: String }],
        sizes: [{ type: String }],
        rating: { type: ratingSchema, default: () => ({ rate: 5.0, count: 0 }) },
        isFeatured: { type: Boolean, default: false },
        isTrending: { type: Boolean, default: false },
        vendorId: { type: String, default: null },
        vendorName: { type: String, default: null },
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

productSchema.index({ category: 1, stock: -1 });
productSchema.index({ vendorId: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model("Product", productSchema);
export default Product;
