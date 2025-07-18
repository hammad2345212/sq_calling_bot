const twilio = require("twilio");
const { askVoiceGPT } = require("./openaiService");
const { transcribeRecording } = require("./transcriptionService");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function handleVoice(req, res) {
  const vr = new twilio.twiml.VoiceResponse();

  vr.say(
    "Hello! Welcome to Chef Chen restaurant. Please tell me what you'd like to order after the beep."
  );

  vr.record({
    action: "/handle-transcribe",
    method: "POST",
    maxLength: 30,
    playBeep: true,
    timeout: 5,
  });

  vr.say("We didn't receive any input. Goodbye!");
  vr.hangup();

  res.type("text/xml").send(vr.toString());
}

async function handleTranscribe(req, res) {
  const { RecordingUrl, CallSid } = req.body;
  console.log("Transcribing recording for CallSid:", CallSid);
  console.log("Recording URL:", RecordingUrl);

  if (!RecordingUrl) {
    console.error("Recording URL missing.");
    return res.sendStatus(400);
  }

  try {
    const transcription = await transcribeRecording(`${RecordingUrl}.mp3`);
    console.log("Transcription:", transcription);

    const gptReply = await askVoiceGPT(transcription);

    await client.calls(CallSid).update({
      twiml: `<Response>
        <Say>${gptReply}</Say>
        <Pause length="1"/>
        <Say>Would you like to order anything else?</Say>
        <Gather input="speech" timeout="5" action="/handle-loop" method="POST">
          <Say>Please say yes or no.</Say>
        </Gather>
        <Say>We didn't hear anything. Goodbye!</Say>
        <Hangup/>
      </Response>`,
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Error during transcription or GPT:", err);
    res.sendStatus(500);
  }
}

function handleLoop(req, res) {
  const userSpeech = req.body.SpeechResult?.trim().toLowerCase();
  const vr = new twilio.twiml.VoiceResponse();

  if (
    userSpeech &&
    (userSpeech.includes("yes") ||
      userSpeech.includes("sure") ||
      userSpeech.includes("okay"))
  ) {
    vr.redirect({ method: "POST" }, "/voice");
  } else {
    vr.say("Thank you for your order. Have a great day!");
    vr.hangup();
  }

  res.type("text/xml").send(vr.toString());
}

module.exports = {
  handleVoice,
  handleTranscribe,
  handleLoop,
};
