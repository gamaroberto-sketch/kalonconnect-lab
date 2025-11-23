// Teste simples para verificar se o terminal está funcionando
console.log('✅ Script de teste executado com sucesso!');
console.log('Data/Hora:', new Date().toISOString());
console.log('Diretório:', process.cwd());
console.log('Node.js:', process.version);
console.log('Plataforma:', process.platform);

// Testar ngrok
const { execSync } = require('child_process');
try {
  if (process.platform === 'win32') {
    try {
      execSync('ngrok.cmd --version', { stdio: 'pipe' });
      console.log('✅ ngrok.cmd encontrado');
    } catch (e) {
      try {
        execSync('ngrok --version', { stdio: 'pipe' });
        console.log('✅ ngrok encontrado');
      } catch (e2) {
        console.log('❌ ngrok não encontrado');
      }
    }
  } else {
    execSync('ngrok --version', { stdio: 'pipe' });
    console.log('✅ ngrok encontrado');
  }
} catch (error) {
  console.log('❌ ngrok não encontrado');
}

console.log('\n✅ Teste concluído!');



