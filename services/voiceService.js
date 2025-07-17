const twilio = require("twilio");
const { askVoiceGPT } = require("./openaiService");

// /voice route - Starts the call
async function handleVoice(req, res) {
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say(
    "Hello! Welcome to Chef Chen restaurant. Please tell me what you'd like to order after the beep."
  );

  twiml.record({
    transcribe: true,
    transcribeCallback: "/transcribe",
    maxLength: 30,
    playBeep: true,
  });

  twiml.say("Thank you. Goodbye!");

  res.type("text/xml");
  res.send(twiml.toString());
}

async function handleTranscription(req, res) {
  const userText = req.body.TranscriptionText;
  const twiml = new twilio.twiml.VoiceResponse();
  console.log("Transcription received");
  if (!userText) {
    twiml.say("Sorry, I didn't catch that. Please try again.");
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  try {
    const reply = await askVoiceGPT(userText);

    twiml.say(reply);
    twiml.pause({ length: 1 });
    twiml.say("Would you like to order anything else?");
    twiml.redirect("/voice");
  } catch (err) {
    console.error("Voice GPT error:", err.message);
    twiml.say("Sorry, something went wrong while processing your order.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
}

module.exports = { handleVoice, handleTranscription };
