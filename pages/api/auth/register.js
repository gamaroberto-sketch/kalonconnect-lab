export default function handler(req, res) {
  return res.status(405).json({ error: "Cadastro desativado neste ambiente." });
}
