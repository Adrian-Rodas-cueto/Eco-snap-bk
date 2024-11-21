const express = require("express");
require("dotenv").config();
const path = require("path");
const bodyParser = require("body-parser");
const connectDB = require("./config/database");
const Router = require("./routes");

const cors = require("cors");
const app = express();

// Connect to MongoDB
connectDB();
// Enable CORS for all routes
app.use(cors());
// Parse JSON bodies (for application/json content type)
app.use(bodyParser.json());
// Parse URL-encoded bodies (for application/x-www-form-urlencoded content type)
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const PORT = process.env.PORT || 5001;

app.use(express.static("public"));
app.use("/api", Router);

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
