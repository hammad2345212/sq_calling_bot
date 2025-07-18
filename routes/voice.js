const express = require("express");
const {
  handleVoice,
  handleLoop,
  handleTranscribe,
} = require("../services/voiceService");
const router = express.Router();

router.post("/voice", handleVoice);
router.post("/handle-loop", handleLoop);
router.post("/handle-transcribe", handleTranscribe);

module.exports = router;
