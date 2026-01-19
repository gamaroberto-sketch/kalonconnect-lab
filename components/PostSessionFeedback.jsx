import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PostSessionFeedback = ({ isOpen, onClose, sessionId }) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // If not open, don't render anything (component handles its own mounting/unmounting animation via AnimatePresence if wrapper handles it, 
    // but here we might want to return null effectively or rely on parent. 
    // Let's assume parent handles conditional rendering or we use AnimatePresence here for the modal content)

    const handleRating = (value) => {
        setRating(value);
    };

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    rating,
                    comment,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    onClose();
                    // Reset state after closing
                    setTimeout(() => {
                        setSubmitted(false);
                        setRating(0);
                        setComment('');
                        setIsSubmitting(false);
                    }, 300);
                }, 2000);
            } else {
                console.error('Failed to submit feedback');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setIsSubmitting(false);
        }
    };

    if (!isOpen && !submitted) return null; // Simple visibility check, though AnimatePresence would be better in parent.

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800 relative">
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {submitted ? t('feedback.thankYouTitle', 'Thank You!') : t('feedback.rateSessionTitle', 'How was your session?')}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {submitted
                                    ? t('feedback.thankYouMessage', 'Your feedback helps us improve.')
                                    : t('feedback.rateSessionMessage', 'Please rate your experience with technical quality.')}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {!submitted ? (
                                <>
                                    {/* Star Rating */}
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => handleRating(star)}
                                                className="p-1 focus:outline-none transition-transform hover:scale-110"
                                                onMouseEnter={() => { }} // Optional: hover state logic
                                            >
                                                <Star
                                                    className={`w-10 h-10 ${star <= rating
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'fill-transparent text-slate-300 dark:text-slate-700'
                                                        } transition-colors duration-200`}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Comment Area (Optional) */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            {t('feedback.commentsLabel', 'Additional Comments (Optional)')}
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder={t('feedback.commentsPlaceholder', 'Any issues with audio/video?')}
                                            className="w-full h-24 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={rating === 0 || isSubmitting}
                                        className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${rating > 0
                                                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                {t('feedback.submitButton', 'Submit Feedback')}
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <Star className="w-8 h-8 text-green-500 fill-green-500" />
                                    </div>
                                    <p className="text-center text-slate-600 dark:text-slate-300">
                                        {t('feedback.feedbackReceived', 'Your feedback has been recorded.')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PostSessionFeedback;
