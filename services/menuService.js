const axios = require("axios");
require("dotenv").config();

const CATEGORIES_API = process.env.CATEGORIES_API;
const PRODUCTS_API = process.env.PRODUCTS_API;

let cachedMenu = null;
let lastFetched = null;
const CACHE_DURATION = 1000 * 60 * 5;

function stripHtml(html) {
  return html?.replace(/<\/?[^>]+(>|$)/g, "").trim() || "";
}

async function fetchMenu() {
  try {
    const [categoriesRes, productsRes] = await Promise.all([
      axios.get(CATEGORIES_API),
      axios.get(PRODUCTS_API),
    ]);

    const categories = categoriesRes.data.data || [];
    const products = productsRes.data.data || [];

    const menuMap = {};

    categories.forEach((cat) => {
      menuMap[cat.site_category_id] = {
        name: cat.name,
        items: [],
      };
    });

    products.forEach((product) => {
      if (product.categories?.data?.length) {
        product.categories.data.forEach((cat) => {
          const catId = cat.site_category_id;
          if (menuMap[catId]) {
            menuMap[catId].items.push({
              id: product.id,
              name: product.name,
              price: product.price?.high_formatted || "$0.00",
              description: stripHtml(product.short_description),
              image: product.thumbnail?.data?.url || null,
              link: product.absolute_site_link || null,
            });
          }
        });
      }
    });

    const menu = Object.values(menuMap).filter((cat) => cat.items.length > 0);
    return menu;
  } catch (error) {
    console.error("Failed to fetch menu data:", error.message);
    return [];
  }
}

async function getMenu() {
  const now = Date.now();
  if (!cachedMenu || now - lastFetched > CACHE_DURATION) {
    console.log("Fetching fresh menu data...");
    cachedMenu = await fetchMenu();
    lastFetched = now;
  } else {
    console.log("Returning cached menu data");
  }
  return cachedMenu;
}

module.exports = { getMenu };
