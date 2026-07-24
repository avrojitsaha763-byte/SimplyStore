import express from "express";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

const router = express.Router();

// GET /api/recommendations/user/:userId — Purchase history based suggestions
router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        if (!userId || userId === "null" || userId === "undefined") {
            // Fallback to trending
            const trending = await Product.find({}).sort({ "rating.rate": -1 }).limit(4);
            return res.json(trending);
        }

        // Fetch user's orders
        const orders = await Order.find({ userId });
        if (orders.length === 0) {
            // Fallback to featured
            const featured = await Product.find({ isFeatured: true }).limit(4);
            return res.json(featured);
        }

        // Gather categories the user purchased from
        const purchasedCategories = new Set();
        orders.forEach(order => {
            order.items.forEach(item => {
                // If we don't have category in line item, we'll fetch from db later, or use default category stubs
                purchasedCategories.add(item.category || "Electronics");
            });
        });

        // Find products in those categories that the user hasn't bought yet
        const suggestions = await Product.find({
            category: { $in: Array.from(purchasedCategories) }
        }).limit(4);

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user recommendations", error: error.message });
    }
});

// GET /api/recommendations/product/:productId — Frequently bought together
router.get("/product/:productId", async (req, res) => {
    const { productId } = req.params;
    try {
        // Find all orders that contain this product
        const siblingOrders = await Order.find({ "items.id": productId }).limit(50);
        
        const siblingProductIds = {};
        siblingOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.id !== productId) {
                    siblingProductIds[item.id] = (siblingProductIds[item.id] || 0) + 1;
                }
            });
        });

        const sortedSiblings = Object.entries(siblingProductIds)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([id]) => id);

        if (sortedSiblings.length === 0) {
            // Fallback: same category products
            const targetProd = await Product.findOne({ _id: productId });
            if (targetProd) {
                const categoryProducts = await Product.find({
                    category: targetProd.category,
                    _id: { $ne: productId }
                }).limit(4);
                return res.json(categoryProducts);
            }
            const defaultProds = await Product.find({}).limit(4);
            return res.json(defaultProds);
        }

        const recommendedProducts = await Product.find({ _id: { $in: sortedSiblings } });
        res.json(recommendedProducts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch product recommendations", error: error.message });
    }
});

// GET /api/recommendations/trending — Trending products
router.get("/trending", async (req, res) => {
    try {
        const products = await Product.find({}).sort({ "rating.rate": -1, "rating.count": -1 }).limit(4);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch trending recommendations", error: error.message });
    }
});

export default router;
