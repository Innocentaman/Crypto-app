// storeCryptoData.js
const axios = require('axios');
const CryptoData = require('./models/CryptoData');

// URL for CoinGecko API to fetch cryptocurrency data
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=';

// Function to fetch cryptocurrency data from CoinGecko
const fetchCryptoData = async () => {
  const coins = ['bitcoin', 'matic-network', 'ethereum'];
  try {
    const response = await axios.get(`${COINGECKO_API}${coins.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`,{
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
  });
    return response.data;
  } catch (error) {
    console.error("Error fetching data from CoinGecko:", error);
  }
};

// Function to store cryptocurrency data in the database
const storeCryptoData = async () => {
  const data = await fetchCryptoData();

  if (data) {
    const cryptoDataEntries = Object.keys(data).map(coinId => {
      return {
        coinId: coinId,
        price: data[coinId].usd,
        marketCap: data[coinId].usd_market_cap,
        change24h: data[coinId].usd_24h_change
      };
    });

    // Save the fetched data to MongoDB
    await CryptoData.insertMany(cryptoDataEntries);
    console.log('Crypto data saved successfully!');
  }
};

// Export the function to be called by the main app.js file
module.exports = storeCryptoData;
