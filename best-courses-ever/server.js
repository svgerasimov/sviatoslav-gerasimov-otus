const app = require('./src/app');
const debug = require('debug')('express:server');
const http = require('http');

function normalizePort(val) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return val;
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
  debug('Listening on ' + bind);
}

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
console.log(`Server started on ${port} port`);
