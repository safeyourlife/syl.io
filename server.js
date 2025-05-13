const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let users = {}; // Armazena as localizações dos usuários

wss.on('connection', (ws) => {
    console.log("Novo usuário conectado!");

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'updateLocation') {
            users[data.userId] = { lat: data.lat, lon: data.lon, name: data.name };

            // Enviar atualização para todos os clientes
            broadcast(JSON.stringify({ type: 'usersUpdate', users }));
        }
    });

    ws.on('close', () => {
        console.log("Usuário desconectado!");
    });
});

// Função para enviar dados para todos os clientes
function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

console.log("Servidor WebSocket rodando na porta 8080");
