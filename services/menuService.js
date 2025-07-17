const axios = require("axios");

async function getMenuByCategory(category) {
  // Replace this with your real API
  const url = `https://your-api.com/menu?category=${category}`;
  const response = await axios.get(url);
  return response.data;
}

module.exports = { getMenuByCategory };
