import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { name, email, password, referredBy } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Try to sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    // If user already exists, try to get existing user data
    if (authError && authError.message.includes('already registered')) {
      // Check if user profile exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(409).json({
          error: 'Email já cadastrado. Use a opção "Entrar" para fazer login.'
        });
      }

      // User exists in Auth but not in users table - this is the orphan case
      // We can't fix this from client side, need admin access
      return res.status(409).json({
        error: 'Este email já foi usado. Por favor, use outro email ou entre em contato com o suporte.'
      });
    }

    if (authError) {
      console.error('Auth signup error:', authError);
      return res.status(400).json({ error: authError.message || 'Erro ao criar conta.' });
    }

    if (!authData.user) {
      return res.status(500).json({ error: 'Falha ao criar usuário' });
    }

    // Create user profile with upsert
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email,
        name,
        type: 'professional',
        version: 'NORMAL'
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (userError) {
      console.error('User profile creation error:', userError);
      console.error('Error details:', JSON.stringify(userError, null, 2));

      return res.status(500).json({
        error: 'Falha ao criar perfil. Detalhes: ' + (userError.message || 'Erro desconhecido'),
        details: userError
      });
    }

    console.log(`✅ Novo usuário registrado: ${name} (${email})`);

    return res.status(201).json({
      ok: true,
      message: 'Cadastro realizado com sucesso!',
      user: userData
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
