/**
 * Notification Buffer with Rate Limiting
 * 
 * Prevents spam by grouping notifications within a time window.
 * Max 1 notification every 2 minutes.
 */

import { sendAdminAlert, formatContactAlert, formatGroupedAlert } from './whatsappNotifier';

// In-memory buffer (simple for now, could be Redis/DB for multi-instance)
const buffer = {
    lastNotificationTime: null,
    pendingCount: 0,
    pendingMessages: [],
    timer: null
};

const RATE_LIMIT_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Add a new contact message notification to the buffer
 * @param {Object} messageData
 * @param {string} messageData.userName - Professional's name
 * @param {string} messageData.subject - Message subject
 * @param {string} messageData.category - Message category
 */
export async function notifyNewContactMessage(messageData) {
    const now = Date.now();
    const timeSinceLastNotification = buffer.lastNotificationTime
        ? now - buffer.lastNotificationTime
        : Infinity;

    // If enough time has passed, send immediately
    if (timeSinceLastNotification >= RATE_LIMIT_MS) {
        await sendImmediateNotification(messageData);
        return;
    }

    // Otherwise, buffer it
    buffer.pendingCount++;
    buffer.pendingMessages.push(messageData);

    console.log(`📊 Buffered notification (${buffer.pendingCount} pending)`);

    // Set timer to send grouped notification when window expires
    if (!buffer.timer) {
        const remainingTime = RATE_LIMIT_MS - timeSinceLastNotification;
        buffer.timer = setTimeout(async () => {
            await sendGroupedNotification();
        }, remainingTime);
    }
}

/**
 * Send immediate notification for a single message
 */
async function sendImmediateNotification(messageData) {
    const message = formatContactAlert(messageData);
    await sendAdminAlert({ message });

    buffer.lastNotificationTime = Date.now();
    buffer.pendingCount = 0;
    buffer.pendingMessages = [];

    if (buffer.timer) {
        clearTimeout(buffer.timer);
        buffer.timer = null;
    }
}

/**
 * Send grouped notification for multiple buffered messages
 */
async function sendGroupedNotification() {
    if (buffer.pendingCount === 0) {
        buffer.timer = null;
        return;
    }

    if (buffer.pendingCount === 1) {
        // If only one message, send individual notification
        const messageData = buffer.pendingMessages[0];
        const message = formatContactAlert(messageData);
        await sendAdminAlert({ message });
    } else {
        // Send grouped notification
        const message = formatGroupedAlert(buffer.pendingCount);
        await sendAdminAlert({ message });
    }

    buffer.lastNotificationTime = Date.now();
    buffer.pendingCount = 0;
    buffer.pendingMessages = [];
    buffer.timer = null;
}

/**
 * Get current buffer status (for debugging)
 */
export function getBufferStatus() {
    return {
        pendingCount: buffer.pendingCount,
        lastNotificationTime: buffer.lastNotificationTime,
        hasTimer: !!buffer.timer
    };
}
