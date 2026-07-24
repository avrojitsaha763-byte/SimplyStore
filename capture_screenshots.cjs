const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, 'screenshots');
const framesDir = path.join(__dirname, 'video_frames');

// Clean existing frames
if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true, force: true });
}
fs.mkdirSync(framesDir, { recursive: true });
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

let frameCount = 0;
async function recordFrame(page, count = 1, delay = 150) {
    for (let c = 0; c < count; c++) {
        frameCount++;
        const framePath = path.join(framesDir, `frame_${String(frameCount).padStart(5, '0')}.png`);
        await page.screenshot({ path: framePath });
        if (delay > 0) await new Promise(r => setTimeout(r, delay));
    }
}

(async () => {
    console.log('🚀 Starting detailed, slow-paced video capture of SimplyStore...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        defaultViewport: { width: 1440, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // ── 1. CUSTOMER CATALOG HOMEPAGE ─────────────────────────────────────────
    console.log('📸 [1/7] Recording Customer Catalog Homepage & Search/Filtering...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await recordFrame(page, 10); // Pause on header

    // Scroll down slowly through product grid
    for (let i = 0; i < 8; i++) {
        await page.evaluate(() => window.scrollBy(0, 200));
        await recordFrame(page, 3);
    }
    await recordFrame(page, 10); // Hold bottom view

    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0));
    await recordFrame(page, 5);

    // Filter Category: Electronics
    console.log('   🔍 Filtering category: Electronics...');
    const buttons = await page.$$('button');
    for (let b of buttons) {
        const text = await page.evaluate(el => el.textContent, b);
        if (text && text.includes('Electronics')) {
            await b.click();
            break;
        }
    }
    await new Promise(r => setTimeout(r, 800));
    await recordFrame(page, 12);

    // Filter Category: Fashion
    console.log('   🔍 Filtering category: Fashion...');
    const buttons2 = await page.$$('button');
    for (let b of buttons2) {
        const text = await page.evaluate(el => el.textContent, b);
        if (text && text.includes('Fashion')) {
            await b.click();
            break;
        }
    }
    await new Promise(r => setTimeout(r, 800));
    await recordFrame(page, 12);

    // Reset Filter: All Products
    const buttonsAll = await page.$$('button');
    for (let b of buttonsAll) {
        const text = await page.evaluate(el => el.textContent, b);
        if (text && text.includes('All')) {
            await b.click();
            break;
        }
    }
    await new Promise(r => setTimeout(r, 500));
    await recordFrame(page, 8);

    // ── 2. CUSTOMER LOGIN & CART ────────────────────────────────────────────
    console.log('🔑 [2/7] Logging in as Customer & Populating Shopping Cart...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await recordFrame(page, 8);

    await page.type('input[type="email"]', 'customer@simplystore.com', { delay: 40 });
    await recordFrame(page, 5);
    await page.type('input[type="password"]', 'password123', { delay: 40 });
    await recordFrame(page, 5);
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1500));
    await recordFrame(page, 10);

    // Populate cart
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

    // View Cart
    console.log('🛒 Viewing Shopping Cart with Free Shipping Progress Bar...');
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });
    await recordFrame(page, 15);

    // Scroll cart page
    for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollBy(0, 150));
        await recordFrame(page, 3);
    }
    await recordFrame(page, 12);
    await page.evaluate(() => window.scrollTo(0, 0));
    await recordFrame(page, 5);

    // ── 3. CHECKOUT & GST TAX CALCULATION ──────────────────────────────────
    console.log('💳 [3/7] Viewing Checkout with Indian GST Tax & Invoice Preview...');
    await page.goto('http://localhost:5173/checkout', { waitUntil: 'networkidle2' });
    await recordFrame(page, 15);

    for (let i = 0; i < 6; i++) {
        await page.evaluate(() => window.scrollBy(0, 180));
        await recordFrame(page, 3);
    }
    await recordFrame(page, 15);
    await page.evaluate(() => window.scrollTo(0, 0));
    await recordFrame(page, 5);

    // ── 4. REFERRALS & LOYALTY REWARDS ──────────────────────────────────────
    console.log('🎁 [4/7] Viewing Loyalty Program & Referral Link Generator...');
    await page.goto('http://localhost:5173/referrals', { waitUntil: 'networkidle2' });
    await recordFrame(page, 15);
    for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollBy(0, 150));
        await recordFrame(page, 3);
    }
    await recordFrame(page, 15);

    // ── 5. B2B WHOLESALE PORTAL ─────────────────────────────────────────────
    console.log('🏢 [5/7] Viewing B2B Wholesale Portal & Bulk Quote Generator...');
    await page.goto('http://localhost:5173/wholesale', { waitUntil: 'networkidle2' });
    await recordFrame(page, 15);
    for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollBy(0, 150));
        await recordFrame(page, 3);
    }
    await recordFrame(page, 15);

    // Clear session for Vendor Login
    await page.evaluate(() => localStorage.clear());

    // ── 6. VENDOR INTELLIGENCE DASHBOARD ────────────────────────────────────
    console.log('🏪 [6/7] Logging in as Vendor & Recording Vendor Analytics Suite...');
    await page.goto('http://localhost:5173/vendor-login', { waitUntil: 'networkidle2' });
    await recordFrame(page, 6);

    await page.type('#vendor-email', 'vendor@simplystore.com', { delay: 40 });
    await recordFrame(page, 4);
    await page.type('#vendor-password', 'password123', { delay: 40 });
    await recordFrame(page, 4);
    await page.click('#vendor-submit');
    await new Promise(r => setTimeout(r, 2000));
    await recordFrame(page, 15);

    // Scroll through Vendor Dashboard tabs and stats
    for (let i = 0; i < 6; i++) {
        await page.evaluate(() => window.scrollBy(0, 200));
        await recordFrame(page, 3);
    }
    await recordFrame(page, 15);
    await page.evaluate(() => window.scrollTo(0, 0));
    await recordFrame(page, 5);

    // Clear session for Admin Login
    await page.evaluate(() => localStorage.clear());

    // ── 7. ADMIN OPERATIONAL CONTROL CENTER ─────────────────────────────────
    console.log('🛡️ [7/7] Logging in as Admin & Recording Admin Dashboard & KYC Queue...');
    await page.goto('http://localhost:5173/admin-login', { waitUntil: 'networkidle2' });
    await recordFrame(page, 6);

    await page.type('#admin-email', 'admin@simplystore.com', { delay: 40 });
    await recordFrame(page, 4);
    await page.type('#admin-password', 'admin123', { delay: 40 });
    await recordFrame(page, 4);
    await page.click('#admin-login-submit');
    await new Promise(r => setTimeout(r, 2000));
    await recordFrame(page, 20);

    // Scroll through Admin Dashboard tabs & KYC queue
    for (let i = 0; i < 8; i++) {
        await page.evaluate(() => window.scrollBy(0, 200));
        await recordFrame(page, 3);
    }
    await recordFrame(page, 20);
    await page.evaluate(() => window.scrollTo(0, 0));
    await recordFrame(page, 10);

    console.log(`🎉 Successfully recorded ${frameCount} total frames across all portals!`);
    await browser.close();
})();
