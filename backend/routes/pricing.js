import express from "express";
import { protect, vendorOnly } from "../middleware/auth.middleware.js";
import PricingRule from "../models/pricingRule.model.js";
import Product from "../models/product.model.js";

const router = express.Router();

// Helper function to evaluate and apply active pricing rules to product collections
export const applyPricingRules = async (vendorId) => {
    try {
        const rules = await PricingRule.find({ vendorId, active: true });
        for (const rule of rules) {
            const product = await Product.findOne({ _id: rule.productId });
            if (!product) continue;

            let shouldApply = false;

            // 1. Stock-based rule logic
            if (rule.ruleType === "stock-based") {
                const stock = product.stock;
                if (rule.condition.minStock !== undefined && stock >= rule.condition.minStock) {
                    if (rule.condition.maxStock !== undefined && stock <= rule.condition.maxStock) {
                        shouldApply = true;
                    }
                }
            }

            // 2. Time-based rule logic (checks current hour/day)
            if (rule.ruleType === "time-based") {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

                if (rule.condition.dayOfWeek === undefined || rule.condition.dayOfWeek === currentDay) {
                    if (rule.condition.startTime && rule.condition.endTime) {
                        const [startH, startM] = rule.condition.startTime.split(":").map(Number);
                        const [endH, endM] = rule.condition.endTime.split(":").map(Number);

                        const currentVal = currentHour * 60 + currentMinute;
                        const startVal = startH * 60 + startM;
                        const endVal = endH * 60 + endM;

                        if (currentVal >= startVal && currentVal <= endVal) {
                            shouldApply = true;
                        }
                    }
                }
            }

            // 3. Demand-based rule logic (stub simulation)
            if (rule.ruleType === "demand-based") {
                // If rating rate is lower than 4, drop price to stimulate sales
                if (product.rating && product.rating.rate < 4.0) {
                    shouldApply = true;
                }
            }

            if (shouldApply) {
                // Store originalPrice if not already stored
                if (!product.originalPrice) {
                    product.originalPrice = product.price;
                }

                let newPrice = product.originalPrice;
                if (rule.adjustment.type === "percentage") {
                    newPrice = product.originalPrice * (1 + rule.adjustment.value / 100);
                } else if (rule.adjustment.type === "flat") {
                    newPrice = product.originalPrice + rule.adjustment.value;
                }

                product.price = Math.max(0.01, newPrice);
                product.discount = rule.adjustment.type === "percentage" && rule.adjustment.value < 0 ? Math.abs(rule.adjustment.value) : 0;
                await product.save();
            } else {
                // Revert to original price if rule no longer matches
                if (product.originalPrice) {
                    product.price = product.originalPrice;
                    product.originalPrice = null;
                    product.discount = 0;
                    await product.save();
                }
            }
        }
    } catch (error) {
        console.error("Error applying pricing rules:", error.message);
    }
};

// GET /api/vendor/pricing-rules — List pricing rules for this vendor
router.get("/rules", protect, vendorOnly, async (req, res) => {
    const vendorId = req.user.id;
    try {
        const rules = await PricingRule.find({ vendorId });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch rules", error: error.message });
    }
});

// POST /api/vendor/pricing-rules — Create new rule
router.post("/rules", protect, vendorOnly, async (req, res) => {
    const vendorId = req.user.id;
    const { productId, ruleType, condition, adjustment } = req.body;
    try {
        const ruleId = "rule_" + Math.random().toString(36).substring(2, 11);
        const rule = await PricingRule.create({
            _id: ruleId,
            vendorId,
            productId,
            ruleType,
            condition,
            adjustment,
            active: true
        });

        // Trigger an immediate check and evaluation
        await applyPricingRules(vendorId);

        res.status(201).json(rule);
    } catch (error) {
        res.status(500).json({ message: "Failed to create rule", error: error.message });
    }
});

// DELETE /api/vendor/pricing-rules/:id — Delete a rule
router.delete("/rules/:id", protect, vendorOnly, async (req, res) => {
    const vendorId = req.user.id;
    try {
        const rule = await PricingRule.findOne({ _id: req.params.id, vendorId });
        if (!rule) {
            return res.status(404).json({ message: "Pricing rule not found" });
        }

        // Revert product to original price before removing rule
        const product = await Product.findOne({ _id: rule.productId });
        if (product && product.originalPrice) {
            product.price = product.originalPrice;
            product.originalPrice = null;
            product.discount = 0;
            await product.save();
        }

        await PricingRule.deleteOne({ _id: req.params.id });
        res.json({ message: "Pricing rule removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete rule", error: error.message });
    }
});

export default router;
