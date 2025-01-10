# Cryptocurrency Tracker Application

**[Live Link: https://crypto-app-p56z.onrender.com/](https://crypto-app-p56z.onrender.com/)**

Welcome to the Cryptocurrency Tracker application, a comprehensive platform to monitor real-time cryptocurrency data, perform advanced analytics, and access insightful metrics for Bitcoin, Ethereum, and Litecoin. The app is designed for enthusiasts and professionals looking for up-to-date and meaningful cryptocurrency statistics.

---

## Features

1. **Real-Time Cryptocurrency Data**:
   - Displays the latest price, market capitalization, and 24-hour percentage changes.
   - Real-time updates for Bitcoin, Ethereum, and Litecoin.

2. **Advanced Analytics**:
   - Calculates the standard deviation of cryptocurrency prices for the last 100 records.
   - Offers statistical insights for informed decision-making.

3. **Dynamic UI**:
   - User-friendly and responsive interface created with EJS templates.
   - Displays separate tables for the latest five records of each cryptocurrency.

4. **Robust API Endpoints**:
   - `/stats` API: Fetches the latest statistics for a requested cryptocurrency.
   - `/deviation` API: Computes the standard deviation of prices for the last 100 records.

5. **Secure and Scalable Backend**:
   - Built using Node.js and Express.js for efficient routing and data handling.
   - MongoDB database ensures seamless data storage and retrieval.

6. **Deployed for Accessibility**:
   - Hosted on Render, enabling easy access and scalability.
   - Designed to handle multiple concurrent users seamlessly.

---

## API Endpoints

### 1. **Homepage** (`/`)
Displays the latest five records for Bitcoin, Ethereum, and Litecoin. Each cryptocurrency has its own table for clear organization. The data is styled and scrollable for an optimal user experience.

---

### 2. **Statistics API** (`/stats?coin=<coin_name>`)
Fetches the latest statistics for a specified cryptocurrency.

**Query Parameters**:
- `coin`: The cryptocurrency name (`bitcoin`, `ethereum`, or `litecoin`).

**Example Response**:
```json
{
  "price": 40000,
  "marketCap": 800000000,
  "24hChange": 3.4
}
```

### 3. **Deviation API** (`/deviation?coin=<coin_name>`)
Computes and returns the standard deviation of the last 100 price records for a specified cryptocurrency.

**Query Parameters**:
* `coin`: The cryptocurrency name (`bitcoin`, `ethereum`, or `litecoin`).

**How It Works**:
1. The API queries the last 100 price records for the specified cryptocurrency from MongoDB.
2. It calculates the standard deviation using the formula:
   σ = √(Σ(xᵢ - μ)² / n)
   where:
   * xᵢ: Individual price record
   * μ: Mean of the price records
   * n: Number of records
3. The calculated standard deviation value is returned in the response.

**Example Response**:
```json
{
  "deviation": 4082.48
}
```

---

## Tech Stack

* **Frontend**: EJS Templates with HTML and CSS
* **Backend**: Node.js and Express.js
* **Database**: MongoDB for secure and scalable data storage
* **Real-Time Data Fetching**: Axios for fetching cryptocurrency data from external APIs
* **Analytics**: Standard deviation calculations implemented in JavaScript
* **Deployment**: Render for hosting the application

---

## How It Works

1. **Data Fetching**:
   * A background service fetches real-time cryptocurrency data at regular intervals
   * The fetched data is stored in MongoDB for efficient querying and analytics

2. **User Interface**:
   * The homepage dynamically displays cryptocurrency data in separate, scrollable tables
   * The interface is styled for an intuitive and professional look

3. **Statistics API**:
   * The `/stats` API retrieves the latest price, market cap, and 24-hour percentage change
   * Provides quick and accurate insights for users

4. **Deviation API**:
   * Calculates the standard deviation of the last 100 price records
   * Helps users understand the volatility of the cryptocurrency over recent records

5. **Analytics**:
   * Standard deviation and real-time statistics offer valuable insights for decision-making
   * Enables users to track market trends and volatility patterns
