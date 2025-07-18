const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function transcribeRecording(recordingUrl) {
  const filePath = path.join(__dirname, "temp.mp3");

  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    method: "GET",
    url: recordingUrl,
    responseType: "stream",
  });
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  formData.append("model", "whisper-1");

  const result = await axios.post(
    "https://api.openai.com/v1/audio/transcriptions",
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  fs.unlinkSync(filePath);

  return result.data.text;
}

module.exports = { transcribeRecording };
