// app.js (or index.js)
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const storeCryptoData = require('./storeCryptoData');
const cron = require('node-cron');
//const schedule = require('node-schedule');
// Import the CryptoData model to interact with the database
const CryptoData = require('./models/CryptoData');  // Ensure this path is correct

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

// Use EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Connect to MongoDB using the connection string from the .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Serve the homepage with the latest crypto data from the database
// Serve the homepage with the latest crypto data for all coins
app.get('/', async (req, res) => {
    try {
      // Fetch the latest 5 records for each coin
      const coins = ['bitcoin', 'matic-network', 'ethereum'];
      const cryptoData = {};
  
      for (const coin of coins) {
        const records = await CryptoData.find({ coinId: coin })
          .sort({ timestamp: -1 })
          .limit(5);
        cryptoData[coin] = records;
      }
  
      // Render the EJS template
      res.render('index', { cryptoData });
    } catch (error) {
      console.error('Error fetching data for homepage:', error);
      res.status(500).send('Error fetching data');
    }
  });
  
// API to get the latest stats for a specific cryptocurrency
app.get('/stats', async (req, res) => {
    const { coin } = req.query;
  
    if (!coin) {
      return res.status(400).send('Coin query parameter is required');
    }
    const validCoins = ['bitcoin', 'ethereum', 'matic-network'];
    if (!validCoins.includes(coin)) {
      return res.status(400).json({ error: 'Invalid coin ID provided' });
    }
    try {
      const latestData = await CryptoData.findOne({ coinId: coin })
        .sort({ timestamp: -1 });
  
      if (!latestData) {
        return res.status(404).send('No data found for the requested cryptocurrency');
      }
  
      // Render the EJS page with the latest data
      res.render('stats', {
        coin: coin.charAt(0).toUpperCase() + coin.slice(1), // Capitalize the coin name
        price: latestData.price.toFixed(2),
        marketCap: latestData.marketCap.toFixed(2),
        change24h: latestData.change24h.toFixed(2),
        timestamp: new Date(latestData.timestamp).toLocaleString(),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).send('An error occurred while fetching stats');
    }
  });
  
  // API to calculate the standard deviation of the price for the last 100 records
  app.get('/deviation', async (req, res) => {
    const { coin } = req.query;
  
    if (!coin) {
      return res.status(400).send('Coin query parameter is required');
    }
    const validCoins = ['bitcoin', 'ethereum', 'matic-network'];
    if (!validCoins.includes(coin)) {
      return res.status(400).json({ error: 'Invalid coin ID provided' });
    }
    try {
      // Fetch the last 100 records for the specified coin
      const records = await CryptoData.find({ coinId: coin })
        .sort({ timestamp: -1 }) // Sort by timestamp descending
        .limit(100);
  
      if (records.length === 0) {
        return res.status(404).send('No data found for the requested cryptocurrency');
      }
  
      // Extract prices from the records
      const prices = records.map(record => record.price);
  
      // Calculate the mean (average) price
      const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
      // Calculate the variance
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  
      // Calculate the standard deviation
      const standardDeviation = Math.sqrt(variance);
  
      // Render the EJS page with the calculated deviation
      res.render('deviation', {
        coin: coin.charAt(0).toUpperCase() + coin.slice(1), // Capitalize the coin name
        deviation: parseFloat(standardDeviation.toFixed(2)), // Round deviation to 2 decimal places
        records: prices.length,
      });
    } catch (error) {
      console.error('Error calculating deviation:', error);
      res.status(500).send('An error occurred while calculating deviation');
    }
  });
  
  
  // schedule.scheduleJob('0 */2 * * *', async () => {
  //   console.log(`Scheduled job executed at: ${new Date()}`);
  //   try {
  //     await storeCryptoData();
  //   } catch (error) {
  //     console.error('Error in scheduled job:', error);
  //   }
  // });
// cron.schedule('*/10 * * * * *', async () => {
//     await storeCryptoData();
//   });
 //*/10 * * * * * 
//0 */2 * * *
// Start the server using the port from the .env file
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
