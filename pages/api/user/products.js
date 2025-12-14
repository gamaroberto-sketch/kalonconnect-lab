import { supabaseAdmin } from '../../../lib/supabase-admin';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Allow for image uploads
        },
    },
};

export default async function handler(req, res) {
    const { userId } = req.query; // Expect userId in query for safety/consistency with other APIs
    const headerUserId = req.headers['x-user-id']; // For extra validation if needed

    // Validate User ID
    const targetUserId = userId || headerUserId;

    if (!targetUserId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('social')
                .eq('id', targetUserId)
                .single();

            if (error) throw error;

            // Return products array or empty array if not exists
            const products = data?.social?.products || [];
            return res.status(200).json({ products });
        } catch (error) {
            console.error('Error fetching products:', error);
            // Don't expose internal errors to client, but log them
            return res.status(500).json({ error: 'Error fetching products' });
        }
    }

    else if (req.method === 'POST') {
        try {
            const { products } = req.body;

            if (!Array.isArray(products)) {
                return res.status(400).json({ error: 'Products must be an array' });
            }

            // 1. Fetch CURRENT social data first (Critical for Data Preservation)
            const { data: currentData, error: fetchError } = await supabaseAdmin
                .from('users')
                .select('social')
                .eq('id', targetUserId)
                .single();

            if (fetchError) {
                console.error('Error fetching current social data:', fetchError);
                throw fetchError;
            }

            const currentSocial = currentData?.social || {};

            // 2. Merge existing social data with new products list
            // This ensures we don't wipe out 'waitingRoom', 'slug', 'instagram', etc.
            const updatedSocial = {
                ...currentSocial,
                products: products
            };

            // 3. Save updated social object
            const { data: savedData, error: saveError } = await supabaseAdmin
                .from('users')
                .update({ social: updatedSocial })
                .eq('id', targetUserId);

            if (saveError) throw saveError;

            return res.status(200).json({ success: true, products });
        } catch (error) {
            console.error('Error saving products:', error);
            return res.status(500).json({ error: 'Error saving products: ' + (error.message || 'Unknown') });
        }
    }

    else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
