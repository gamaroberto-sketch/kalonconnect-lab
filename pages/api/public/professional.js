
import { supabaseAdmin } from '../../../lib/supabase-admin';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { slug } = req.query;

    if (!slug) {
        return res.status(400).json({ error: 'Slug is required' });
    }

    try {
        // 1. Tentar encontrar pelo slug (nome-sobrenome)
        // Precisamos de uma tabela ou coluna que armazene o slug, 
        // ou buscar nos metadados se não houver coluna direta.
        // Por enquanto, assumindo que o 'id' passado pode ser o ID direto OU precisaremos buscar.

        // NOTA: O sistema atual gera links usando o ID ou Slug. 
        // Vamos buscar primeiro assumindo que é um ID, se falhar, tentamos buscar por match de nome/slug se existisse essa coluna.
        // Como o VideoControls usa: professionalIdFromProps || user?.id || user?.email
        // E o slugifyName gera algo como "roberto-gama".
        // O Supabase Auth ID é uuid. 

        // Se o 'slug' for um UUID, buscamos direto.
        // Se não, precisamos de uma estratégia. 
        // Atualização: O app parece não ter uma tabela pública de 'slugs' ainda mapeada para IDs.
        // VAMOS BUSCAR NA TABELA 'users' onde 'id' = slug (se for uuid) OU tentar implementar uma busca flexivel no futuro.
        // Por ora, vamos assumir que o sistema pode estar passando o ID, ou vamos ter que criar um mapeamento.

        // CORREÇÃO: O `VideoControls.jsx` usa `slugifyName`. Isso NÃO é um UUID.
        // Não temos como reverter slug -> UUID facilmente sem uma busca no banco.
        // A tabela `users` tem campos `id` (uuid) e `email`. E `raw_user_meta_data` com `name`.
        // Isso é um problema arquitetural: busca por slug em JSONb é lenta/complexa.

        // SOLUÇÃO ROBUSTA: Vamos buscar todos os profissionais (filtrado se possivel) e comparar o slug no javascript (menos eficiente, mas funcional para MVP)
        // OU, idealmente, o link deveria conter o ID ou o sistema deveria salvar o slug no banco.

        // WORKAROUND IMEDIATO: 
        // Vamos tentar buscar pelo ID direto primeiro.
        let { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, name, photo, specialty, social')
            .eq('id', slug)
            .single();

        if (error || !user) {
            // Se falhou por ID, busca flexível
            const { data: allUsers, error: listError } = await supabaseAdmin
                .from('users')
                .select('*');

            if (!listError && allUsers) {
                const slugify = (text) => text?.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-') || '';

                // 🟢 v5.33 Enhanced Lookup: Name OR Email OR Metadata Slug
                user = allUsers.find(u => {
                    const targetSlug = slug.toLowerCase();
                    const nameSlug = slugify(u.name);
                    const emailSlug = u.email?.split('@')[0]?.toLowerCase().replace(/\./g, '-');
                    const metaSlug = u.raw_user_meta_data?.slug?.toLowerCase();

                    let socialObj = u.social;
                    if (typeof socialObj === 'string') {
                        try { socialObj = JSON.parse(socialObj); } catch (e) { }
                    }
                    const socialSlug = socialObj?.slug?.toLowerCase();

                    return nameSlug === targetSlug || emailSlug === targetSlug || metaSlug === targetSlug || socialSlug === targetSlug;
                });
            }
        }

        if (!user) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        // Retorna apenas dados públicos seguros, com fallbacks para foto
        const photoUrl = user.photo || user.raw_user_meta_data?.avatar_url || user.raw_user_meta_data?.picture || user.raw_user_meta_data?.photo || null;

        // Parse themeColors from social if exists
        let themeColors = {};
        if (user.social && typeof user.social !== 'string') {
            themeColors = user.social.themeColors || {};
        } else if (typeof user.social === 'string') {
            try {
                const parsed = JSON.parse(user.social);
                themeColors = parsed.themeColors || {};
            } catch (e) { }
        }

        return res.status(200).json({
            id: user.id, // 🟢 Required for fetching products
            name: user.name,
            photo: photoUrl,
            specialty: user.specialty,
            waitingRoom: user.social?.waitingRoom || {},
            themeColors: themeColors
        });

    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
