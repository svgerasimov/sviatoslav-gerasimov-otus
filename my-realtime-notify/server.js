const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server); // навешиваем Socket.IO на HTTP-сервер

const PORT = 3000;

// 1) Отдаём файлы из ./public
app.use(express.static(path.join(__dirname, 'public')));

// 2) Реагируем на новое подключение
io.on('connection', (socket) => {
  console.log('Клиент подключился', socket.id);
});

// 3) Каждые 10 секунд шлём всем клиентам уведомление
setInterval(() => {
  const payload = {
    title: 'ПИНГ!',
    body: new Date().toLocaleTimeString(),
  };
  io.emit('notification', payload);
}, 5_000);

server.listen(PORT, () =>
  console.log(`🚀 Сервер слушает http://localhost:${PORT}`)
);
