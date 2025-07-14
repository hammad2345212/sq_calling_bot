const express = require("express");
const router = express.Router();
const { getMenuByCategory } = require("../services/menuService");

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

module.exports = router;
