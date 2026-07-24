import express from "express";
import helmet from "helmet";
import cors from "cors";
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import connectDB from "./config/db.js";
import User from "./models/user.model.js";
import Product from "./models/product.model.js";
import Order from "./models/order.model.js";
import LoyaltyAccount from "./models/loyaltyAccount.model.js";
import Referral from "./models/referral.model.js";
import FunnelEvent from "./models/funnel.model.js";
import Coupon from "./models/coupon.model.js";
import { calculateGST, generateInvoiceNumber } from "./utils/gst.js";
import { getTier } from "./routes/loyalty.js";
import { protect, adminOnly, vendorOnly } from "./middleware/auth.middleware.js";
import { auditLogger } from "./middleware/audit.middleware.js";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { body, validationResult } from "express-validator";

import vendorStatsRoutes from "./routes/vendor.stats.js";
import pricingRoutes from "./routes/pricing.js";
import kycRoutes from "./routes/kyc.js";
import marketingRoutes from "./routes/marketing.js";

import recommendationRoutes from "./routes/recommendations.js";
import reviewRoutes from "./routes/reviews.js";
import notificationRoutes from "./routes/notifications.js";
import referralRoutes from "./routes/referrals.js";
import loyaltyRoutes from "./routes/loyalty.js";
import wholesaleRoutes from "./routes/wholesale.js";
import paymentRoutes from "./routes/payments.js";

configDotenv();

// Default environment variable fallbacks for dev mode
process.env.JWT_SECRET = process.env.JWT_SECRET || "simplystore_jwt_secret_key_123";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();
connectDB();

app.use(express.urlencoded({ limit: "50mb", extended: true }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs for auth routes
    message: { message: "Too many attempts from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
    cors({
        origin: (origin, callback) => {
            if (
                !origin ||
                /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
                origin === "https://simplystore-web-adeed.loca.lt"
            ) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);
app.use(express.json({ limit: "50mb" }));
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
});
app.use(auditLogger);

app.use("/api/vendor/stats-reputation", vendorStatsRoutes);
app.use("/api/vendor/pricing", pricingRoutes);
app.use("/api/vendor/kyc", kycRoutes);
app.use("/api/admin/kyc", kycRoutes);
app.use("/api/vendor/marketing", marketingRoutes);

app.use("/api/recommendations", recommendationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/referrals", referralRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/wholesale", wholesaleRoutes);
app.use("/api/payments", paymentRoutes);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { console.error("FATAL: JWT_SECRET env var is required"); process.exit(1); }
const LOW_STOCK_THRESHOLD = 5;

const generateToken = (user) =>
    jwt.sign(
        { id: user._id, email: user.email, role: user.role, shopName: user.shopName },
        JWT_SECRET,
        { expiresIn: "30d" }
    );

// ── Root ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("🛍️ SimplyStore E-commerce API is running!"));

// ══════════════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════════════════════════════════

// Validation middleware
const validateSignup = [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
};

// POST /api/auth/signup — Customer registration
app.post("/api/auth/signup", validateSignup, handleValidationErrors, async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (await User.findOne({ email: email.toLowerCase() }))
            return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await new User({
            _id: `user_${Date.now()}`,
            name,
            email,
            password: hashedPassword,
            role: "customer",
        }).save();
        res.status(201).json({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            token: generateToken(newUser),
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// POST /api/auth/login — Customer login
app.post("/api/auth/login", authLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Please enter all fields" });
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shopName: user.shopName,
            token: generateToken(user),
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// POST /api/auth/forgot-password - Generate reset token
app.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email.toLowerCase() });
        if (!user) return res.status(404).json({ message: "There is no user with that email" });

        const resetToken = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save({ validateBeforeSave: false });

        // In a real app, send email via nodemailer here. For now, just return it.
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        console.log("Password Reset URL:", resetUrl);

        res.status(200).json({ message: "Password reset link generated. Check console for URL." });
    } catch (e) {
        res.status(500).json({ message: "Email could not be sent" });
    }
});

// POST /api/auth/reset-password/:token - Reset password
app.post("/api/auth/reset-password/:token", authLimiter, async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully. You can now login." });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// POST /api/auth/vendor/register — Vendor self-registration
app.post("/api/auth/vendor/register", authLimiter, async (req, res) => {
    const { name, email, password, shopName } = req.body;
    if (!name || !email || !password || !shopName)
        return res.status(400).json({ message: "Name, email, password, and shop name are required" });
    try {
        if (await User.findOne({ email: email.toLowerCase() }))
            return res.status(400).json({ message: "Email already registered" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await new User({
            _id: `user_${Date.now()}`,
            name,
            email,
            password: hashedPassword,
            role: "vendor",
            shopName,
            approved: true,
        }).save();
        res.status(201).json({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            shopName: newUser.shopName,
            token: generateToken(newUser),
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// POST /api/auth/vendor/login — Vendor login
app.post("/api/auth/vendor/login", authLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Please enter all fields" });
    try {
        const user = await User.findOne({ email: email.toLowerCase(), role: "vendor" });
        if (!user) return res.status(400).json({ message: "Invalid vendor credentials" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid vendor credentials" });
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shopName: user.shopName,
            token: generateToken(user),
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// POST /api/auth/admin/login — Admin-only login
app.post("/api/auth/admin/login", authLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Please enter all fields" });
    try {
        const user = await User.findOne({ email: email.toLowerCase(), role: "admin" });
        if (!user) return res.status(403).json({ message: "Access denied. Admins only." });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid admin credentials" });
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user),
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════
//  PRODUCT ROUTES
// ══════════════════════════════════════════════════════════════════════════

// GET /api/products — public catalog
app.get("/api/products", async (req, res) => {
    try {
        const { category, search } = req.query;
        const filter = {};
        if (category && category !== "All")
            filter.category = { $regex: new RegExp(`^${category}$`, "i") };
        if (search)
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2000;
        const skip = (page - 1) * limit;

        const products = await Product.find(filter).skip(skip).limit(limit).lean();
        res.json(
            products.map((p) => ({ ...p, id: p._id, isLowStock: p.stock <= LOW_STOCK_THRESHOLD }))
        );
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET /api/products/:id
app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ ...product, id: product._id, isLowStock: product.stock <= LOW_STOCK_THRESHOLD });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// POST /api/products — Admin OR Vendor: Add new product
app.post("/api/products", protect, vendorOnly, async (req, res) => {
    const { name, description, price, category, image, stock } = req.body;
    if (!name || !description || !price || !category || !image || stock === undefined)
        return res.status(400).json({ message: "All product fields are required" });
    try {
        const vendorId = req.user.id;
        const vendorName = req.user.shopName || req.user.email;
        const newProduct = await new Product({
            _id: `prod_${Date.now()}`,
            name,
            description,
            price: parseFloat(price),
            category,
            image,
            stock: parseInt(stock),
            vendorId,
            vendorName,
        }).save();
        const doc = newProduct.toJSON();
        res.status(201).json({
            ...doc,
            lowStockAlert: newProduct.stock <= LOW_STOCK_THRESHOLD,
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// PUT /api/products/:id — Admin or owning vendor
app.put("/api/products/:id", protect, vendorOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (req.user.role === "vendor" && product.vendorId !== req.user.id)
            return res.status(403).json({ message: "You can only edit your own products" });
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).lean();
        res.json({ ...updated, id: updated._id });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// PATCH /api/products/:id/stock — Admin or owning vendor
app.patch("/api/products/:id/stock", protect, vendorOnly, async (req, res) => {
    const { stock } = req.body;
    if (stock === undefined || stock < 0)
        return res.status(400).json({ message: "Valid stock quantity required" });
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (req.user.role === "vendor" && product.vendorId !== req.user.id)
            return res.status(403).json({ message: "You can only update stock for your own products" });
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { stock: parseInt(stock) },
            { new: true }
        ).lean();
        const lowStockAlert = updated.stock <= LOW_STOCK_THRESHOLD;
        res.json({
            ...updated,
            id: updated._id,
            lowStockAlert,
            alertMessage: lowStockAlert
                ? `⚠️ Low stock: Only ${updated.stock} units remaining`
                : null,
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// DELETE /api/products/:id — Admin or owning vendor
app.delete("/api/products/:id", protect, vendorOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (req.user.role === "vendor" && product.vendorId !== req.user.id)
            return res.status(403).json({ message: "You can only delete your own products" });
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════
//  VENDOR ROUTES
// ══════════════════════════════════════════════════════════════════════════

// GET /api/vendor/products — Vendor's own products
app.get("/api/vendor/products", protect, vendorOnly, async (req, res) => {
    try {
        const products = await Product.find({ vendorId: req.user.id }).lean();
        res.json(
            products.map((p) => ({ ...p, id: p._id, isLowStock: p.stock <= LOW_STOCK_THRESHOLD }))
        );
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET /api/vendor/orders — Orders containing vendor's products
app.get("/api/vendor/orders", protect, vendorOnly, async (req, res) => {
    try {
        const vendorProductIds = (
            await Product.find({ vendorId: req.user.id }).select("_id").lean()
        ).map((p) => p._id);

        const allOrders = await Order.find({
            "items.id": { $in: vendorProductIds },
        }).lean();

        const vendorOrders = allOrders
            .map((order) => ({
                ...order,
                id: order._id,
                items: order.items.filter((item) => vendorProductIds.includes(item.id)),
            }))
            .reverse();

        res.json(vendorOrders);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET /api/vendor/analytics — Vendor-specific analytics
app.get("/api/vendor/analytics", protect, vendorOnly, async (req, res) => {
    try {
        const vendorProducts = await Product.find({ vendorId: req.user.id }).lean();
        const vendorProductIds = vendorProducts.map((p) => p._id);

        const allOrders = await Order.find({
            "items.id": { $in: vendorProductIds },
            status: { $ne: "Cancelled" },
        }).lean();

        let totalRevenue = 0;
        let totalOrders = 0;
        const productSales = {};

        allOrders.forEach((order) => {
            const vendorItems = order.items.filter((i) => vendorProductIds.includes(i.id));
            if (vendorItems.length > 0) {
                totalOrders++;
                vendorItems.forEach((item) => {
                    totalRevenue += item.price * item.quantity;
                    productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
                });
            }
        });

        const productMap = Object.fromEntries(vendorProducts.map((p) => [p._id, p]));
        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, qty]) => ({ ...productMap[id], id, soldQty: qty }));

        const lowStockProducts = vendorProducts
            .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
            .map((p) => ({ ...p, id: p._id }));

        res.json({
            totalRevenue,
            totalOrders,
            totalProducts: vendorProducts.length,
            topProducts,
            lowStockProducts,
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════
//  WISHLIST ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.get("/api/wishlist", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean();
        if (!user) return res.status(404).json({ message: "User not found" });
        const products = await Product.find({ _id: { $in: user.wishlist } }).lean();
        res.json(products.map((p) => ({ ...p, id: p._id })));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.post("/api/wishlist/:productId", protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId).lean();
        if (!product) return res.status(404).json({ message: "Product not found" });
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { wishlist: req.params.productId },
        });
        res.json({ message: "Added to wishlist", product: { ...product, id: product._id } });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.delete("/api/wishlist/:productId", protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { wishlist: req.params.productId },
        });
        res.json({ message: "Removed from wishlist" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════
//  CHECKOUT & ORDERS ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.post("/api/checkout", protect, async (req, res) => {
    const { items, shippingDetails, paymentMethod, couponCode } = req.body;
    const userId = req.user.id;
    if (!items || items.length === 0)
        return res.status(400).json({ message: "No items in cart" });

    // Validate quantities to prevent negative quantity exploit
    for (const item of items) {
        if (!item.quantity || item.quantity <= 0) {
            return res.status(400).json({ message: `Invalid quantity for ${item.name}` });
        }
    }

    try {
        let subtotal = 0;
        const verifiedItems = [];

        // Validate stock & calculate subtotal from DB prices atomically
        for (const item of items) {
            // Find and decrement atomically to prevent Overselling Race Conditions
            const product = await Product.findOneAndUpdate(
                { _id: item.id, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );

            if (!product) {
                // Rollback previous decrements if one fails
                for (const rolled of verifiedItems) {
                    await Product.findByIdAndUpdate(rolled.id, { $inc: { stock: rolled.quantity } });
                }
                return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
            }

            subtotal += product.price * item.quantity;
            verifiedItems.push({
                id: product.id,
                name: product.name,
                price: product.price, // Canonically from DB (Prevents Price Mismatch)
                quantity: item.quantity,
                selectedColor: item.selectedColor,
                selectedSize: item.selectedSize
            });
        }
        
        // Coupon Validation
        let activeDiscount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon && new Date() <= new Date(coupon.validUntil || "2099-12-31") && subtotal >= coupon.minOrder) {
                if (coupon.type === "percent" || coupon.type === "percentage") {
                    activeDiscount = (subtotal * coupon.discount) / 100;
                } else {
                    activeDiscount = Math.min(coupon.discount, subtotal);
                }
            }
        }

        // Calculate GST Tax and generate Sequential Invoice
        const gstCalc = calculateGST(subtotal - activeDiscount, shippingDetails?.state || "Maharashtra");
        const shipping = (subtotal - activeDiscount) > 150 ? 0 : 15;
        const finalTotal = subtotal - activeDiscount + shipping + gstCalc.totalTax;
        
        const invoiceNumber = await generateInvoiceNumber();

        const newOrder = await new Order({
            _id: `ord_${Date.now()}`,
            userId: userId || null,
            items: verifiedItems,
            shippingDetails,
            paymentMethod,
            total: parseFloat(finalTotal.toFixed(2)),
            status: "Pending",
            tracking: `TRK-${Date.now()}`,
            gst: {
                rate: gstCalc.rate,
                cgst: gstCalc.cgst,
                sgst: gstCalc.sgst,
                igst: gstCalc.igst,
                invoiceNumber
            }
        }).save();

        // Credit Loyalty Rewards & Convert Referral Status
        if (userId) {
            const pointsEarned = Math.floor(subtotal / 10);
            let account = await LoyaltyAccount.findOne({ userId });
            if (!account) {
                account = new LoyaltyAccount({
                    _id: userId,
                    userId,
                    points: 0,
                    tier: "Bronze",
                    history: []
                });
            }
            account.points += pointsEarned;
            account.history.push({
                event: `order_earned: ${newOrder._id}`,
                points: pointsEarned,
                date: new Date()
            });
            account.tier = getTier(account.points);
            await account.save();

            const u = await User.findById(userId);
            if (u) {
                const ref = await Referral.findOne({ referredEmail: u.email, status: "signed_up" });
                if (ref) {
                    ref.status = "completed";
                    ref.creditEarned = 50;
                    ref.orderId = newOrder._id;
                    await ref.save();

                    let referrerAcc = await LoyaltyAccount.findOne({ userId: ref.referrerId });
                    if (!referrerAcc) {
                        referrerAcc = new LoyaltyAccount({
                            _id: ref.referrerId,
                            userId: ref.referrerId,
                            points: 0,
                            tier: "Bronze",
                            history: []
                        });
                    }
                    referrerAcc.points += 5000;
                    referrerAcc.history.push({
                        event: `referral_bonus: ${u.email}`,
                        points: 5000,
                        date: new Date()
                    });
                    referrerAcc.tier = getTier(referrerAcc.points);
                    await referrerAcc.save();
                }
            }
        }

        const doc = newOrder.toJSON();
        res.status(201).json({
            success: true,
            orderId: doc.id,
            message: "Order placed successfully! Thank you for your purchase.",
            order: doc,
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.get("/api/orders/my", protect, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).lean();
        res.json(
            orders
                .map((o) => ({ ...o, id: o._id }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.patch("/api/orders/:id/cancel", protect, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.status !== "Pending" && order.status !== "Processing") {
            return res.status(400).json({ message: "Order cannot be cancelled at this stage." });
        }

        order.status = "Cancelled";
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.id, { $inc: { stock: item.quantity } });
        }

        res.json({ message: "Order cancelled successfully and stock restored." });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════
//  ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.get("/api/admin/orders", protect, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find().lean();
        res.json(
            orders
                .map((o) => ({ ...o, id: o._id }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET /api/admin/orders/export — CSV Export Route
app.get("/api/admin/orders/export", protect, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find().lean();
        let csv = "Order ID,User ID,Customer Name,Customer Email,Status,Total Amount,Invoice Number,Date\n";
        orders.forEach(o => {
            const name = o.shippingDetails?.fullName || "Guest";
            const email = o.shippingDetails?.email || "";
            const inv = o.gst?.invoiceNumber || "N/A";
            const date = new Date(o.createdAt).toLocaleDateString();
            csv += `${o._id},${o.userId || "Guest"},"${name}",${email},${o.status},${o.total},${inv},${date}\n`;
        });
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=orders_export.csv");
        res.status(200).send(csv);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.patch("/api/admin/orders/:id/status", protect, adminOnly, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status))
        return res.status(400).json({ message: "Invalid status" });
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Restore stock on cancellation
        if (status === "Cancelled" && order.status !== "Cancelled") {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.id, { $inc: { stock: item.quantity } });
            }
        }
        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).lean();
        res.json({ message: `Order status updated to ${status}`, order: { ...updated, id: updated._id } });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.get("/api/admin/analytics", protect, adminOnly, async (req, res) => {
    try {
        const [orders, products, users, funnelEvents] = await Promise.all([
            Order.find().lean(),
            Product.find().lean(),
            User.find().lean(),
            FunnelEvent.find().lean(),
        ]);

        const activeOrders = orders.filter((o) => o.status !== "Cancelled");
        const revenue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);

        const salesMap = {};
        activeOrders.forEach((order) => {
            (order.items || []).forEach((item) => {
                salesMap[item.id] = (salesMap[item.id] || 0) + item.quantity;
            });
        });

        const topProducts = products
            .map((p) => ({ ...p, id: p._id, sold: salesMap[p._id] || 0 }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenueMap = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            revenueMap[`${monthNames[d.getMonth()]} ${d.getFullYear()}`] = { revenue: 0, orders: 0 };
        }
        activeOrders.forEach((o) => {
            const d = new Date(o.createdAt);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            if (revenueMap[key]) {
                revenueMap[key].revenue += (o.total || 0);
                revenueMap[key].orders += 1;
            }
        });
        const revenueData = Object.keys(revenueMap).map(k => ({
            name: k,
            revenue: revenueMap[k].revenue,
            orders: revenueMap[k].orders
        }));

        const funnelData = {
            view_item: funnelEvents.filter(e => e.eventType === "view_item").length,
            add_to_cart: funnelEvents.filter(e => e.eventType === "add_to_cart").length,
            begin_checkout: funnelEvents.filter(e => e.eventType === "begin_checkout").length,
            purchase: funnelEvents.filter(e => e.eventType === "purchase").length,
        };

        const userOrderCounts = {};
        activeOrders.forEach(o => {
            if (o.userId) {
                userOrderCounts[o.userId] = (userOrderCounts[o.userId] || 0) + 1;
            }
        });
        const cohortData = {
            returningCustomers: Object.values(userOrderCounts).filter(count => count > 1).length,
            newCustomers: Object.values(userOrderCounts).filter(count => count === 1).length,
        };

        res.json({
            totalRevenue: revenue,
            totalOrders: orders.length,
            totalUsers: users.filter((u) => u.role !== "admin").length,
            totalProducts: products.length,
            topProducts,
            revenueData,
            funnelData,
            cohortData,
            recentOrders: orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((o) => ({ ...o, id: o._id })),
            lowStockCount: products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length,
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.get("/api/admin/low-stock", protect, adminOnly, async (req, res) => {
    try {
        const products = await Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD } }).lean();
        res.json(products.map((p) => ({ ...p, id: p._id })));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET /api/admin/vendors — List all vendors
app.get("/api/admin/vendors", protect, adminOnly, async (req, res) => {
    try {
        const vendors = await User.find({ role: "vendor" }).lean();
        const productCounts = await Product.aggregate([
            { $group: { _id: "$vendorId", count: { $sum: 1 } } },
        ]);
        const countMap = Object.fromEntries(productCounts.map((c) => [c._id, c.count]));
        res.json(
            vendors.map((v) => ({
                id: v._id,
                name: v.name,
                email: v.email,
                shopName: v.shopName,
                productCount: countMap[v._id] || 0,
            }))
        );
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ── Background Jobs ─────────────────────────────────────────────────────────
setInterval(async () => {
    try {
        const now = new Date();
        const expiredProducts = await Product.find({ flashSaleEndsAt: { $lt: now } });
        for (const p of expiredProducts) {
            if (p.originalPrice) {
                p.price = p.originalPrice;
                p.originalPrice = null;
                p.discount = 0;
            }
            p.flashSaleEndsAt = null;
            await p.save();
            console.log(`Cron: Reverted flash sale for product ${p._id}`);
        }
    } catch (e) {
        console.error("Cron Error:", e.message);
    }
}, 60000); // Check every minute

// ── Start Server ──────────────────────────────────────────────────────────

// Funnel Tracking Endpoint
app.post("/api/funnel", async (req, res) => {
    try {
        const { eventType, userId, sessionId, productId, metadata } = req.body;
        await FunnelEvent.create({ eventType, userId, sessionId, productId, metadata });
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to log event" });
    }
});

// ── GDPR Compliance ───────────────────────────────────────────────────────

// GET /api/user/data-export — Download personal data (GDPR)
app.get("/api/user/data-export", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        const orders = await Order.find({ userId: req.user.id });
        const loyalty = await LoyaltyAccount.findOne({ userId: req.user.id });
        
        res.setHeader("Content-Disposition", `attachment; filename=userdata_${req.user.id}.json`);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ user, orders, loyalty }, null, 2));
    } catch (err) {
        res.status(500).json({ message: "Server error during data export" });
    }
});

// DELETE /api/user/account — Account deletion (GDPR)
app.delete("/api/user/account", protect, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({ message: "Account successfully deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error during account deletion" });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));