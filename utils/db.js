const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(process.cwd(), 'utils', 'users.json');

// Função para ler usuários do arquivo JSON
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      // Se o arquivo não existe, criar com array vazio
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler usuários:', error);
    return [];
  }
}

// Função para salvar usuários no arquivo JSON
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar usuários:', error);
    return false;
  }
}

// Função para encontrar usuário por email
function findUserByEmail(email) {
  const users = readUsers();
  return users.find(user => user.email === email);
}

// Função para criar novo usuário
function createUser(userData) {
  const users = readUsers();
  
  // Verificar se email já existe
  if (findUserByEmail(userData.email)) {
    return { success: false, error: 'Email já cadastrado' };
  }

  // Criar novo usuário
  const newUser = {
    id: Date.now().toString(),
    email: userData.email,
    password: userData.password, // Em produção, usar hash (bcrypt)
    name: userData.name || '',
    type: userData.type || 'professional',
    createdAt: new Date().toISOString(),
    ...userData
  };

  // Remover senha do objeto antes de salvar (opcional, mas recomendado)
  // Por enquanto, vamos manter a senha para validação
  users.push(newUser);
  
  if (saveUsers(users)) {
    return { success: true, user: { ...newUser, password: undefined } };
  }
  
  return { success: false, error: 'Erro ao salvar usuário' };
}

// Função para validar login
function validateLogin(email, password) {
  const user = findUserByEmail(email);
  
  if (!user) {
    return { success: false, error: 'Email não encontrado' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Senha incorreta' };
  }

  // Retornar usuário sem senha
  const { password: _, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

module.exports = {
  readUsers,
  saveUsers,
  findUserByEmail,
  createUser,
  validateLogin
};




