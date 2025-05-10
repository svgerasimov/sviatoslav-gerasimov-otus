const app = require('./src/app'); // готовое Express-приложение
const debug = require('debug')('express:server'); // «тихие» логи через DEBUG
const http = require('http'); // нативный HTTP-модуль Node

function normalizePort(val) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return val; // например, named pipe
  if (n >= 0) return n;
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? 'Pipe ' : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' требует прав администратора');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' уже занят');
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind =
    typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind); // выведется, если DEBUG=express:server
}

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
server.on('error', onError); // красивый вывод «EADDRINUSE» и т.п.
server.on('listening', onListening);
console.log(`Server started on ${port} port`);
