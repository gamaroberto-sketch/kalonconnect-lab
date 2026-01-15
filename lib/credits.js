import { supabaseAdmin } from './supabase-admin';

export const AI_COSTS = {
    TRANSCRIPTION: 5, // Custo maior para Whisper
    SUMMARY: 1        // Custo menor para GPT
};

/**
 * Checks if a user has enough credits for an operation.
 * @param {string} userId - The user's ID (UUID).
 * @param {number} cost - The cost of the operation.
 * @returns {Promise<boolean>} - True if user has enough credits, false otherwise.
 */
export async function hasSufficientCredits(userId, cost) {
    if (!userId) return false;

    const { data, error } = await supabaseAdmin
        .from('users')
        .select('ai_credits')
        .eq('id', userId)
        .single();

    if (error || !data) {
        console.error('Error checking credits:', error);
        return false;
    }

    return (data.ai_credits || 0) >= cost;
}

/**
 * Deducts credits from a user's account.
 * @param {string} userId - The user's ID.
 * @param {number} cost - Credits to deduct.
 * @returns {Promise<boolean>} - True if efficient, false if failed.
 */
export async function deductCredits(userId, cost) {
    if (!userId) return false;

    // Uses RPC or direct update. Simple decrement via update for now.
    // Ideally use a database function to prevent race conditions, but simple read-update is OK for this scale.

    // Fetch current again to be safe
    const { data: user, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('ai_credits')
        .eq('id', userId)
        .single();

    if (fetchError || !user) return false;

    const newBalance = (user.ai_credits || 0) - cost;
    if (newBalance < 0) return false; // Should have been checked by hasSufficientCredits

    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ ai_credits: newBalance })
        .eq('id', userId);

    if (updateError) {
        console.error('Error deducting credits:', updateError);
        return false;
    }

    return true;
}
