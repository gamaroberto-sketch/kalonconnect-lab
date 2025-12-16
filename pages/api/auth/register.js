import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { name, email, password, referredBy } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      if (authError.message.includes('already registered')) {
        return res.status(409).json({ error: 'Email já cadastrado.' });
      }
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(500).json({ error: 'Falha ao criar usuário' });
    }

    // Upsert user profile data (update if exists, insert if not)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email,
        name,
        type: 'professional',
        version: 'NORMAL'
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (userError) {
      console.error('User profile creation error:', userError);
      return res.status(500).json({ error: 'Falha ao criar perfil do usuário.' });
    }

    console.log(`✅ Novo usuário registrado: ${name} (${email})`);

    return res.status(201).json({
      ok: true,
      message: 'Cadastro realizado com sucesso!',
      user: userData
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
