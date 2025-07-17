const express = require("express");
const { chatWithGPT } = require("../services/gptService");
const router = express.Router();

router.post("/prompt", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const gptResponse = await chatWithGPT(userMessage);
    res.json({ reply: gptResponse });
  } catch (err) {
    console.error("GPT Error:", err.message);
    res.status(500).json({ error: "Failed to get GPT response" });
  }
});

module.exports = router;
