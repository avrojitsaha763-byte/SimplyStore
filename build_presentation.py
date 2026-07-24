import sys
import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

sys.stdout.reconfigure(encoding='utf-8')

def create_presentation():
    print("🎨 Rebuilding PPT presentation with Week 3 New Features & Visuals: SimplyStore_Presentation.pptx...")
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # blank slide

    # Color Palette
    COLOR_BG = RGBColor(11, 15, 26)       # Deep slate #0B0F1A
    COLOR_CARD = RGBColor(17, 24, 39)     # Dark slate card #111827
    COLOR_PRIMARY = RGBColor(124, 58, 237)# Deep Violet #7C3AED
    COLOR_ACCENT = RGBColor(244, 63, 94)  # Rose Accent #F43F5E
    COLOR_TEXT = RGBColor(255, 255, 255)  # Crisp White
    COLOR_MUTED = RGBColor(148, 163, 184)# Slate 400

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="WEEK 3 NEW FEATURES & SPRINT DELIVERABLES"):
        # Category Tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(10), Inches(0.4))
        tf_cat = cat_box.text_frame
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = COLOR_PRIMARY

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11), Inches(0.6))
        tf_title = title_box.text_frame
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_TEXT

    # ── SLIDE 1: Title Slide ──────────────────────────────────────────────────
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1)
    
    logo = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.666), Inches(1.5), Inches(2.0), Inches(2.0))
    logo.fill.solid()
    logo.fill.fore_color.rgb = COLOR_PRIMARY
    logo.line.fill.background()
    tf_l = logo.text_frame
    p_l = tf_l.paragraphs[0]
    p_l.text = "S"
    p_l.alignment = PP_ALIGN.CENTER
    p_l.font.size = Pt(72)
    p_l.font.bold = True
    p_l.font.color.rgb = COLOR_TEXT

    t_box = slide1.shapes.add_textbox(Inches(1.0), Inches(3.8), Inches(11.333), Inches(1.0))
    p = t_box.text_frame.paragraphs[0]
    p.text = "SimplyStore — Week 3 Feature Additions"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = COLOR_TEXT

    sub_box = slide1.shapes.add_textbox(Inches(1.0), Inches(4.8), Inches(11.333), Inches(0.8))
    p_sub = sub_box.text_frame.paragraphs[0]
    p_sub.text = "3rd Weekly Review — Comprehensive Showcase of Newly Added Features & Services"
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.font.size = Pt(16)
    p_sub.font.color.rgb = COLOR_MUTED

    author_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.8), Inches(5.8), Inches(5.7), Inches(0.9))
    author_card.fill.solid()
    author_card.fill.fore_color.rgb = COLOR_CARD
    author_card.line.color.rgb = COLOR_PRIMARY
    p_auth = author_card.text_frame.paragraphs[0]
    p_auth.text = "Presenter: Avrojit Saha (Intern)  |  Role: Full-Stack Developer\nDate: July 2026  |  Focus: Week 3 Sprint Feature Visuals & Demonstration"
    p_auth.alignment = PP_ALIGN.CENTER
    p_auth.font.size = Pt(12)
    p_auth.font.color.rgb = COLOR_TEXT

    # ── SLIDE 2: Week 3 Sprint Overview ──────────────────────────────────────
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)
    add_header(slide2, "Week 3 Sprint Overview & Completed Deliverables")

    metrics = [
        ("5 New Services", "Added in Week 3 Sprints"),
        ("100% Tax Compliant", "Indian GST Invoicing Engine"),
        ("Vendor KYC Queue", "Admin Document Verification"),
        ("B2B Wholesale", "Price Quote Negotiation")
    ]
    for i, (val, lbl) in enumerate(metrics):
        box = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + i*2.95), Inches(1.5), Inches(2.75), Inches(1.2))
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_CARD
        box.line.color.rgb = COLOR_PRIMARY
        tf = box.text_frame
        p1 = tf.paragraphs[0]
        p1.text = val
        p1.font.size = Pt(22)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_PRIMARY
        p1.alignment = PP_ALIGN.CENTER
        p2 = tf.add_paragraph()
        p2.text = lbl
        p2.font.size = Pt(11)
        p2.font.color.rgb = COLOR_MUTED
        p2.alignment = PP_ALIGN.CENTER

    col1 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(3.0), Inches(5.7), Inches(3.8))
    col1.fill.solid()
    col1.fill.fore_color.rgb = COLOR_CARD
    col1.line.fill.background()
    tf1 = col1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "✨ Week 3 New Feature Additions"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_TEXT
    
    new_feats = [
        "1. Indian GST Calculation Engine (CGST, SGST, IGST 18%)",
        "2. Sequential Legal Invoicing System (INV-2026-00001)",
        "3. Gamified Loyalty Rewards & Custom Referral Links",
        "4. B2B Wholesale Price Quote Negotiation Portal",
        "5. Vendor Sales Velocity & Inventory Reorder Forecasting",
        "6. Admin Vendor KYC Verification Queue (GSTIN/PAN/Bank)"
    ]
    for nf in new_feats:
        p_nf = tf1.add_paragraph()
        p_nf.text = f"• {nf}"
        p_nf.font.size = Pt(12)
        p_nf.font.color.rgb = COLOR_MUTED

    col2 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(3.0), Inches(5.7), Inches(3.8))
    col2.fill.solid()
    col2.fill.fore_color.rgb = COLOR_CARD
    col2.line.fill.background()
    tf2 = col2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "🔧 Infrastructure & Bug Fixes This Week"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_TEXT

    fixes = [
        "Express 5 compatibility fix in express-mongo-sanitize",
        "Atomic Mongoose $inc stock decrement preventing overselling",
        "Zero-config MongoMemoryServer fallback with auto-seeding",
        "GDPR data export and account deletion API endpoints",
        "Razorpay payment signature validation & verification",
        "PWA service worker offline support & push notifications"
    ]
    for fx in fixes:
        p_fx = tf2.add_paragraph()
        p_fx.text = f"✔ {fx}"
        p_fx.font.size = Pt(12)
        p_fx.font.color.rgb = COLOR_TEXT

    # ── SLIDE 3: Week 3 Feature 1 — GST Invoicing ─────────────────────────────
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)
    add_header(slide3, "Week 3 Feature 1: Indian GST Tax Engine & Invoicing")

    desc1 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(4.5), Inches(5.3))
    desc1.fill.solid()
    desc1.fill.fore_color.rgb = COLOR_CARD
    desc1.line.fill.background()
    tf = desc1.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "New Service Added This Week"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY
    
    f1_details = [
        "Automated GST Breakdown: Calculates CGST (9%) + SGST (9%) for intra-state transactions or IGST (18%) for inter-state buyer addresses.",
        "Free Shipping Threshold: Dynamic progress bar targeting $150 free shipping eligibility.",
        "Sequential Invoicing: Generates legally compliant invoice numbers (e.g., INV-2026-00001) backed by an atomic counter.",
        "Atomic Stock Lock: Reserves inventory atomically during checkout to eliminate race conditions."
    ]
    for fd in f1_details:
        p_fd = tf.add_paragraph()
        p_fd.text = f"• {fd}"
        p_fd.font.size = Pt(12)
        p_fd.font.color.rgb = COLOR_TEXT

    if os.path.exists("screenshots/customer_checkout.png"):
        slide3.shapes.add_picture("screenshots/customer_checkout.png", Inches(5.5), Inches(1.5), Inches(7.0), Inches(5.3))

    # ── SLIDE 4: Week 3 Feature 2 — Loyalty & Referrals ───────────────────────
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4)
    add_header(slide4, "Week 3 Feature 2: Loyalty Rewards & Referral Program")

    desc2 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(4.5), Inches(5.3))
    desc2.fill.solid()
    desc2.fill.fore_color.rgb = COLOR_CARD
    desc2.line.fill.background()
    tf = desc2.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "New Service Added This Week"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    f2_details = [
        "Gamified Tier Badges: Tiered user progression (Bronze, Silver, Gold, Platinum) with custom badges.",
        "Points Earning & Credit Redemption: Customers earn 1 point per $10 spent; redeem points for instant checkout credits.",
        "Shareable Referral Links: Generates unique user referral URLs (e.g. ref_user123).",
        "Referral Cashback: Credits bonus reward points upon successful referred friend purchases."
    ]
    for fd in f2_details:
        p_fd = tf.add_paragraph()
        p_fd.text = f"• {fd}"
        p_fd.font.size = Pt(12)
        p_fd.font.color.rgb = COLOR_TEXT

    if os.path.exists("screenshots/customer_referrals.png"):
        slide4.shapes.add_picture("screenshots/customer_referrals.png", Inches(5.5), Inches(1.5), Inches(7.0), Inches(5.3))

    # ── SLIDE 5: Week 3 Feature 3 — B2B Wholesale Portal ──────────────────────
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5)
    add_header(slide5, "Week 3 Feature 3: B2B Wholesale Quote Negotiation")

    desc3 = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(4.5), Inches(5.3))
    desc3.fill.solid()
    desc3.fill.fore_color.rgb = COLOR_CARD
    desc3.line.fill.background()
    tf = desc3.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "New Service Added This Week"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    f3_details = [
        "Bulk Buyer Quote Submission: Dedicated wholesale portal enabling bulk quantity purchase requests.",
        "Custom Price Negotiation: Buyers submit custom unit price offers and messaging notes to vendors.",
        "Vendor Quote Management: Vendors review, accept, reject, or counter-offer wholesale quotes.",
        "Direct Cart Conversion: Approved quotes convert into one-click bulk checkout orders."
    ]
    for fd in f3_details:
        p_fd = tf.add_paragraph()
        p_fd.text = f"• {fd}"
        p_fd.font.size = Pt(12)
        p_fd.font.color.rgb = COLOR_TEXT

    if os.path.exists("screenshots/customer_wholesale.png"):
        slide5.shapes.add_picture("screenshots/customer_wholesale.png", Inches(5.5), Inches(1.5), Inches(7.0), Inches(5.3))

    # ── SLIDE 6: Week 3 Feature 4 — Vendor Intelligence ───────────────────────
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6)
    add_header(slide6, "Week 3 Feature 4: Vendor Velocity & Reorder Forecast")

    desc4 = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(4.5), Inches(5.3))
    desc4.fill.solid()
    desc4.fill.fore_color.rgb = COLOR_CARD
    desc4.line.fill.background()
    tf = desc4.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "New Service Added This Week"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    f4_details = [
        "Product Sales Velocity: Real-time velocity tracking for top 5 selling vendor items.",
        "Automated Reorder Forecasting: Predicts stock depletion dates and recommends reorder quantities.",
        "Rule-Based Dynamic Pricing: Enables vendors to set automated stock-level and time-based discount rules.",
        "Vendor SLA Performance Score: Evaluates fulfillment accuracy, return rate, and stock reliability."
    ]
    for fd in f4_details:
        p_fd = tf.add_paragraph()
        p_fd.text = f"• {fd}"
        p_fd.font.size = Pt(12)
        p_fd.font.color.rgb = COLOR_TEXT

    if os.path.exists("screenshots/vendor_dashboard.png"):
        slide6.shapes.add_picture("screenshots/vendor_dashboard.png", Inches(5.5), Inches(1.5), Inches(7.0), Inches(5.3))

    # ── SLIDE 7: Week 3 Feature 5 — Admin Vendor KYC Queue ────────────────────
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7)
    add_header(slide7, "Week 3 Feature 5: Admin Vendor KYC Verification Queue")

    desc5 = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(4.5), Inches(5.3))
    desc5.fill.solid()
    desc5.fill.fore_color.rgb = COLOR_CARD
    desc5.line.fill.background()
    tf = desc5.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "New Service Added This Week"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    f5_details = [
        "KYC Document Queue: Dedicated verification queue (/admin) reviewing vendor GSTIN, PAN, and Bank details.",
        "One-Click Compliance Actions: Admins can approve or reject vendor onboarding with reason notes.",
        "Global Inventory Supervision: Monitor product stock across all active marketplace vendors.",
        "CSV Order Exporter: One-click export of complete order history for reporting and accounting."
    ]
    for fd in f5_details:
        p_fd = tf.add_paragraph()
        p_fd.text = f"• {fd}"
        p_fd.font.size = Pt(12)
        p_fd.font.color.rgb = COLOR_TEXT

    if os.path.exists("screenshots/admin_dashboard.png"):
        slide7.shapes.add_picture("screenshots/admin_dashboard.png", Inches(5.5), Inches(1.5), Inches(7.0), Inches(5.3))

    # ── SLIDE 8: Customer Storefront Catalog ──────────────────────────────────
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8)
    add_header(slide8, "Customer Storefront — Catalog & Product Discovery")

    desc6 = slide8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(4.5), Inches(5.3))
    desc6.fill.solid()
    desc6.fill.fore_color.rgb = COLOR_CARD
    desc6.line.fill.background()
    tf = desc6.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Storefront Experience"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    cat_details = [
        "Dynamic Filtering: Instant category filtering across Electronics, Fashion, Home & Kitchen.",
        "Regex Search Engine: Client and server-side text search with instant results.",
        "Real-Time Stock Alerts: Badges indicating low stock ('Only 5 left') and discount chips.",
        "Dark / Light Mode: Seamless theme toggle for enhanced accessibility."
    ]
    for cd in cat_details:
        p_cd = tf.add_paragraph()
        p_cd.text = f"• {cd}"
        p_cd.font.size = Pt(12)
        p_cd.font.color.rgb = COLOR_TEXT

    if os.path.exists("screenshots/customer_catalog.png"):
        slide8.shapes.add_picture("screenshots/customer_catalog.png", Inches(5.5), Inches(1.5), Inches(7.0), Inches(5.3))

    # ── SLIDE 9: Security & Bug Remediation ───────────────────────────────────
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9)
    add_header(slide9, "Quality Assurance, Security & Concurrency Engineering")

    sec_cards = [
        ("Atomic Concurrency Locks", "Prevented negative inventory race conditions by utilizing Mongoose atomic $inc operations with $gte stock verification during checkout."),
        ("Express 5 Compatibility", "Resolved req.query getter property conflict in express-mongo-sanitize middleware by implementing safe in-place body sanitization."),
        ("Resilient DB Fallback", "Created zero-config MongoMemoryServer fallback in connectDB that automatically spins up an in-memory MongoDB instance with auto-seeding."),
        ("GDPR & Security Audit", "Implemented GDPR data-export and account deletion APIs. Enforced rate limiting, password hashing (bcrypt), and JWT role verification.")
    ]

    for i, (title, body) in enumerate(sec_cards):
        x = Inches(0.8 + (i % 2) * 5.95)
        y = Inches(1.5 + (i // 2) * 2.8)
        card = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.75), Inches(2.5))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD
        card.line.color.rgb = COLOR_ACCENT
        tf = card.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_ACCENT
        p_b = tf.add_paragraph()
        p_b.text = body
        p_b.font.size = Pt(12)
        p_b.font.color.rgb = COLOR_TEXT

    # ── SLIDE 10: Milestones & Future Roadmap ─────────────────────────────────
    slide10 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide10)
    add_header(slide10, "Internship Review 3 Summary & Upcoming Roadmap")

    milestones_box = slide10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.3))
    milestones_box.fill.solid()
    milestones_box.fill.fore_color.rgb = COLOR_CARD
    milestones_box.line.color.rgb = COLOR_PRIMARY
    tf_m = milestones_box.text_frame
    tf_m.word_wrap = True
    p = tf_m.paragraphs[0]
    p.text = "✅ Week 3 Review Accomplishments"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_PRIMARY

    m_items = [
        "100% Clean Build: Vite 8 compiled 2835 frontend modules cleanly",
        "Runtime Verification: Verified Customer, Vendor, and Admin authentication & workflows",
        "Week 3 Feature Suite: Indian GST, Loyalty/Referrals, B2B Wholesale, Vendor Intelligence, Admin KYC Queue",
        "Comprehensive Deliverables: Updated widescreen PPT deck, detailed PDF report, and 3-minute master video walkthrough"
    ]
    for item in m_items:
        p_item = tf_m.add_paragraph()
        p_item.text = f"✔ {item}"
        p_item.font.size = Pt(12)
        p_item.font.color.rgb = COLOR_TEXT

    roadmap_box = slide10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.3))
    roadmap_box.fill.solid()
    roadmap_box.fill.fore_color.rgb = COLOR_CARD
    roadmap_box.line.color.rgb = COLOR_ACCENT
    tf_r = roadmap_box.text_frame
    tf_r.word_wrap = True
    p = tf_r.paragraphs[0]
    p.text = "🚀 Future Development Roadmap"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = COLOR_ACCENT

    r_items = [
        "AI Shopping Assistant: Recommendation agent for personalized discovery",
        "Visual Search: AI image recognition product search",
        "Native Mobile Apps: React Native / Expo iOS & Android builds",
        "Internationalization: Multi-currency & multi-language support"
    ]
    for item in r_items:
        p_item = tf_r.add_paragraph()
        p_item.text = f"➔ {item}"
        p_item.font.size = Pt(12)
        p_item.font.color.rgb = COLOR_TEXT

    prs.save("SimplyStore_Presentation.pptx")
    print("🎉 Successfully rebuilt presentation with Week 3 feature images: SimplyStore_Presentation.pptx")

if __name__ == "__main__":
    create_presentation()
