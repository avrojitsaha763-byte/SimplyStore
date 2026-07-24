import express from "express";
import { protect, vendorOnly } from "../middleware/auth.middleware.js";
import WholesaleRequest from "../models/wholesaleRequest.model.js";
import Product from "../models/product.model.js";

const router = express.Router();

// POST /api/wholesale/request — B2B customer submits bulk quote
router.post("/request", protect, async (req, res) => {
    const { productId, quantity, offeredPrice, message } = req.body;
    if (!productId || !quantity || !offeredPrice) {
        return res.status(400).json({ message: "Please provide productId, quantity, and offeredPrice" });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const reqId = "wreq_" + Math.random().toString(36).substring(2, 11);
        const wholesale = await WholesaleRequest.create({
            _id: reqId,
            buyerId: req.user.id,
            buyerName: req.user.name || req.user.email,
            vendorId: product.vendorId,
            productId,
            productName: product.name,
            quantity,
            offeredPrice,
            status: "Pending",
            messages: message ? [{ senderId: req.user.id, text: message, date: new Date() }] : []
        });

        res.status(201).json({ message: "Wholesale quote submitted successfully!", request: wholesale });
    } catch (error) {
        res.status(500).json({ message: "Failed to create wholesale request", error: error.message });
    }
});

// GET /api/wholesale/my-requests — Retrieve buyer's list of wholesale requests
router.get("/my-requests", protect, async (req, res) => {
    try {
        const list = await WholesaleRequest.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch wholesale requests", error: error.message });
    }
});

// GET /api/wholesale/vendor/requests — Vendor retrieves incoming quote requests
router.get("/vendor/requests", protect, vendorOnly, async (req, res) => {
    try {
        const list = await WholesaleRequest.find({ vendorId: req.user.id }).sort({ createdAt: -1 });
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch vendor requests", error: error.message });
    }
});

// PATCH /api/wholesale/:id/respond — Update quote status / add negotiation message
router.patch("/:id/respond", protect, async (req, res) => {
    const { status, counterPrice, message } = req.body;
    try {
        const request = await WholesaleRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        // Authorization check: Must be buyer or target vendor
        const isBuyer = request.buyerId === req.user.id;
        const isVendor = request.vendorId === req.user.id;
        if (!isBuyer && !isVendor) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        if (status) request.status = status;
        if (counterPrice) request.offeredPrice = counterPrice;
        if (message) {
            request.messages.push({
                senderId: req.user.id,
                text: message,
                date: new Date()
            });
        }

        await request.save();
        res.json({ message: "Wholesale quote updated successfully", request });
    } catch (error) {
        res.status(500).json({ message: "Failed to update request", error: error.message });
    }
});

export default router;
