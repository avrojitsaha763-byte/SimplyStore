const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, 'screenshots');
const framesDir = path.join(__dirname, 'video_frames');

// Clean and recreate video_frames directory
if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true, force: true });
}
fs.mkdirSync(framesDir, { recursive: true });
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

let frameCount = 0;
async function frame(page, count = 1, delay = 100) {
    for (let c = 0; c < count; c++) {
        frameCount++;
        const framePath = path.join(framesDir, `frame_${String(frameCount).padStart(6, '0')}.png`);
        await page.screenshot({ path: framePath });
        if (delay > 0) await new Promise(r => setTimeout(r, delay));
    }
}

(async () => {
    console.log('🚀 Starting FULL ELABORATE master video capture of SimplyStore...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        defaultViewport: { width: 1440, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // ══════════════════════════════════════════════════════════════════════════
    //  SECTION 1: CUSTOMER PORTAL & STOREFRONT
    // ══════════════════════════════════════════════════════════════════════════
    console.log('🛍️ [1/12] Customer Portal — Catalog Homepage...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await frame(page, 15); // Pause header

    // Search bar typing simulation
    console.log('   🔍 Demonstrating Search Bar...');
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
        await searchInput.type('iPhone', { delay: 60 });
        await frame(page, 12);
        await page.evaluate(el => el.value = '', searchInput);
        await frame(page, 4);
        await searchInput.type('Nike', { delay: 60 });
        await frame(page, 12);
        await page.evaluate(el => el.value = '', searchInput);
        await frame(page, 4);
    }

    // Category Filtering
    console.log('   🏷️ Demonstrating Category Filters...');
    const categoryNames = ['Electronics', 'Fashion', 'Home & Kitchen', 'All'];
    for (const cat of categoryNames) {
        const buttons = await page.$$('button');
        for (let b of buttons) {
            const txt = await page.evaluate(el => el.textContent, b);
            if (txt && txt.trim().startsWith(cat)) {
                await b.click();
                await new Promise(r => setTimeout(r, 600));
                await frame(page, 10);
                break;
            }
        }
    }

    // Scroll through catalog products
    console.log('   📜 Scrolling Catalog Product Grid...');
    for (let i = 0; i < 6; i++) {
        await page.evaluate(() => window.scrollBy(0, 220));
        await frame(page, 4);
    }
    await frame(page, 15); // Hold bottom
    await page.evaluate(() => window.scrollTo(0, 0));
    await frame(page, 5);

    // ── Customer Wishlist Page ────────────────────────────────────────────────
    console.log('❤️ [2/12] Customer Wishlist Page...');
    await page.goto('http://localhost:5173/wishlist', { waitUntil: 'networkidle2' });
    await frame(page, 15);

    // ── Customer Loyalty & Referrals ──────────────────────────────────────────
    console.log('🎁 [3/12] Customer Loyalty Rewards & Referrals...');
    await page.goto('http://localhost:5173/referrals', { waitUntil: 'networkidle2' });
    await frame(page, 15);
    for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollBy(0, 180));
        await frame(page, 4);
    }
    await frame(page, 15);

    // ── Customer B2B Wholesale Portal ─────────────────────────────────────────
    console.log('🏢 [4/12] Customer B2B Wholesale Portal...');
    await page.goto('http://localhost:5173/wholesale', { waitUntil: 'networkidle2' });
    await frame(page, 15);
    for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollBy(0, 180));
        await frame(page, 4);
    }
    await frame(page, 15);

    // ── Customer Login ────────────────────────────────────────────────────────
    console.log('🔑 [5/12] Logging in as Customer...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await frame(page, 10);
    await page.type('input[type="email"]', 'customer@simplystore.com', { delay: 40 });
    await frame(page, 5);
    await page.type('input[type="password"]', 'password123', { delay: 40 });
    await frame(page, 5);
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1500));
    await frame(page, 12);

    // ── Customer Cart & Free Shipping Threshold ──────────────────────────────
    console.log('🛒 [6/12] Customer Cart & Free Shipping Progress Bar...');
    await page.evaluate(() => {
        const cartItems = [
            {
                id: 'p1',
                name: 'Apple iPhone 15 Pro',
                price: 999,
                quantity: 1,
                selectedColor: 'Natural Titanium',
                selectedSize: '256GB',
                image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60'
            },
            {
                id: 'p11',
                name: "Nike Air Force 1 '07",
                price: 110,
                quantity: 1,
                selectedColor: 'White',
                selectedSize: 'US 10',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60'
            }
        ];
        localStorage.setItem('simplystore_cart', JSON.stringify(cartItems));
    });

    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });
    await frame(page, 18);

    // Demonstrate Promo Coupon Code input
    console.log('   🎟️ Applying Promo Coupon SAVE10...');
    const couponInput = await page.$('input[placeholder*="coupon"]');
    if (couponInput) {
        await couponInput.type('SAVE10', { delay: 50 });
        await frame(page, 6);
        const applyBtn = await page.$('button[type="submit"]');
        if (applyBtn) await applyBtn.click();
        await new Promise(r => setTimeout(r, 800));
        await frame(page, 15);
    }

    for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollBy(0, 160));
        await frame(page, 4);
    }
    await frame(page, 12);

    // ── Customer Checkout & Indian GST Calculation ───────────────────────────
    console.log('💳 [7/12] Customer Checkout & Indian GST Breakdown...');
    await page.goto('http://localhost:5173/checkout', { waitUntil: 'networkidle2' });
    await frame(page, 18);

    for (let i = 0; i < 6; i++) {
        await page.evaluate(() => window.scrollBy(0, 180));
        await frame(page, 4);
    }
    await frame(page, 18);
    await page.evaluate(() => window.scrollTo(0, 0));
    await frame(page, 6);

    // ── Customer Orders History ──────────────────────────────────────────────
    console.log('📦 [8/12] Customer Orders History...');
    await page.goto('http://localhost:5173/orders', { waitUntil: 'networkidle2' });
    await frame(page, 15);

    // Clear session for Vendor Portal
    await page.evaluate(() => localStorage.clear());

    // ══════════════════════════════════════════════════════════════════════════
    //  SECTION 2: VENDOR INTELLIGENCE SUITE
    // ══════════════════════════════════════════════════════════════════════════
    console.log('🏪 [9/12] Vendor Login...');
    await page.goto('http://localhost:5173/vendor-login', { waitUntil: 'networkidle2' });
    await frame(page, 10);
    await page.type('#vendor-email', 'vendor@simplystore.com', { delay: 40 });
    await frame(page, 5);
    await page.type('#vendor-password', 'password123', { delay: 40 });
    await frame(page, 5);
    await page.click('#vendor-submit');
    await new Promise(r => setTimeout(r, 2000));
    await frame(page, 20);

    console.log('   📊 Vendor Dashboard — Overview & Sales Analytics...');
    for (let i = 0; i < 6; i++) {
        await page.evaluate(() => window.scrollBy(0, 200));
        await frame(page, 4);
    }
    await frame(page, 18);
    await page.evaluate(() => window.scrollTo(0, 0));
    await frame(page, 6);

    // ── Vendor Pricing Rules & KYC Pages ─────────────────────────────────────
    console.log('   💰 Vendor Dynamic Pricing Rules Page...');
    await page.goto('http://localhost:5173/vendor', { waitUntil: 'networkidle2' });
    await frame(page, 15);

    // Clear session for Admin Portal
    await page.evaluate(() => localStorage.clear());

    // ══════════════════════════════════════════════════════════════════════════
    //  SECTION 3: ADMIN OPERATIONAL CONTROL CENTER
    // ══════════════════════════════════════════════════════════════════════════
    console.log('🛡️ [11/12] Admin Login...');
    await page.goto('http://localhost:5173/admin-login', { waitUntil: 'networkidle2' });
    await frame(page, 10);
    await page.type('#admin-email', 'admin@simplystore.com', { delay: 40 });
    await frame(page, 5);
    await page.type('#admin-password', 'admin123', { delay: 40 });
    await frame(page, 5);
    await page.click('#admin-login-submit');
    await new Promise(r => setTimeout(r, 2000));
    await frame(page, 22);

    console.log('   ⚙️ Admin Dashboard — Global System Operations...');
    for (let i = 0; i < 8; i++) {
        await page.evaluate(() => window.scrollBy(0, 200));
        await frame(page, 4);
    }
    await frame(page, 22);

    // Demonstrate Tab Switch in Admin Dashboard (e.g. KYC Queue, Global Inventory, Listed Vendors)
    console.log('   📋 Demonstrating Admin Dashboard Tabs (KYC Queue, Inventory, Vendors)...');
    const adminTabs = await page.$$('button');
    for (let b of adminTabs) {
        const txt = await page.evaluate(el => el.textContent, b);
        if (txt && (txt.includes('KYC') || txt.includes('Inventory') || txt.includes('Vendors'))) {
            await b.click();
            await new Promise(r => setTimeout(r, 800));
            await frame(page, 15);
        }
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await frame(page, 15);

    console.log(`🎉 Master Video Capture Complete! Total frames recorded: ${frameCount}`);
    await browser.close();
})();
