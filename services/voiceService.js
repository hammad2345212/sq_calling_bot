const twilio = require("twilio");
const { askVoiceGPT } = require("./openaiService");
const { setCallState, getCallState, clearCall } = require("./sessionStore");

async function handleVoice(req, res) {
  const vr = new twilio.twiml.VoiceResponse();
  const callSid = req.body.CallSid;

  const isReturning = getCallState(callSid, "started");

  if (!isReturning) {
    setCallState(callSid, "started", true);
    vr.say(
      "Hello! Welcome to Chef Chen restaurant. What would you like to order?"
    );
  } else {
    vr.say("What else would you like to add to your order?");
  }

  vr.gather({
    input: "speech",
    action: "/handle-speech",
    method: "POST",
    timeout: 5,
    speechTimeout: "auto",
    beep: true,
  });

  vr.say("We didn't receive any input. Goodbye!");
  vr.hangup();

  res.type("text/xml").send(vr.toString());
}

async function handleSpeech(req, res) {
  const { SpeechResult, CallSid } = req.body;
  const vr = new twilio.twiml.VoiceResponse();

  if (!SpeechResult) {
    console.error("No speech recognized.");
    vr.say("Sorry, I didn't catch that. Goodbye!");
    vr.hangup();
    return res.type("text/xml").send(vr.toString());
  }

  console.log("User said:", SpeechResult);

  try {
    // Let the user know we're processing
    vr.say("Please wait while I process your order...");
    vr.pause({ length: 2 }); // Optional: add slight pause

    const { reply, intent } = await askVoiceGPT(SpeechResult);

    vr.say(reply);
    vr.pause({ length: 1 });

    if (intent === "order") {
      vr.say("Would you like to order anything else?");
      vr.gather({
        input: "speech",
        action: "/handle-loop",
        method: "POST",
        timeout: 5,
        speechTimeout: "auto",
        beep: true,
      });

      vr.say("We didn't hear anything. Goodbye!");
      vr.hangup();
    } else {
      vr.say("When you're ready, please tell me what you'd like to order.");
      vr.redirect({ method: "POST" }, "/voice");
    }

    res.type("text/xml").send(vr.toString());
  } catch (err) {
    console.error("Error during GPT response:", err);
    vr.say("Sorry, something went wrong processing your order.");
    vr.hangup();
    res.type("text/xml").send(vr.toString());
  }
}

function handleLoop(req, res) {
  const { CallSid } = req.body;
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

    clearCall(CallSid);
  }

  res.type("text/xml").send(vr.toString());
}

module.exports = {
  handleVoice,
  handleSpeech,
  handleLoop,
};
