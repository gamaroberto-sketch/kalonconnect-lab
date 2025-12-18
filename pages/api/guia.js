import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Tentar diferentes caminhos possíveis
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'GUIA_INSTALACAO_USO.md'),
      path.join(process.cwd(), 'GUIA_INSTALACAO_USO.md'),
      path.join(__dirname, '..', '..', 'public', 'GUIA_INSTALACAO_USO.md'),
    ];

    let filePath = null;

    for (const possiblePath of possiblePaths) {
      try {
        if (fs.existsSync(possiblePath)) {
          filePath = possiblePath;
          break;
        }
      } catch (e) {
        // Continua tentando outros caminhos
      }
    }

    if (!filePath) {
      return res.status(404).json({ error: 'Guia não encontrado' });
    }

    // Lê o arquivo
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Headers para evitar cache
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="GUIA_UTILIZACAO.md"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).send(fileContent);
  } catch (error) {
    console.error('Erro ao processar guia:', error);
    res.status(500).json({ error: 'Erro ao carregar guia', details: error.message });
  }
}
