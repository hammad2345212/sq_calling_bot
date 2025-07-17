const express = require("express");
const router = express.Router();
const { getMenuByCategory } = require("../services/menuService");
const { getMenu } = require("../utils/menuCache");

router.get("/menu", async (req, res) => {
  const category = req.query.category;
  if (!category) return res.status(400).json({ error: "Category required" });

  try {
    const menu = await getMenuByCategory(category);
    res.json(menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

router.get("/debug/menu", async (req, res) => {
  try {
    const fullMenu = await getMenu();

    console.log("=== Full Menu ===");
    fullMenu.forEach((category) => {
      console.log(`Category: ${category.name}`);
      category.items.forEach((item) => {
        console.log(
          ` - ${item.name} - ${item.description}: ${item.price || "N/A"}`
        );
      });
    });

    res.json({
      message: "Menu printed to console.",
      totalCategories: fullMenu.length,
    });
  } catch (err) {
    console.error("Menu debug failed:", err);
    res.status(500).json({ error: "Could not load menu." });
  }
});

module.exports = router;
