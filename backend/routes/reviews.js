import express from "express";
import { protect, vendorOnly } from "../middleware/auth.middleware.js";
import Review from "../models/review.model.js";
import Question from "../models/question.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

const router = express.Router();

// GET /api/reviews/questions/:productId — Fetch Q&A list
router.get("/questions/:productId", async (req, res) => {
    try {
        const questions = await Question.find({ productId: req.params.productId }).sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch questions", error: error.message });
    }
});

// POST /api/reviews/questions — Ask a question
router.post("/questions", protect, async (req, res) => {
    const { productId, questionText } = req.body;
    if (!productId || !questionText) {
        return res.status(400).json({ message: "Please provide productId and questionText" });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const questionId = "q_" + Math.random().toString(36).substring(2, 11);
        const question = await Question.create({
            _id: questionId,
            productId,
            userId: req.user.id,
            userName: req.user.name || "Customer",
            questionText,
            vendorId: product.vendorId
        });

        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: "Failed to submit question", error: error.message });
    }
});

// PATCH /api/reviews/questions/:id/answer — Vendor submits an answer
router.patch("/questions/:id/answer", protect, vendorOnly, async (req, res) => {
    const { answerText } = req.body;
    if (!answerText) return res.status(400).json({ message: "Answer text is required" });

    try {
        const question = await Question.findOne({ _id: req.params.id, vendorId: req.user.id });
        if (!question) {
            return res.status(404).json({ message: "Question not found or unauthorized" });
        }

        question.answerText = answerText;
        question.answeredAt = new Date();
        await question.save();

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: "Failed to answer question", error: error.message });
    }
});

// GET /api/reviews/:productId — Get all reviews for a product
router.get("/:productId", async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
    }
});

// POST /api/reviews — Submit a review (checks verified purchase)
router.post("/", protect, async (req, res) => {
    const { productId, rating, title, body, attributes } = req.body;
    if (!productId || !rating || !title || !body) {
        return res.status(400).json({ message: "Please provide productId, rating, title, and body" });
    }

    try {
        // Verified purchase check: find delivered order by this user containing this product
        const deliveredOrder = await Order.findOne({
            userId: req.user.id,
            status: "Delivered",
            "items.id": productId
        });

        if (!deliveredOrder) {
            return res.status(403).json({ message: "You can only review products you have purchased and received." });
        }

        // Duplicate review check
        const existingReview = await Review.findOne({ userId: req.user.id, productId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product." });
        }

        const reviewId = "rev_" + Math.random().toString(36).substring(2, 11);
        const review = await Review.create({
            _id: reviewId,
            productId,
            userId: req.user.id,
            userName: req.user.name || "Customer",
            rating,
            title,
            body,
            attributes: attributes || { quality: 5, accuracy: 5, packaging: 5 },
            verifiedPurchase: !!deliveredOrder
        });

        // Update product overall rating statistics
        const product = await Product.findById(productId);
        if (product) {
            const currentRate = product.rating?.rate || 5.0;
            const currentCount = product.rating?.count || 0;
            const newCount = currentCount + 1;
            const newRate = ((currentRate * currentCount) + rating) / newCount;

            product.rating = {
                rate: parseFloat(newRate.toFixed(1)),
                count: newCount
            };
            await product.save();
        }

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: "Failed to submit review", error: error.message });
    }
});

// POST /api/reviews/:id/helpful — Upvote a review
router.post("/:id/helpful", protect, async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $inc: { helpfulCount: 1 } },
            { new: true }
        );
        if (!review) return res.status(404).json({ message: "Review not found" });
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: "Failed to update review", error: error.message });
    }
});

export default router;
