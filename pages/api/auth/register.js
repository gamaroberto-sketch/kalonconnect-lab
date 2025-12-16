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

    // Calculate trial end date (7 days)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Insert user profile data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        type: 'professional',
        version: 'NORMAL', // 7-day trial
        referred_by: referredBy || null,
        trial_ends_at: trialEndsAt.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('User profile creation error:', userError);
      return res.status(500).json({ error: 'Falha ao criar perfil do usuário.' });
    }

    console.log(`✅ Novo usuário registrado: ${name} (${email}) - Trial até ${trialEndsAt.toISOString()}`);

    return res.status(201).json({
      ok: true,
      message: 'Cadastro realizado com sucesso! Aproveite seus 7 dias de acesso Standard grátis.',
      user: userData
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
