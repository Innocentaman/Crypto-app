// // storeCryptoData.js
// const axios = require('axios');
// const CryptoData = require('./models/CryptoData');

// // URL for CoinGecko API to fetch cryptocurrency data
// const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=';

// // Function to fetch cryptocurrency data from CoinGecko
// const fetchCryptoData = async () => {
//   const coins = ['bitcoin', 'matic-network', 'ethereum'];
//   try {
//     const response = await axios.get(`${COINGECKO_API}${coins.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`,{
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//         }
//   });
//   console.log('Fetched Data:')
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching data from CoinGecko:", error);
//   }
// };

// // Function to store cryptocurrency data in the database
// const storeCryptoData = async () => {
//   const data = await fetchCryptoData();

//   if (data) {
//     const cryptoDataEntries = Object.keys(data).map(coinId => {
//       return {
//         coinId: coinId,
//         price: data[coinId].usd,
//         marketCap: data[coinId].usd_market_cap,
//         change24h: data[coinId].usd_24h_change
//       };
//     });

//     // Save the fetched data to MongoDB
//     await CryptoData.insertMany(cryptoDataEntries);
//     console.log('Crypto data saved successfully!');
//   }
// };

// // Export the function to be called by the main app.js file
// module.exports = storeCryptoData;
// const axios = require('axios');
// const CryptoData = require('./models/CryptoData');

// const COINGECKO_API = process.env.COINGECKO_API || 'https://api.coingecko.com/api/v3/simple/price?ids=';

// const fetchCryptoData = async () => {
//   const coins = ['bitcoin', 'matic-network', 'ethereum'];
//   try {
//     const response = await axios.get(
//       `${COINGECKO_API}${coins.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`,
//       {
//         headers: {
//           'User-Agent': 'MyCryptoApp/1.0 (myemail@example.com)',
//           Accept: 'application/json',
//         },
//         timeout: 10000, // Set a timeout of 10 seconds
//       }
//     );
//     console.log('Fetched Data:');
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching data from CoinGecko:", error.message);
//     console.error("Error Response Data:", error.response?.data);
//     return null;
//   }
// };

// const storeCryptoData = async () => {
//   const data = await fetchCryptoData();

//   if (data) {
//     const cryptoDataEntries = Object.keys(data).map(coinId => ({
//       coinId: coinId,
//       price: data[coinId].usd,
//       marketCap: data[coinId].usd_market_cap,
//       change24h: data[coinId].usd_24h_change,
//       timestamp: new Date(), // Add a timestamp
//     }));

//     try {
//       await CryptoData.insertMany(cryptoDataEntries);
//       console.log('Crypto data saved successfully!');
//     } catch (dbError) {
//       console.error("Error saving data to MongoDB:", dbError);
//     }
//   }
// };

// module.exports = storeCryptoData;
const axios = require('axios');
const CryptoData = require('./models/CryptoData');

const COINGECKO_API = process.env.COINGECKO_API || 'https://api.coingecko.com/api/v3/simple/price?ids=';

// Add delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch data with retry logic
const fetchCryptoData = async (retryCount = 0) => {
  const coins = ['bitcoin', 'matic-network', 'ethereum'];
  const maxRetries = 3;
  const baseDelay = 2000; // 2 seconds base delay

  try {
    // Add delay before request to avoid rate limiting
    await delay(baseDelay * (retryCount + 1));

    const response = await axios.get(
      `${COINGECKO_API}${coins.join(',')}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        },
        timeout: 15000, // Increased timeout to 15 seconds
        proxy: false // Disable proxy to prevent potential issues
      }
    );

    console.log('Data fetched successfully');
    return response.data;

  } catch (error) {
    console.error(`Attempt ${retryCount + 1} failed:`, error.message);

    // Handle specific error cases
    if (error.response?.status === 403 || error.response?.status === 429) {
      if (retryCount < maxRetries) {
        console.log(`Rate limit hit, retrying in ${(baseDelay * (retryCount + 1)) / 1000} seconds...`);
        return fetchCryptoData(retryCount + 1);
      }
    }

    // Log detailed error information
    if (error.response) {
      console.error('Error Response:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
    }

    return null;
  }
};

const storeCryptoData = async () => {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const data = await fetchCryptoData();

    if (data) {
      try {
        const cryptoDataEntries = Object.keys(data).map(coinId => ({
          coinId,
          price: data[coinId].usd,
          marketCap: data[coinId].usd_market_cap,
          change24h: data[coinId].usd_24h_change,
          timestamp: new Date(),
          fetchAttempt: attempts + 1
        }));

        await CryptoData.insertMany(cryptoDataEntries);
        console.log('Crypto data saved successfully!');
        return; // Exit after successful save
      } catch (dbError) {
        console.error("Error saving to MongoDB:", dbError.message);
        attempts++;
      }
    } else {
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Fetch failed, waiting before attempt ${attempts + 1}...`);
        await delay(5000 * attempts); // Increasing delay between attempts
      }
    }
  }

  console.error(`Failed to fetch and store data after ${maxAttempts} attempts`);
};

module.exports = storeCryptoData;