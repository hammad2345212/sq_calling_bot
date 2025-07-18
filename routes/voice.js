const express = require("express");
const { handleVoice, handleRecord, handleTranscribe } = require("../services/voiceService");
const router = express.Router();

router.post("/voice", handleVoice);
router.post("/handle-record", handleRecord);
router.post("/handle-transcribe", handleTranscribe);

module.exports = router;
