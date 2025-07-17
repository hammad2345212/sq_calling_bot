const twilio = require("twilio");
const { askVoiceGPT } = require("./openaiService");

async function handleVoice(req, res) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(
    "Hello! Welcome to our restaurant. Please tell me what you'd like to order after the beep."
  );
  twiml.record({
    transcribe: true,
    transcribeCallback: "/transcribe",
    maxLength: 30,
    playBeep: true,
  });
  res.type("text/xml");
  res.send(twiml.toString());
}

async function handleTranscription(req, res) {
  const userText = req.body.TranscriptionText;
  const twiml = new twilio.twiml.VoiceResponse();

  if (!userText) {
    twiml.say("Sorry, I didn't catch that. Please try again.");
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  try {
    const reply = await askVoiceGPT(userText);
    twiml.say(reply);
  } catch (err) {
    console.error("Voice GPT error:", err.message);
    twiml.say("Sorry, something went wrong while processing your order.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
}

module.exports = { handleVoice, handleTranscription };
