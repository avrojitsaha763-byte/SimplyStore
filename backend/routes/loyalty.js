import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import LoyaltyAccount from "../models/loyaltyAccount.model.js";

const router = express.Router();

// Helper to determine customer loyalty tier based on lifetime spent or accumulated points
const getTier = (points) => {
    if (points >= 5000) return "Platinum";
    if (points >= 1500) return "Gold";
    if (points >= 500) return "Silver";
    return "Bronze";
};

// GET /api/loyalty/me — Fetch points balance, tier, history
router.get("/me", protect, async (req, res) => {
    try {
        let account = await LoyaltyAccount.findOne({ userId: req.user.id });
        if (!account) {
            account = await LoyaltyAccount.create({
                _id: req.user.id,
                userId: req.user.id,
                points: 0,
                tier: "Bronze",
                history: []
            });
        }
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch loyalty account", error: error.message });
    }
});

// POST /api/loyalty/redeem — Redeem points for store credits at checkout
router.post("/redeem", protect, async (req, res) => {
    const { pointsToRedeem } = req.body;
    if (!pointsToRedeem || pointsToRedeem <= 0) {
        return res.status(400).json({ message: "Invalid points quantity" });
    }

    try {
        const account = await LoyaltyAccount.findOne({ userId: req.user.id });
        if (!account || account.points < pointsToRedeem) {
            return res.status(400).json({ message: "Insufficient points balance" });
        }

        const value = pointsToRedeem / 100; // 100 points = $1 store credit
        account.points -= pointsToRedeem;
        account.history.push({
            event: "points_redeemed",
            points: -pointsToRedeem,
            date: new Date()
        });
        account.tier = getTier(account.points);
        await account.save();

        res.json({
            message: `Redeemed ${pointsToRedeem} points successfully!`,
            creditEarned: value,
            newBalance: account.points
        });
    } catch (error) {
        res.status(500).json({ message: "Redeem operation failed", error: error.message });
    }
});

export default router;
export { getTier };
