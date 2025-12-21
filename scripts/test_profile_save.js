
const userId = 'd7985547-4a62-4f92-b1e9-d40867849887';
const url = `http://localhost:3000/api/user/profile?userId=${userId}`;

const payload = {
    name: "Roberto Gama", // Keep minimal required fields just in case
    address: {
        street: "Rua Visconde de Pirajá",
        number: "127",
        complement: "apto 201",
        neighborhood: "Ipanema",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "22410001"
    },
    services: [], // Array required usually
    social: {}
};

console.log(`Testing POST to ${url}`);

async function test() {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-user-id": userId
            },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log('Response Body:', text);

        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', json);
        } catch (e) { }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

test();
