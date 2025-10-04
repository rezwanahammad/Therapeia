const mongoose = require('mongoose');

const states = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

exports.getHealth = (req, res) => {
  const readyState = mongoose.connection.readyState;
  const dbInfo = {
    state: states[readyState] || 'unknown',
    name: mongoose.connection.name || null,
    host: (mongoose.connection.host || mongoose.connection.client?.s?.options?.hosts?.[0]?.host) || null,
  };

  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: dbInfo });
};