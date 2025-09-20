const app = require('./src/app');
const { NODE_ENV, PORT, CLIENT_URL } = require('./src/config/env');
const { Server } = require('socket.io');
const setupSocket = require('./src/socket/index')


let server;

if (NODE_ENV === 'production') {
    const https = require('https');
    const fs = require('fs');
    const path = require('path');

    const privateKey = fs.readFileSync(path.join(__dirname, 'certs', 'privkey.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, 'certs', 'fullchain.pem'), 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    server = https.createServer(credentials, app);
} else {
    const http = require('http');
    server = http.createServer(app);
}


const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true, 
    }
});

// Attach io to app 
app.set("io", io);

setupSocket(io);


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => process.exit(1));
});
