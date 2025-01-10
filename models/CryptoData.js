// models/CryptoData.js
const mongoose = require('mongoose');

// Define a schema for storing crypto data
const cryptoSchema = new mongoose.Schema({
  coinId: { type: String, required: true },  // The cryptocurrency ID (e.g., bitcoin, ethereum)
  price: { type: Number, required: true },   // Price in USD
  marketCap: { type: Number, required: true }, // Market cap in USD
  change24h: { type: Number, required: true }, // 24h price change percentage
  timestamp: { type: Date, default: Date.now } // Timestamp when the data was fetched
});

const CryptoData = mongoose.model('CryptoData', cryptoSchema);

module.exports = CryptoData;
