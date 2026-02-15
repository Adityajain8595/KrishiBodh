
const path = require('path');

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  root: path.resolve(__dirname, '..'),
  apiPrefix: '/api',
};
