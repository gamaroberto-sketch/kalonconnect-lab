import { createClient } from '@supabase/supabase-js';
import { Document, Packer, Paragraph, TextRun } from 'docx';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Replace markers in text
function replaceMarkers(text, values) {
    let result = text;
    Object.keys(values).forEach(key => {
        const marker = `{{${key}}}`;
        const value = values[key] || `[${key}]`;
        result = result.replace(new RegExp(marker, 'g'), value);
    });
    return result;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { templateId, values } = req.body;
    const userId = req.headers['x-user-id'];

    if (!templateId || !userId || !values) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Get template from database
        const { data: template, error: templateError } = await supabaseAdmin
            .from('document_templates_advanced')
            .select('*')
            .eq('id', templateId)
            .eq('user_id', userId)
            .single();

        if (templateError || !template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Generate document with replaced markers
        const sections = [];

        // Add clauses with replaced markers
        template.clauses?.forEach(clause => {
            // Title
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: replaceMarkers(clause.title, values),
                            bold: true,
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 100 },
                })
            );

            // Content
            const contentLines = replaceMarkers(clause.content, values).split('\n');
            contentLines.forEach(line => {
                sections.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                size: 24,
                            }),
                        ],
                        spacing: { after: 100 },
                    })
                );
            });
        });

        // Create document
        const doc = new Document({
            sections: [{
                properties: {},
                children: sections,
            }],
        });

        // Generate buffer
        const buffer = await Packer.toBuffer(doc);

        // Upload to Supabase
        const fileName = `${userId}/generated/${Date.now()}_${template.name.replace(/\s/g, '_')}.docx`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('prescription-templates')
            .upload(fileName, buffer, {
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload document' });
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('prescription-templates')
            .getPublicUrl(fileName);

        return res.status(200).json({
            documentUrl: publicUrl,
            fileName: fileName,
            message: 'Documento gerado com sucesso!'
        });

    } catch (error) {
        console.error('Error generating document:', error);
        return res.status(500).json({ error: error.message });
    }
}
