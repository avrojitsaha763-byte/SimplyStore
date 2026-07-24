import express from "express";
import { protect, vendorOnly } from "../middleware/auth.middleware.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import VendorStats from "../models/vendorStats.model.js";

const router = express.Router();

// GET /api/vendor/stats — Get SLA score & reputation stats
router.get("/stats", protect, vendorOnly, async (req, res) => {
    const vendorId = req.user.id;
    try {
        let stats = await VendorStats.findOne({ vendorId });
        if (!stats) {
            // Create default initial stats
            stats = await VendorStats.create({
                _id: vendorId,
                vendorId,
                fulfillmentRate: 98,
                returnRate: 2,
                avgRating: 4.8,
                responseTime: 12,
                stockAccuracy: 99,
                slaScore: 97,
            });
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch vendor stats", error: error.message });
    }
});

// GET /api/vendor/forecast — Demand forecasting and low stock alerts
router.get("/forecast", protect, vendorOnly, async (req, res) => {
    const vendorId = req.user.id;
    try {
        // Fetch all vendor products
        const products = await Product.find({ vendorId });
        // Generate predictions based on current stock
        const forecasts = products.map(p => {
            // Simple rule-based demand simulation:
            // High rate for electronics/fashion, lower for others.
            const baseDailyVelocity = p.category === "Electronics" ? 1.5 : p.category === "Fashion" ? 1.2 : 0.8;
            const daysRemaining = p.stock === 0 ? 0 : Math.round(p.stock / baseDailyVelocity);
            return {
                productId: p.id,
                name: p.name,
                stock: p.stock,
                dailySalesVelocity: baseDailyVelocity,
                daysRemaining,
                alertLevel: daysRemaining <= 3 ? "critical" : daysRemaining <= 7 ? "warning" : "healthy",
                recommendedReorderQty: Math.max(30, Math.round(baseDailyVelocity * 30 - p.stock)),
            };
        });
        res.json(forecasts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch forecasts", error: error.message });
    }
});

// GET /api/vendor/velocity — Product velocity chart data
router.get("/velocity", protect, vendorOnly, async (req, res) => {
    const vendorId = req.user.id;
    try {
        const vendorProducts = await Product.find({ vendorId }).select('_id').lean();
        const vendorProductIds = vendorProducts.map(p => p._id.toString());

        // Find recent completed orders that contain products owned by this vendor
        const orders = await Order.find({ 
            "items.id": { $in: vendorProductIds }
        }).sort({ createdAt: -1 }).limit(100);

        const productSales = {};
        for (const order of orders) {
            for (const item of order.items) {
                if (!vendorProductIds.includes(String(item.id))) continue; // skip other vendors
                // If item matches a product of the vendor
                if (item.id) {
                    productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
                }
            }
        }

        res.json(Object.entries(productSales).map(([id, qty]) => ({ productId: id, quantitySold: qty })));
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch product velocity", error: error.message });
    }
});

export default router;
