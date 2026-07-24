import express from "express";
import { protect, adminOnly, vendorOnly } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";

const router = express.Router();

// GET /api/vendor/kyc/status — Get current KYC status for vendor
router.get("/status", protect, vendorOnly, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id });
        if (!user) return res.status(404).json({ message: "Vendor not found" });

        res.json({
            kycStatus: user.kycStatus || "pending_submission",
            kycDocuments: user.kycDocuments || [],
            approved: user.approved,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch KYC status", error: error.message });
    }
});

// POST /api/vendor/kyc/submit — Vendor uploads document info
router.post("/submit", protect, vendorOnly, async (req, res) => {
    const { documentType, fileUrl } = req.body;
    if (!documentType || !fileUrl) {
        return res.status(400).json({ message: "Please provide documentType and fileUrl" });
    }
    try {
        const user = await User.findOne({ _id: req.user.id });
        if (!user) return res.status(404).json({ message: "Vendor not found" });

        // Update documents array
        user.kycDocuments.push({
            documentType,
            fileUrl,
            status: "pending",
            submittedAt: new Date(),
        });
        user.kycStatus = "under_review";
        await user.save();

        res.json({ message: "KYC document submitted successfully", kycStatus: user.kycStatus });
    } catch (error) {
        res.status(500).json({ message: "Failed to submit KYC documents", error: error.message });
    }
});

// GET /api/admin/kyc/queue — List all vendors awaiting KYC review
router.get("/queue", protect, adminOnly, async (req, res) => {
    try {
        const pendingVendors = await User.find({
            role: "vendor",
            kycStatus: "under_review",
        });
        res.json(pendingVendors);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch KYC queue", error: error.message });
    }
});

// PATCH /api/admin/kyc/:userId — Admin approves or rejects a vendor's KYC
router.patch("/:userId", protect, adminOnly, async (req, res) => {
    const { action } = req.body; // "approve" or "reject"
    if (!action || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ message: "Action must be either 'approve' or 'reject'" });
    }

    try {
        const vendor = await User.findOne({ _id: req.params.userId, role: "vendor" });
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        if (action === "approve") {
            vendor.kycStatus = "approved";
            vendor.approved = true;
            // Approve all pending docs
            vendor.kycDocuments.forEach(doc => {
                if (doc.status === "pending") doc.status = "approved";
            });
        } else {
            vendor.kycStatus = "rejected";
            vendor.approved = false;
            vendor.kycDocuments.forEach(doc => {
                if (doc.status === "pending") doc.status = "rejected";
            });
        }

        await vendor.save();
        res.json({ message: `Vendor KYC has been ${vendor.kycStatus}`, vendor });
    } catch (error) {
        res.status(500).json({ message: "Failed to process KYC request", error: error.message });
    }
});

export default router;
