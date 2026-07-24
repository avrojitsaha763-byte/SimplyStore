import express from "express";
import { protect, vendorOnly } from "../middleware/auth.middleware.js";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";

const router = express.Router();

// GET /api/marketing/coupons — Get all active public coupons (accessible by customers)
router.get("/public-coupons", async (req, res) => {
    try {
        const coupons = await Coupon.find({ active: true });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch public coupons", error: error.message });
    }
});

// GET /api/vendor/marketing/coupons — List coupons for this vendor
router.get("/coupons", protect, vendorOnly, async (req, res) => {
    const vendorId = req.user.id;
    try {
        // Return both vendor-specific and platform coupons
        const coupons = await Coupon.find({
            $or: [{ vendorId }, { vendorId: null }]
        });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch coupons", error: error.message });
    }
});

// POST /api/vendor/marketing/coupons — Create a new coupon
router.post("/coupons", protect, vendorOnly, async (req, res) => {
    const vendorId = req.user.id;
    const { code, discount, type, minOrder } = req.body;
    if (!code || !discount || !type) {
        return res.status(400).json({ message: "Please provide code, discount, and type" });
    }
    try {
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }

        const couponId = "cp_" + Math.random().toString(36).substring(2, 11);
        const coupon = await Coupon.create({
            _id: couponId,
            code: code.toUpperCase(),
            discount,
            type,
            minOrder: minOrder || 0,
            vendorId,
            active: true
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: "Failed to create coupon", error: error.message });
    }
});

// DELETE /api/vendor/marketing/coupons/:id — Remove a coupon
router.delete("/coupons/:id", protect, vendorOnly, async (req, res) => {
    const vendorId = req.user.id;
    try {
        const coupon = await Coupon.findOne({ _id: req.params.id, vendorId });
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found or unauthorized" });
        }
        await Coupon.deleteOne({ _id: req.params.id });
        res.json({ message: "Coupon removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete coupon", error: error.message });
    }
});

// POST /api/vendor/marketing/flash-sale — Schedule flash sale (discounts selected product)
router.post("/flash-sale", protect, vendorOnly, async (req, res) => {
    const { productId, discountPercent, durationMinutes } = req.body;
    if (!productId || !discountPercent || !durationMinutes) {
        return res.status(400).json({ message: "Missing required flash sale parameters" });
    }

    try {
        const product = await Product.findOne({ _id: productId, vendorId: req.user.id });
        if (!product) return res.status(404).json({ message: "Product not found or unauthorized" });

        // Store original price if not already stored
        if (!product.originalPrice) {
            product.originalPrice = product.price;
        }

        product.price = product.originalPrice * (1 - discountPercent / 100);
        product.discount = discountPercent;
        product.flashSaleEndsAt = new Date(Date.now() + durationMinutes * 60 * 1000);
        await product.save();

        // Set fallback timer to revert pricing after duration completes
        setTimeout(async () => {
            try {
                const p = await Product.findOne({ _id: productId });
                if (p && p.originalPrice) {
                    p.price = p.originalPrice;
                    p.originalPrice = null;
                    p.discount = 0;
                    p.flashSaleEndsAt = null;
                    await p.save();
                    console.log(`Reverted flash sale price for product ${productId}`);
                }
            } catch (err) {
                console.error("Failed to revert flash sale price:", err.message);
            }
        }, durationMinutes * 60 * 1000);

        res.json({ message: `Flash sale activated for ${durationMinutes} minutes`, product });
    } catch (error) {
        res.status(500).json({ message: "Failed to schedule flash sale", error: error.message });
    }
});

export default router;
