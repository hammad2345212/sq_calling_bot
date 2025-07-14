require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const OPENAI_API_KEY = "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";
const OPENAI_MODEL = 'gpt-3.5-turbo';

app.post('/voice', async (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Hello! How are you doing? How can i help you?.');
    twiml.record({
        transcribe: true,
        transcribeCallback: '/transcribe',
        maxLength: 30,
        playBeep: true
    });
    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/transcribe', async (req, res) => {
    const userQuestion = req.body.TranscriptionText;
    const twiml = new twilio.twiml.VoiceResponse();

    if (!userQuestion) {
        twiml.say('Sorry, I did not catch that. Please try again.');
        res.type('text/xml');
        return res.send(twiml.toString());
    }

    try {
        const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: OPENAI_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful AI agent who answers questions over the phone.' },
                { role: 'user', content: userQuestion }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        const answer = openaiRes.data.choices[0].message.content;
        twiml.say(answer);
    } catch (err) {
        console.error('OpenAI error:', err.response ? err.response.data : err);
        twiml.say('Sorry, there was a problem getting your answer.');
    }
    res.type('text/xml');
    res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
