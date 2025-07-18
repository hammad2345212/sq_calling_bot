const twilio = require("twilio");
const { askVoiceGPT } = require("./openaiService");

// /voice route – starts the call and records/transcribes the message
async function handleVoice(req, res) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(
    "Hello! Welcome to Chef Chen restaurant. Please tell me what you'd like to order after the beep."
  );
  twiml.record({
    action: "/handle-record",
    method: "POST",
    maxLength: 30,
    playBeep: true,
    transcribe: true,
    transcribeCallback: "/handle-transcribe",
  });
  twiml.say("Thank you. Goodbye.");
  twiml.hangup();

  res.type("text/xml");
  res.send(twiml.toString());
}

// /handle-record route – called immediately after recording ends
function handleRecord(req, res) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("Thanks — please hold while we process your order.");
  twiml.pause({ length: 10 });
  twiml.say("Still processing, one moment please.");
  twiml.pause({ length: 10 });
  twiml.say("Goodbye!");
  twiml.hangup();

  res.type("text/xml");
  res.send(twiml.toString());
}

// /handle-transcribe route – async callback with transcriptionText
async function handleTranscribe(req, res) {
  const { TranscriptionText, CallSid } = req.body;
  console.log("TranscriptionText:", TranscriptionText);

  if (!TranscriptionText) {
    console.error("No transcription available in callback");
    return res.sendStatus(400);
  }

  try {
    const reply = await askVoiceGPT(TranscriptionText);

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await client.calls(CallSid).update({
      twiml: `<Response>
                <Say>${reply}</Say>
                <Pause length="1"/>
                <Say>Would you like to order anything else?</Say>
                <Redirect method="POST">/voice</Redirect>
              </Response>`,
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Error replying via GPT:", err);
    res.sendStatus(500);
  }
}

module.exports = {
  handleVoice,
  handleRecord,
  handleTranscribe,
};
