#!/usr/bin/env node

const net = require('net');

console.log('🚀 Iniciando proxy localhost:5000 -> techmotor-app-1:5000');

const server = net.createServer((clientSocket) => {
  console.log(`🔗 Cliente conectado: ${clientSocket.remoteAddress}:${clientSocket.remotePort}`);
  
  const targetSocket = net.createConnection({
    host: 'techmotor-app-1',
    port: 5000
  }, () => {
    console.log(`✅ Conectado ao target: techmotor-app-1:5000`);
  });
  
  // Pipe bidirecional
  clientSocket.pipe(targetSocket);
  targetSocket.pipe(clientSocket);
  
  // Tratar erros
  clientSocket.on('error', (err) => {
    console.error(`❌ Erro no cliente: ${err.message}`);
    targetSocket.end();
  });
  
  targetSocket.on('error', (err) => {
    console.error(`❌ Erro no target: ${err.message}`);
    clientSocket.end();
  });
  
  // Fechar conexões quando uma delas fechar
  clientSocket.on('close', () => {
    targetSocket.end();
  });
  
  targetSocket.on('close', () => {
    clientSocket.end();
  });
});

server.listen(5000, '127.0.0.1', () => {
  console.log(`✅ Proxy rodando em http://localhost:5000`);
  console.log(`🎯 Redirecionando para: techmotor-app-1:5000`);
});

// Tratar erros do servidor
server.on('error', (err) => {
  console.error(`❌ Erro no servidor proxy: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.log('⚠️  Porta 5000 já em uso. Tentando matar processo...');
  }
});

// Capturar SIGINT para limpeza
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando proxy...');
  server.close();
  process.exit(0);
});