import express from "express";
import webpush from "web-push";
import { protect } from "../middleware/auth.middleware.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const router = express.Router();

// Setup web-push with VAPID keys
// In production, these should be process.env.VAPID_PUBLIC_KEY etc.
webpush.setVapidDetails(
  'mailto:admin@simplystore.com',
  process.env.VAPID_PUBLIC_KEY || 'BCu38hHdKprAut5UGhgmiJxJ8nHAKjns8N-62mkCU86ozOFfHQZZb917cGxubJ-CGFSK5RCqODe1aL8RWwlrD1o',
  process.env.VAPID_PRIVATE_KEY || 'FQH_zBxl-cWUlVL_9MUu5r9N5f6EIqELziSMrcz-VcI'
);

// POST /api/notifications/subscribe — Subscribe to push notifications
router.post('/subscribe', protect, async (req, res) => {
    try {
        const subscription = req.body;
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { pushSubscriptions: subscription }
        });
        res.status(201).json({ message: "Subscribed to push notifications" });
    } catch (error) {
        res.status(500).json({ message: "Failed to subscribe", error: error.message });
    }
});

// GET /api/notifications — Retrieve user notification messages
router.get("/", protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
    }
});

// PATCH /api/notifications/read-all — Mark all alerts read (MUST be before /:id/read)
router.patch("/read-all", protect, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id }, { read: true });
        res.json({ message: "All notifications marked read" });
    } catch (error) {
        res.status(500).json({ message: "Failed to mark all read", error: error.message });
    }
});

// PATCH /api/notifications/:id/read — Mark single alert read
router.patch("/:id/read", protect, async (req, res) => {
    try {
        const alert = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { read: true },
            { new: true }
        );
        if (!alert) return res.status(404).json({ message: "Notification not found" });
        res.json(alert);
    } catch (error) {
        res.status(500).json({ message: "Failed to mark read", error: error.message });
    }
});

export default router;
