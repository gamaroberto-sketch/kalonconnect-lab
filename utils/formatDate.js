/**
 * Format a date string based on user preference
 * @param {string} dateString - Date in format DD/MM/YYYY or YYYY-MM-DD
 * @param {string} format - Optional format override (ddmmyyyy, mmddyyyy, yyyymmdd)
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, format = null) {
    if (!dateString) return '';

    // Get format from localStorage if not provided
    const userFormat = format || getUserDateFormat();

    // Parse the input date (handle both DD/MM/YYYY and YYYY-MM-DD)
    let day, month, year;

    if (dateString.includes('/')) {
        // DD/MM/YYYY format
        const parts = dateString.split('/');
        if (parts.length === 3) {
            day = parts[0];
            month = parts[1];
            year = parts[2];
        }
    } else if (dateString.includes('-')) {
        // YYYY-MM-DD format
        const parts = dateString.split('-');
        if (parts.length === 3) {
            year = parts[0];
            month = parts[1];
            day = parts[2];
        }
    }

    if (!day || !month || !year) {
        return dateString; // Return original if parsing fails
    }

    // Format according to preference
    switch (userFormat) {
        case 'mmddyyyy':
            return `${month}/${day}/${year}`;
        case 'yyyymmdd':
            return `${year}-${month}-${day}`;
        case 'ddmmyyyy':
        default:
            return `${day}/${month}/${year}`;
    }
}

/**
 * Get user's date format preference from localStorage
 * @returns {string} Date format preference (ddmmyyyy, mmddyyyy, or yyyymmdd)
 */
export function getUserDateFormat() {
    try {
        const settings = localStorage.getItem('kalonAdvancedSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            return parsed.dateFormat || 'ddmmyyyy';
        }
    } catch (error) {
        console.error('Error reading date format preference:', error);
    }
    return 'ddmmyyyy'; // Default to DD/MM/YYYY
}

/**
 * Format a Date object based on user preference
 * @param {Date} date - JavaScript Date object
 * @param {string} format - Optional format override
 * @returns {string} Formatted date string
 */
export function formatDateObject(date, format = null) {
    if (!(date instanceof Date) || isNaN(date)) {
        return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const userFormat = format || getUserDateFormat();

    switch (userFormat) {
        case 'mmddyyyy':
            return `${month}/${day}/${year}`;
        case 'yyyymmdd':
            return `${year}-${month}-${day}`;
        case 'ddmmyyyy':
        default:
            return `${day}/${month}/${year}`;
    }
}
