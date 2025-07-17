const express = require("express");
const router = express.Router();
const { askChatGPT } = require("../services/openaiService");

router.post("/prompt", async (req, res) => {
  const message = req.body.message;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const reply = await askChatGPT(message);
    res.json({ reply });
  } catch (err) {
    console.error("GPT Chat Error:", err.message);
    res.status(500).json({ error: "Failed to process message" });
  }
});

module.exports = router;
