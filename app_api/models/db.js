const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

mongoose.set("strictQuery", false);

const dbUser = process.env.MONGODB_USERNAME;
const dbPassword = process.env.MONGODB_PASSWORD;

if (!dbUser || !dbPassword) {
  console.error('Missing one or more MongoDB environment variables');
  process.exit(1);
}

const dbURI = `mongodb+srv://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@cluster0.gsqkiz7.mongodb.net/Loc8r`;

const connect = () => {
  mongoose.connect(dbURI)
    .catch(err => {
      console.error('Initial MongoDB connection error:', err.message);
      setTimeout(connect, 3000);
    });
};

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on('error', err => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected');
});

if (process.platform === 'win32') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on('SIGINT', () => {
    process.emit("SIGINT");
  });
}

const gracefulShutdown = (msg) => {
  mongoose.connection.close(() => {
    console.log(`Mongoose disconnected through ${msg}`);
  });
};

process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart');
  process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', () => {
  gracefulShutdown('app termination');
  process.exit(0);
});

process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown');
  process.exit(0);
});

connect();
require('./locations');
