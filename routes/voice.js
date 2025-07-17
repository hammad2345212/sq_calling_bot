const express = require("express");
const router = express.Router();
const {
  handleVoice,
  handleTranscription,
} = require("../services/voiceService");

router.post("/voice", handleVoice);
router.post("/transcribe", handleTranscription);

module.exports = router;
