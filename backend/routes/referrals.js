import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import Referral from "../models/referral.model.js";

const router = express.Router();

// GET /api/referrals/my-code — Retrieve user's referral code & share link
router.get("/my-code", protect, async (req, res) => {
    try {
        const code = `ref_${req.user.id.substring(req.user.id.indexOf('_') + 1)}`;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
        res.json({ code, referralLink: `${frontendUrl}/login?ref=${code}` });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate code", error: error.message });
    }
});

// GET /api/referrals/stats — Get count of referrals and store credit
router.get("/stats", protect, async (req, res) => {
    try {
        const refs = await Referral.find({ referrerId: req.user.id });
        const totalCredits = refs.reduce((sum, r) => sum + r.creditEarned, 0);
        res.json({
            referrals: refs,
            totalCredits,
            successfulCount: refs.filter(r => r.status === "completed").length
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to get stats", error: error.message });
    }
});

// POST /api/referrals/apply — Registers a referral target email
router.post("/apply", protect, async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Referral code is required" });

    try {
        // Decode referrer ID from code: code is ref_<userId_without_user_prefix>
        // user_1234567890 -> ref_1234567890 -> back to user_1234567890
        const referrerId = `user_${code.split('_')[1]}`;

        // Prevent self-referral
        if (referrerId === req.user.id) {
            return res.status(400).json({ message: "You cannot use your own referral code" });
        }
        
        // Check if referral already exists
        const existing = await Referral.findOne({ referredEmail: req.user.email });
        if (existing) {
            return res.status(400).json({ message: "You have already been referred or registered" });
        }

        const id = "ref_" + Math.random().toString(36).substring(2, 11);
        const ref = await Referral.create({
            _id: id,
            referrerId,
            referredEmail: req.user.email,
            status: "signed_up"
        });

        res.status(201).json({ message: "Referral code applied!", referral: ref });
    } catch (error) {
        res.status(500).json({ message: "Failed to apply referral", error: error.message });
    }
});

export default router;
