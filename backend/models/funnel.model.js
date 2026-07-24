import mongoose from "mongoose";

const funnelEventSchema = new mongoose.Schema(
    {
        eventType: { 
            type: String, 
            enum: ["view_item", "add_to_cart", "begin_checkout", "purchase"], 
            required: true 
        },
        userId: { type: String, required: false },
        sessionId: { type: String, required: true },
        productId: { type: String, required: false },
        metadata: { type: Object, default: {} }
    },
    { timestamps: true }
);

const FunnelEvent = mongoose.model("FunnelEvent", funnelEventSchema);
export default FunnelEvent;
