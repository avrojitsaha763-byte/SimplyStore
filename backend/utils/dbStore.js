import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_PRODUCTS = [
    {
        id: "prod_1",
        name: "iPhone 15 Pro",
        description: "Titanium design, A17 Pro chip, customizable Action button, and a powerful 48MP camera system.",
        price: 999.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60",
        stock: 12,
        rating: { rate: 4.8, count: 156 }
    },
    {
        id: "prod_2",
        name: "MacBook Air M3",
        description: "Strikingly thin and fast. Built for Apple Intelligence, with up to 18 hours of battery life.",
        price: 1099.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60",
        stock: 8,
        rating: { rate: 4.9, count: 92 }
    },
    {
        id: "prod_3",
        name: "Sony WH-1000XM5",
        description: "Industry-leading noise-canceling headphones with dual processors and 8 microphones.",
        price: 349.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
        stock: 3,
        rating: { rate: 4.7, count: 240 }
    },
    {
        id: "prod_4",
        name: "Minimalist Leather Wallet",
        description: "Crafted from full-grain vegetable-tanned leather. Holds up to 8 cards in ultra-slim profile.",
        price: 45.00,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60",
        stock: 50,
        rating: { rate: 4.5, count: 88 }
    },
    {
        id: "prod_5",
        name: "Premium Cotton Hoodie",
        description: "Ultra-soft cotton French terry blend hoodie. Designed with a clean look and relaxed fit.",
        price: 65.00,
        category: "Apparel",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60",
        stock: 35,
        rating: { rate: 4.6, count: 112 }
    },
    {
        id: "prod_6",
        name: "Classic Quartz Watch",
        description: "Timeless design featuring a stainless steel case and genuine Italian leather strap.",
        price: 119.99,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=60",
        stock: 18,
        rating: { rate: 4.4, count: 73 }
    },
    {
        id: "prod_7",
        name: "Smart Learning Thermostat",
        description: "Learns your schedule and programs itself to save energy. Control from phone or tablet.",
        price: 199.99,
        category: "Home",
        image: "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?w=500&auto=format&fit=crop&q=60",
        stock: 2,
        rating: { rate: 4.6, count: 54 }
    },
    {
        id: "prod_8",
        name: "Ergonomic Mesh Office Chair",
        description: "Breathable mesh back, adjustable armrests, lumbar support, and tilt tension.",
        price: 289.99,
        category: "Home",
        image: "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=500&auto=format&fit=crop&q=60",
        stock: 10,
        rating: { rate: 4.8, count: 41 }
    }
];

const LOW_STOCK_THRESHOLD = 5;

const readJson = (filePath, defaultData = []) => {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error reading ${filePath}: ${error.message}`);
        return defaultData;
    }
};

const writeJson = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing to ${filePath}: ${error.message}`);
        return false;
    }
};

if (!fs.existsSync(PRODUCTS_FILE)) {
    writeJson(PRODUCTS_FILE, DEFAULT_PRODUCTS);
}

export const dbStore = {
    // ── PRODUCTS ──────────────────────────────────────────
    getProducts: () => readJson(PRODUCTS_FILE, DEFAULT_PRODUCTS),
    getProductById: (id) => readJson(PRODUCTS_FILE, DEFAULT_PRODUCTS).find(p => p.id === id),
    addProduct: (product) => {
        const products = readJson(PRODUCTS_FILE, DEFAULT_PRODUCTS);
        const newProduct = { id: `prod_${Date.now()}`, rating: { rate: 5.0, count: 0 }, ...product };
        products.push(newProduct);
        writeJson(PRODUCTS_FILE, products);
        return newProduct;
    },
    updateProduct: (id, updatedFields) => {
        const products = readJson(PRODUCTS_FILE, DEFAULT_PRODUCTS);
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return null;
        products[index] = { ...products[index], ...updatedFields };
        writeJson(PRODUCTS_FILE, products);
        return products[index];
    },
    deleteProduct: (id) => {
        const products = readJson(PRODUCTS_FILE, DEFAULT_PRODUCTS);
        const filtered = products.filter(p => p.id !== id);
        if (products.length === filtered.length) return false;
        writeJson(PRODUCTS_FILE, filtered);
        return true;
    },
    isLowStock: (product) => product.stock <= LOW_STOCK_THRESHOLD,
    getLowStockProducts: () => readJson(PRODUCTS_FILE, DEFAULT_PRODUCTS).filter(p => p.stock <= LOW_STOCK_THRESHOLD),

    // ── USERS ─────────────────────────────────────────────
    getUsers: () => readJson(USERS_FILE, []),
    getUserById: (id) => readJson(USERS_FILE, []).find(u => u.id === id),
    getUserByEmail: (email) => readJson(USERS_FILE, []).find(u => u.email.toLowerCase() === email.toLowerCase()),
    addUser: (user) => {
        const users = readJson(USERS_FILE, []);
        const newUser = { id: `user_${Date.now()}`, role: 'user', wishlist: [], ...user };
        users.push(newUser);
        writeJson(USERS_FILE, users);
        return newUser;
    },
    updateUser: (id, updatedFields) => {
        const users = readJson(USERS_FILE, []);
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        users[index] = { ...users[index], ...updatedFields };
        writeJson(USERS_FILE, users);
        return users[index];
    },

    // ── WISHLIST ──────────────────────────────────────────
    getWishlist: (userId) => {
        const user = readJson(USERS_FILE, []).find(u => u.id === userId);
        if (!user) return [];
        const wishlistIds = user.wishlist || [];
        const products = readJson(PRODUCTS_FILE, DEFAULT_PRODUCTS);
        return wishlistIds.map(id => products.find(p => p.id === id)).filter(Boolean);
    },
    addToWishlist: (userId, productId) => {
        const users = readJson(USERS_FILE, []);
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) return false;
        if (!users[index].wishlist) users[index].wishlist = [];
        if (!users[index].wishlist.includes(productId)) {
            users[index].wishlist.push(productId);
            writeJson(USERS_FILE, users);
        }
        return true;
    },
    removeFromWishlist: (userId, productId) => {
        const users = readJson(USERS_FILE, []);
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) return false;
        users[index].wishlist = (users[index].wishlist || []).filter(id => id !== productId);
        writeJson(USERS_FILE, users);
        return true;
    },

    // ── ORDERS ────────────────────────────────────────────
    getOrders: () => readJson(ORDERS_FILE, []),
    getOrderById: (id) => readJson(ORDERS_FILE, []).find(o => o.id === id),
    getOrdersByUser: (userId) => readJson(ORDERS_FILE, []).filter(o => o.userId === userId),
    addOrder: (order) => {
        const orders = readJson(ORDERS_FILE, []);
        const newOrder = {
            id: `ord_${Date.now()}`,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            ...order
        };
        orders.push(newOrder);
        writeJson(ORDERS_FILE, orders);
        return newOrder;
    },
    updateOrder: (id, updatedFields) => {
        const orders = readJson(ORDERS_FILE, []);
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) return null;
        orders[index] = { ...orders[index], ...updatedFields };
        writeJson(ORDERS_FILE, orders);
        return orders[index];
    },

    // ── ANALYTICS ─────────────────────────────────────────
    getAnalytics: () => {
        const orders = readJson(ORDERS_FILE, []);
        const products = readJson(PRODUCTS_FILE, DEFAULT_PRODUCTS);
        const users = readJson(USERS_FILE, []);

        const revenue = orders
            .filter(o => o.status !== 'Cancelled')
            .reduce((sum, o) => sum + (o.total || 0), 0);

        // Count product sales
        const salesMap = {};
        orders.filter(o => o.status !== 'Cancelled').forEach(order => {
            (order.items || []).forEach(item => {
                salesMap[item.id] = (salesMap[item.id] || 0) + item.quantity;
            });
        });

        const topProducts = products
            .map(p => ({ ...p, sold: salesMap[p.id] || 0 }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);

        return {
            totalRevenue: revenue,
            totalOrders: orders.length,
            totalUsers: users.filter(u => u.role !== 'admin').length,
            totalProducts: products.length,
            topProducts,
            recentOrders: orders.slice(-5).reverse(),
            lowStockCount: products.filter(p => p.stock <= LOW_STOCK_THRESHOLD).length
        };
    }
};
