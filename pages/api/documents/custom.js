import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    const { method } = req;
    const userId = req.query.userId || req.headers['x-user-id'];

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        switch (method) {
            case 'GET':
                return await handleGet(req, res, userId);
            case 'POST':
                return await handlePost(req, res, userId);
            case 'PUT':
                return await handlePut(req, res, userId);
            case 'DELETE':
                return await handleDelete(req, res, userId);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ error: `Method ${method} Not Allowed` });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// GET - List all custom documents for user
async function handleGet(req, res, userId) {
    const { data, error } = await supabaseAdmin
        .from('custom_documents')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching custom documents:', error);
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ documents: data || [] });
}

// POST - Create new custom document
async function handlePost(req, res, userId) {
    const { name, icon, template_url, template_size, fields, field_positions } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Document name is required' });
    }

    // Get current max order_index
    const { data: existingDocs } = await supabaseAdmin
        .from('custom_documents')
        .select('order_index')
        .eq('user_id', userId)
        .order('order_index', { ascending: false })
        .limit(1);

    const nextOrderIndex = existingDocs && existingDocs.length > 0
        ? existingDocs[0].order_index + 1
        : 0;

    const { data, error } = await supabaseAdmin
        .from('custom_documents')
        .insert({
            user_id: userId,
            name,
            icon: icon || '📄',
            template_url: template_url || null,
            template_size: template_size || 'A4',
            fields: fields || [],
            field_positions: field_positions || {},
            order_index: nextOrderIndex
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating custom document:', error);
        return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ document: data });
}

// PUT - Update custom document
async function handlePut(req, res, userId) {
    const { id, name, icon, template_url, template_size, fields, field_positions, order_index } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Document ID is required' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (template_url !== undefined) updateData.template_url = template_url;
    if (template_size !== undefined) updateData.template_size = template_size;
    if (fields !== undefined) updateData.fields = fields;
    if (field_positions !== undefined) updateData.field_positions = field_positions;
    if (order_index !== undefined) updateData.order_index = order_index;

    const { data, error } = await supabaseAdmin
        .from('custom_documents')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating custom document:', error);
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ document: data });
}

// DELETE - Delete custom document (soft delete)
async function handleDelete(req, res, userId) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Document ID is required' });
    }

    const { data, error } = await supabaseAdmin
        .from('custom_documents')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error deleting custom document:', error);
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, document: data });
}
