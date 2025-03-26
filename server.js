const app = require('./app');

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.log(`Error: ${err.stack}`);
  console.log('Shutting down due to uncaught exception');
  process.exit(1);
});

module.exports = app;