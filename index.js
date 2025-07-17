require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const voiceRoutes = require("./routes/voice");
const orderRoutes = require("./routes/order");
const promptRoutes = require("./routes/prompt");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", voiceRoutes);
app.use("/api", orderRoutes);
app.use("/api", promptRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
