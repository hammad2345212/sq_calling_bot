# Twilio ChatGPT Voice Agent

This app lets users call a phone number, ask a question, and get a spoken answer from ChatGPT.

## Setup

1. **Clone the repo and install dependencies:**
   ```bash
   npm install
   ```
2. **Create a `.env` file:**
   Copy `.env.example` to `.env` and add your OpenAI API key.

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Set up Twilio:**
   - Buy a phone number in your [Twilio Console](https://console.twilio.com/).
   - Set the Voice webhook for incoming calls to:
     ```
     https://<your-server-url>/voice
     ```
   - (If running locally, use [ngrok](https://ngrok.com/) to expose your server.)

5. **How it works:**
   - User calls your Twilio number.
   - The agent records and transcribes the question.
   - The backend asks ChatGPT and speaks the answer back to the user.

## Security
- **Never commit your real API keys.**
- Use environment variables for secrets.

## Customization
- You can change the greeting or agent behavior in `index.js`.

---

**Enjoy your phone-based ChatGPT agent!**
