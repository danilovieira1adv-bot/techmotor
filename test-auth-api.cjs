// Teste rápido da API de recuperação de senha
const http = require('http');

const testData = {
  email: 'retificasaopaulo@teste.com.br'
};

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/forgot-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Resposta:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Resposta (não JSON):', data.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error(`Erro: ${e.message}`);
});

req.write(JSON.stringify(testData));
req.end();