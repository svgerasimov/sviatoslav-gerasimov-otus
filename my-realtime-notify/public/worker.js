importScripts('/socket.io/socket.io.js');

console.log('[worker] стартуем');
const socket = io(); // соединяемся

socket.on('connect', () =>
  console.log('[worker] Socket.IO подключился', socket.id)
);

socket.on('notification', (data) => {
  console.log('[worker] got', data);
  self.postMessage(data); // пересылаем в основной поток
});