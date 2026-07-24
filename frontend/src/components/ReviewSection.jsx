import React, { useEffect, useState } from 'react';
import { Star, ThumbsUp, CheckCircle, HelpCircle, MessageSquare, Plus } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [quality, setQuality] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [packaging, setPackaging] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Q&A state
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, qnaRes] = await Promise.all([
        api.get(`/reviews/${productId}`),
        api.get(`/reviews/questions/${productId}`)
      ]);
      setReviews(revRes.data);
      setQuestions(qnaRes.data);
    } catch (err) {
      console.error('Failed to load reviews/Q&As:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchData();
  }, [productId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      toast.error('Please enter a title and review content');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productId,
        rating,
        title,
        body,
        attributes: { quality, accuracy, packaging }
      });
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      setTitle('');
      setBody('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review. Only verified purchasers can review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!questionText) return;
    setSubmittingQuestion(true);
    try {
      await api.post('/reviews/questions', {
        productId,
        questionText
      });
      toast.success('Question posted successfully!');
      setQuestionText('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
      toast.success('Marked as helpful!');
    } catch (err) {
      toast.error('Failed to vote review');
    }
  };

  // Calculations
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 5.0;

  const getDistribution = (stars) => {
    if (reviews.length === 0) return 0;
    const count = reviews.filter(r => r.rating === stars).length;
    return Math.round((count / reviews.length) * 100);
  };

  return (
    <div className="py-10 border-t border-gray-100 dark:border-gray-800/80 mt-10">
      
      {/* ── Tabs & Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-950 dark:text-white">Shopper Reviews & Questions</h3>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Real customer experience breakdown</p>
        </div>
        <button
          onClick={() => setShowReviewModal(true)}
          className="bg-violet-600 hover:bg-violet-750 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-violet-100 dark:shadow-none transition duration-300 text-sm"
        >
          <Plus size={16} /> Write a Review
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Rating Overview Box */}
        <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
          <h4 className="text-5xl font-black text-gray-950 dark:text-white mb-2">{averageRating}</h4>
          <div className="flex gap-0.5 mb-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} className={i < Math.round(averageRating) ? 'fill-amber-500 text-amber-500' : 'text-gray-250'} />
            ))}
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{reviews.length} Verified Ratings</p>
        </div>

        {/* Stars Breakdown Grid */}
        <div className="lg:col-span-2 space-y-2.5 flex flex-col justify-center">
          {[5, 4, 3, 2, 1].map((stars) => {
            const pct = getDistribution(stars);
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-gray-500 font-bold flex items-center gap-1">{stars} Star</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-violet-600 h-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right font-bold text-gray-400">{pct}%</span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Reviews list ↔ Q&A columns split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Reviews List (span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <h4 className="text-base font-black text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
            Recent Reviews ({reviews.length})
          </h4>
          {reviews.length === 0 ? (
            <p className="text-center py-10 text-sm text-gray-400 font-medium">No reviews yet. Be the first to purchase and review!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="border-b border-gray-50 dark:border-gray-800/40 pb-6 last:border-b-0">
                <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                  <div>
                    <h5 className="font-bold text-gray-950 dark:text-white leading-tight">{rev.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} className={i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-250'} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        by <span className="font-bold text-gray-600 dark:text-gray-300">{rev.userName}</span> on {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {rev.verifiedPurchase && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                      <CheckCircle size={10} /> Verified Purchase
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{rev.body}</p>

                {/* Attributes breakdown chips */}
                <div className="flex gap-4 text-[10px] text-gray-450 dark:text-gray-500 font-bold uppercase tracking-wider mb-4 flex-wrap">
                  <span>Quality: <span className="text-violet-600 font-black">{rev.attributes?.quality || 5}/5</span></span>
                  <span>Accuracy: <span className="text-violet-600 font-black">{rev.attributes?.accuracy || 5}/5</span></span>
                  <span>Packaging: <span className="text-violet-600 font-black">{rev.attributes?.packaging || 5}/5</span></span>
                </div>

                <button
                  onClick={() => handleHelpful(rev.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition"
                >
                  <ThumbsUp size={12} /> <span>Helpful ({rev.helpfulCount || 0})</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Q&A panel (span-1) */}
        <div className="bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl h-fit">
          <h4 className="text-base font-black text-gray-950 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-violet-600" /> Customer Q&A
          </h4>
          
          <form onSubmit={handleQuestionSubmit} className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs outline-none focus:border-violet-500 transition dark:text-white"
            />
            <button
              type="submit"
              disabled={submittingQuestion}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold p-2.5 rounded-xl transition flex-shrink-0"
            >
              Ask
            </button>
          </form>

          {questions.length === 0 ? (
            <p className="text-center py-6 text-xs text-gray-400 font-medium">No questions asked yet. Be the first!</p>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {questions.map((q) => (
                <div key={q.id} className="text-xs border-b border-gray-50 dark:border-gray-800/40 pb-3 last:border-b-0">
                  <div className="flex gap-1.5 items-start">
                    <span className="font-black text-violet-600 text-sm">Q:</span>
                    <div>
                      <p className="font-bold text-gray-950 dark:text-white">{q.questionText}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">asked by {q.userName}</p>
                    </div>
                  </div>
                  {q.answerText ? (
                    <div className="flex gap-1.5 items-start mt-2 p-2 bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100 dark:border-violet-950/20 rounded-lg">
                      <span className="font-black text-emerald-600 text-sm">A:</span>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium leading-normal">{q.answerText}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">Answered by Store Seller</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 italic mt-2 pl-4">Awaiting response from merchant.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Review Submission Modal ── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowReviewModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-150 dark:border-gray-800 overflow-y-auto max-h-[90vh] z-10 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-950 dark:text-white">Write a Product Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-450 hover:text-gray-600 font-bold text-sm">Close</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">Overall Rating</label>
                <div className="flex gap-2.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star size={24} className={val <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-250'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">Review Title</label>
                <input
                  type="text"
                  placeholder="Summarize your experience..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs outline-none focus:border-violet-500 transition dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">Detailed Feedback</label>
                <textarea
                  rows="3"
                  placeholder="What did you like or dislike? How does it look?"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs outline-none focus:border-violet-500 transition dark:text-white"
                />
              </div>

              {/* Attributes sliders */}
              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Product Details Quality</p>
                
                {[['Quality', quality, setQuality], ['Accuracy', accuracy, setAccuracy], ['Packaging', packaging, setPackaging]].map(([label, val, setter]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-16 font-semibold text-gray-500">{label}</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={val}
                      onChange={(e) => setter(parseInt(e.target.value))}
                      className="flex-1 accent-violet-600"
                    />
                    <span className="font-bold text-violet-600 w-4 text-right">{val}</span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-violet-600 hover:bg-violet-750 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition duration-300 shadow-lg mt-6"
              >
                {submittingReview ? 'Submitting review...' : 'Submit Verified Review'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
