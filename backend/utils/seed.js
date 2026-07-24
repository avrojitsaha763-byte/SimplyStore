/**
 * seed.js — Run this ONCE to migrate your existing JSON flat-file data into MongoDB.
 * Usage:  node utils/seed.js
 *
 * It reads data/users.json, data/products.json, data/orders.json and inserts
 * them into MongoDB, skipping any documents that already exist (safe to re-run).
 */

import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

configDotenv();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

// ── Inline schemas to avoid circular imports ─────────────────────────────────
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

const readJSON = (filename) => {
    const file = path.join(DATA_DIR, filename);
    if (!fs.existsSync(file)) {
        console.warn(`⚠️  ${filename} not found, skipping.`);
        return [];
    }
    return JSON.parse(fs.readFileSync(file, "utf8"));
};

const seed = async () => {
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is not set in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("🚀 Connected to MongoDB");

    // ── USERS ─────────────────────────────────────────────────────────────
    const usersData = readJSON("users.json");
    let usersInserted = 0;
    for (const u of usersData) {
        const exists = await User.findById(u.id);
        if (!exists) {
            await new User({
                _id: u.id,
                name: u.name,
                email: u.email,
                password: u.password,
                role: u.role || "customer",
                shopName: u.shopName || null,
                approved: u.approved ?? false,
                wishlist: u.wishlist || [],
            }).save();
            usersInserted++;
        }
    }
    console.log(`✅ Users: ${usersInserted} inserted, ${usersData.length - usersInserted} already existed`);

    // ── PRODUCTS ──────────────────────────────────────────────────────────
    const productsData = readJSON("products.json");
    let productsInserted = 0;
    for (const p of productsData) {
        const exists = await Product.findById(p.id);
        if (!exists) {
            await new Product({
                _id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                originalPrice: p.originalPrice || null,
                discount: p.discount || 0,
                stock: p.stock,
                image: p.image,
                category: p.category,
                brand: p.brand || null,
                tags: p.tags || [],
                colors: p.colors || [],
                sizes: p.sizes || [],
                rating: p.rating || { rate: 5.0, count: 0 },
                isFeatured: p.isFeatured || false,
                isTrending: p.isTrending || false,
                vendorId: p.vendorId || null,
                vendorName: p.vendorName || null,
            }).save();
            productsInserted++;
        }
    }
    console.log(`✅ Products: ${productsInserted} inserted, ${productsData.length - productsInserted} already existed`);

    // ── ORDERS ────────────────────────────────────────────────────────────
    const ordersData = readJSON("orders.json");
    let ordersInserted = 0;
    for (const o of ordersData) {
        const exists = await Order.findById(o.id);
        if (!exists) {
            await new Order({
                _id: o.id,
                userId: o.userId || null,
                items: o.items || [],
                shippingDetails: o.shippingDetails,
                paymentMethod: o.paymentMethod,
                total: o.total,
                status: o.status || "Pending",
                tracking: o.tracking || null,
                createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
            }).save();
            ordersInserted++;
        }
    }
    console.log(`✅ Orders: ${ordersInserted} inserted, ${ordersData.length - ordersInserted} already existed`);

    console.log("\n🎉 Seed complete! Your MongoDB is now populated.");
    await mongoose.disconnect();
    process.exit(0);
};

seed().catch((err) => {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
});
