/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 12)
 * @param {boolean} includeSymbols - Include special characters (default: true)
 * @returns {string} Generated password
 */
export function generatePassword(length = 12, includeSymbols = true) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = lowercase + uppercase + numbers;
    if (includeSymbols) {
        charset += symbols;
    }

    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    if (includeSymbols) {
        password += symbols[Math.floor(Math.random() * symbols.length)];
    }

    // Fill the rest randomly
    const remainingLength = length - password.length;
    for (let i = 0; i < remainingLength; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}

/**
 * Generate a memorable password (easier to type/remember)
 * Format: Word-Word-Number-Symbol
 * @returns {string} Generated memorable password
 */
export function generateMemorablePassword() {
    const words = [
        'Ocean', 'Mountain', 'River', 'Forest', 'Desert', 'Valley', 'Island', 'Lake',
        'Cloud', 'Storm', 'Thunder', 'Lightning', 'Rainbow', 'Sunset', 'Sunrise',
        'Moon', 'Star', 'Galaxy', 'Comet', 'Planet', 'Solar', 'Lunar', 'Eclipse',
        'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Falcon', 'Wolf', 'Bear', 'Lion'
    ];

    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const number = Math.floor(Math.random() * 100);
    const symbols = ['!', '@', '#', '$', '%', '&', '*'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    return `${word1}-${word2}-${number}${symbol}`;
}
