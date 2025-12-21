export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { cep } = req.query;

    if (!cep) {
        return res.status(400).json({ message: 'CEP is required' });
    }

    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
        return res.status(400).json({ message: 'Invalid CEP format' });
    }

    // Fallback chain: BrasilAPI -> ViaCEP
    // But since ViaCEP is 502, we prioritize BrasilAPI

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);

        if (response.ok) {
            const data = await response.json();
            // Map BrasilAPI format to ViaCEP format for frontend compatibility
            const mappedData = {
                logradouro: data.street,
                bairro: data.neighborhood,
                localidade: data.city,
                uf: data.state,
                cep: data.cep,
                erro: false
            };
            return res.status(200).json(mappedData);
        }
    } catch (error) {
        console.error('BrasilAPI Error:', error);
    }

    // Fallback to ViaCEP if BrasilAPI fails (just in case)
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
            headers: { 'User-Agent': 'KalonConnect/1.0' }
        });
        if (response.ok) {
            const data = await response.json();
            if (!data.erro) {
                return res.status(200).json(data);
            }
        }
    } catch (error) {
        console.error('ViaCEP Fallback Error:', error);
    }

    return res.status(500).json({ message: 'Failed to fetch address data from all providers' });
}
