
const cep = '22410001';
const url = `https://brasilapi.com.br/api/cep/v1/${cep}`;

console.log(`Testing BrasilAPI: ${url}`);

async function test() {
    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        if (!response.ok) {
            console.log('Text:', await response.text());
        } else {
            console.log('Success:', await response.json());
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
