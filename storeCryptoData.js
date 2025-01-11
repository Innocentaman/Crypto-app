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

// Use a different endpoint that's more lenient with rate limits
const COINGECKO_API = 'https://api.coingecko.com/api/v3/coins/markets';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchCryptoData = async (retryCount = 0) => {
  const coins = ['bitcoin', 'matic-network', 'ethereum'];
  const maxRetries = 3;
  const baseDelay = 5000; // Increased to 5 seconds

  try {
    // Add mandatory delay between requests
    await delay(baseDelay + (retryCount * 2000));

    const response = await axios.get(COINGECKO_API, {
      params: {
        vs_currency: 'usd',
        ids: coins.join(','),
        order: 'market_cap_desc',
        sparkline: false,
        locale: 'en'
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.coingecko.com',
        'Referer': 'https://www.coingecko.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site'
      },
      timeout: 30000
    });

    return response.data;

  } catch (error) {
    console.error(`Attempt ${retryCount + 1} failed:`, error.message);
    
    if (error.response?.status === 403 || error.response?.status === 429) {
      if (retryCount < maxRetries) {
        const waitTime = baseDelay * (retryCount + 2);
        console.log(`Rate limit hit, waiting ${waitTime/1000} seconds...`);
        await delay(waitTime);
        return fetchCryptoData(retryCount + 1);
      }
    }

    // Transform the data into our required format
    return null;
  }
};

const storeCryptoData = async () => {
  try {
    const data = await fetchCryptoData();

    if (data && Array.isArray(data)) {
      const cryptoDataEntries = data.map(coin => ({
        coinId: coin.id,
        price: coin.current_price,
        marketCap: coin.market_cap,
        change24h: coin.price_change_percentage_24h,
        timestamp: new Date(),
        lastUpdated: coin.last_updated
      }));

      if (cryptoDataEntries.length > 0) {
        // Use updateMany with upsert instead of insertMany to avoid duplicates
        const bulkOps = cryptoDataEntries.map(entry => ({
          updateOne: {
            filter: { coinId: entry.coinId },
            update: { $set: entry },
            upsert: true
          }
        }));

        await CryptoData.bulkWrite(bulkOps);
        console.log(`Successfully updated ${cryptoDataEntries.length} coins`);
      }
    } else {
      console.log('No valid data received from CoinGecko');
    }
  } catch (error) {
    console.error('Error in storeCryptoData:', error.message);
  }
};

// Add cache handling
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute

const getCryptoDataWithCache = async () => {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION) {
    console.log('Using cached data');
    return;
  }
  
  lastFetchTime = now;
  await storeCryptoData();
};

module.exports = getCryptoDataWithCache;