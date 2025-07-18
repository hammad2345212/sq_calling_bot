const express = require("express");
const {
  handleVoice,
  handleLoop,
  handleSpeech,
} = require("../services/voiceService");
const router = express.Router();

router.post("/voice", handleVoice);
router.post("/handle-loop", handleLoop);
router.post("/handle-speech", handleSpeech);

module.exports = router;
