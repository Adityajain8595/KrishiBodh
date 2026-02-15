require('dotenv').config();
const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`AgriTech API listening on port ${config.port}`);
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

