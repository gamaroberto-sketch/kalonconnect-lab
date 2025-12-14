"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../components/AuthContext';
import { trackActivity } from '../lib/userActivity';

/**
 * Hook to automatically track user activities
 * @param {Object} options
 * @param {boolean} options.trackPageViews - Auto-track page views (default: true)
 */
export function useActivityTracker(options = {}) {
    const { trackPageViews = true } = options;
    const router = useRouter();
    const { user } = useAuth();

    // Track page views
    useEffect(() => {
        if (!trackPageViews || !user?.uid) return;

        const handleRouteChange = (url) => {
            trackActivity({
                userId: user.uid,
                activityType: 'PAGE_VIEW',
                pagePath: url,
            });
        };

        // Track initial page view
        handleRouteChange(router.pathname);

        // Track subsequent page changes
        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router, user, trackPageViews]);

    // Return helper function for custom events
    const track = (activityType, metadata = {}) => {
        if (!user?.uid) return;

        trackActivity({
            userId: user.uid,
            activityType,
            metadata,
        });
    };

    return { track };
}
