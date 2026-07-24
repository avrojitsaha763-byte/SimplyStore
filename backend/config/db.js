import mongoose from "mongoose";
import dns from "dns";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoMemoryServer } from "mongodb-memory-server";

import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

const readJSON = (filename) => {
    const file = path.join(DATA_DIR, filename);
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, "utf8"));
};

const autoSeed = async () => {
    try {
        const productCount = await Product.countDocuments();
        if (productCount < 1500) {
            console.log("🌱 Syncing 1,560 products catalog across ALL 15 categories...");
            const usersData = readJSON("users.json");
            for (const u of usersData) {
                await User.updateOne({ _id: u.id }, { $setOnInsert: { _id: u.id, ...u } }, { upsert: true });
            }
            const productsData = readJSON("products.json");
            await Product.deleteMany({});
            await Product.insertMany(productsData.map(p => ({ ...p, _id: p.id })));
            const ordersData = readJSON("orders.json");
            for (const o of ordersData) {
                await Order.updateOne({ _id: o.id }, { $setOnInsert: { _id: o.id, ...o } }, { upsert: true });
            }
            console.log("🎉 Seeding 1,560 products across ALL 15 categories completed successfully!");
        }
    } catch (e) {
        console.error("Auto-seed error:", e.message);
    }
};

// Force Node.js to use public DNS for mongodb+srv URIs if local DNS fails
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore DNS config warnings
}

const connectDB = async () => {
    let uri = process.env.MONGO_URI;
    if (!uri || uri.includes("<username>") || uri.includes("<password>")) {
        console.log("ℹ️ MONGO_URI not set or contains placeholders. Initializing MongoMemoryServer...");
        try {
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            process.env.MONGO_URI = uri;
        } catch (e) {
            console.error("Failed to spin up MongoMemoryServer:", e.message);
        }
    }
    try {
        const conn = await mongoose.connect(uri || "mongodb://127.0.0.1:27017/simplystore");
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        await autoSeed();
    } catch (error) {
        console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Falling back to MongoMemoryServer...`);
        try {
            const mongoServer = await MongoMemoryServer.create();
            const fallbackUri = mongoServer.getUri();
            const conn = await mongoose.connect(fallbackUri);
            console.log(`✅ MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
            await autoSeed();
        } catch (memError) {
            console.error(`❌ In-memory MongoDB failed: ${memError.message}`);
            process.exit(1);
        }
    }
};

export default connectDB;