const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware for parsing JSON data
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("MongoDB connected!!"))
  .catch((err) => console.error("Unable to connect to MongoDB", err));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Node JS - Listening on port ${port}`));
