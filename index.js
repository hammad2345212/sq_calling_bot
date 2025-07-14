require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const voiceRoutes = require("./routes/voice");
const orderRoutes = require("./routes/order");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", voiceRoutes);
app.use("/api", orderRoutes); // For menu & future order/payment routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
