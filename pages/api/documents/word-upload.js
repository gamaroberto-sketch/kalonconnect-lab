import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import mammoth from 'mammoth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const config = {
    api: {
        bodyParser: false,
    },
};

// Detect {{markers}} in text
function detectMarkers(text) {
    const markerRegex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    const markers = new Set();
    let match;

    while ((match = markerRegex.exec(text)) !== null) {
        markers.add(match[1]);
    }

    return Array.from(markers);
}

// Convert HTML to clauses
function htmlToClauses(html) {
    const clauses = [];

    // Simple parsing - split by headings or paragraphs
    const sections = html.split(/<h[1-6][^>]*>|<\/h[1-6]>|<p[^>]*>|<\/p>/);

    let clauseCounter = 1;
    let currentTitle = '';

    sections.forEach((section, index) => {
        const trimmed = section.trim();
        if (!trimmed) return;

        // Check if it looks like a title (CLÁUSULA, ARTIGO, etc.)
        if (/^(CLÁUSULA|ARTIGO|ITEM|CAPÍTULO)/i.test(trimmed)) {
            currentTitle = trimmed;
        } else if (trimmed.length > 10) {
            // It's content
            clauses.push({
                id: `clause_${clauseCounter}`,
                order: clauseCounter,
                title: currentTitle || `Cláusula ${clauseCounter}`,
                content: trimmed,
                editable: true,
                required: false
            });
            clauseCounter++;
            currentTitle = '';
        }
    });

    return clauses;
}

// Create fields from markers
function createFieldsFromMarkers(markers) {
    return markers.map(marker => {
        // Try to infer type from marker name
        let type = 'text';
        let label = marker.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        if (marker.includes('valor') || marker.includes('preco') || marker.includes('aluguel')) {
            type = 'currency';
        } else if (marker.includes('data') || marker.includes('vencimento')) {
            type = 'date';
        } else if (marker.includes('cpf') || marker.includes('cnpj')) {
            type = 'text';
            label = marker.toUpperCase();
        }

        return {
            id: marker,
            label,
            type,
            required: true,
            placeholder: `Digite ${label.toLowerCase()}`
        };
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const form = formidable({
        maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    try {
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve([fields, files]);
            });
        });

        console.log('Parsed files:', files);
        console.log('Parsed fields:', fields);

        const file = files.file?.[0] || files.file;
        const userId = fields.userId?.[0] || fields.userId;
        const customDocumentId = fields.customDocumentId?.[0] || fields.customDocumentId;
        const name = fields.name?.[0] || fields.name;

        console.log('File object:', file);
        console.log('User ID:', userId);

        if (!file) {
            console.error('No file received');
            return res.status(400).json({ error: 'No file received' });
        }

        if (!userId) {
            console.error('No userId received');
            return res.status(400).json({ error: 'Missing userId' });
        }

        // Validate file type
        const filename = file.originalFilename || file.name;
        if (!filename?.endsWith('.docx')) {
            console.error('Invalid file type:', filename);
            return res.status(400).json({ error: 'Only .docx files are supported' });
        }

        console.log('Processing file:', filename);

        // Convert Word to HTML using mammoth
        const filePath = file.filepath || file.path;
        console.log('File path:', filePath);

        const result = await mammoth.convertToHtml({ path: filePath });
        const html = result.value;

        // Extract all text for marker detection
        const textContent = html.replace(/<[^>]*>/g, ' ');

        // Detect markers
        const markers = detectMarkers(textContent);

        // Convert HTML to clauses
        const clauses = htmlToClauses(html);

        // Create fields from markers
        const detectedFields = createFieldsFromMarkers(markers);

        // Sanitize filename (remove spaces, accents, special chars)
        const sanitizedFilename = filename
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
            .replace(/_+/g, '_'); // Replace multiple underscores with single

        // Upload original file to Supabase
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = `${userId}/${Date.now()}_${sanitizedFilename}`;

        console.log('Original filename:', filename);
        console.log('Sanitized filename:', sanitizedFilename);
        console.log('Uploading to Supabase:', fileName);

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('prescription-templates')
            .upload(fileName, fileBuffer, {
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return res.status(500).json({ error: `Failed to upload file: ${uploadError.message}` });
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('prescription-templates')
            .getPublicUrl(fileName);

        console.log('File uploaded successfully:', publicUrl);

        // Save to database
        const { data: template, error: dbError } = await supabaseAdmin
            .from('document_templates_advanced')
            .insert({
                user_id: userId,
                custom_document_id: customDocumentId || null,
                name: name || filename.replace('.docx', ''),
                original_file_url: publicUrl,
                original_file_name: filename,
                clauses: clauses,
                fields: detectedFields
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ error: `Failed to save template: ${dbError.message}` });
        }

        console.log('Template saved to database:', template.id);

        // Clean up temp file
        try {
            fs.unlinkSync(filePath);
        } catch (cleanupError) {
            console.warn('Failed to cleanup temp file:', cleanupError);
        }

        return res.status(200).json({
            templateId: template.id,
            clauses: template.clauses,
            fields: template.fields,
            originalUrl: publicUrl,
            message: `Detectados ${markers.length} campos e ${clauses.length} cláusulas`
        });

    } catch (error) {
        console.error('Error processing Word file:', error);
        return res.status(500).json({ error: error.message });
    }
}
