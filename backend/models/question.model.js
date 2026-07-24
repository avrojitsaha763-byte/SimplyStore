import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        _id: { type: String }, // custom ID
        productId: { type: String, required: true },
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        questionText: { type: String, required: true, trim: true },
        answerText: { type: String, default: "" },
        vendorId: { type: String, default: null },
        answeredAt: { type: Date, default: null },
        upvotes: { type: Number, default: 0 },
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

const Question = mongoose.model("Question", questionSchema);
export default Question;
