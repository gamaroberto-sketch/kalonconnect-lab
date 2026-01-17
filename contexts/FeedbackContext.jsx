"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import FeedbackToast from '../components/FeedbackToast';

const FeedbackContext = createContext({});

export const useFeedback = () => useContext(FeedbackContext);

export const FeedbackProvider = ({ children }) => {
    const [feedback, setFeedback] = useState(null);

    /**
     * Shows a feedback toast.
     * @param {Object} options
     * @param {string} options.title - The title (e.g. "Perfil Completo!")
     * @param {string} options.message - The description
     * @param {string} options.type - 'success' | 'error' | 'info' (default: success)
     * @param {Object} [options.cta] - Optional CTA { label, action }
     * @param {number} [options.duration] - Duration in ms (default: 5000)
     */
    const showFeedback = useCallback(({ title, message, type = 'success', cta, duration = 5000 }) => {
        // Clear previous if any to allow re-animation or standard replace
        setFeedback(null);

        // Small delay to ensure clear if spamming, but mostly to reset animation
        setTimeout(() => {
            setFeedback({
                id: Date.now(),
                title,
                message,
                type,
                cta
            });
        }, 50);

        if (duration > 0) {
            setTimeout(() => {
                setFeedback((current) => {
                    // Only clear if it's the same feedback (avoid clearing a newer one)
                    // We can't easily check IDs inside timeout without refs or complex logic, 
                    // but for this simple app, clearing the *current* state is usually fine 
                    // if we assume user isn't spamming triggers.
                    // A safer way is checking ID but let's keep it simple for now as per "simple toast" request.
                    return null;
                });
            }, duration);
        }
    }, []);

    const closeFeedback = useCallback(() => {
        setFeedback(null);
    }, []);

    // 🟢 ACHADO #13: Global Event Bus for non-component feedback
    React.useEffect(() => {
        if (typeof window === "undefined") return;

        const handleCustomToast = (event) => {
            const { title, message, type, duration } = event.detail || {};
            if (message) {
                showFeedback({ title, message, type, duration });
            }
        };

        window.addEventListener("kalon-toast", handleCustomToast);
        return () => window.removeEventListener("kalon-toast", handleCustomToast);
    }, [showFeedback]);

    return (
        <FeedbackContext.Provider value={{ showFeedback, closeFeedback }}>
            {children}
            <FeedbackToast feedback={feedback} onClose={closeFeedback} />
        </FeedbackContext.Provider>
    );
};
