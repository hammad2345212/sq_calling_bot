const twilio = require("twilio");
const { askChatGPT } = require("./openaiService");

async function handleVoice(req, res) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(
    "Hello! Welcome to our restaurant. Please tell me what you would like to order."
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
    twiml.say("Sorry, I did not catch that. Please try again.");
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  try {
    const reply = await askChatGPT(userText);
    twiml.say(reply);
  } catch (err) {
    console.error(err);
    twiml.say("Sorry, something went wrong.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
}

module.exports = { handleVoice, handleTranscription };
