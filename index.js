require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const chatRoutes = require("./routes/chat");
const voiceRoutes = require("./routes/voice");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", chatRoutes);
app.use("/", voiceRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
