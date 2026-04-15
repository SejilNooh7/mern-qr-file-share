require('dotenv').config();
const mongoose = require('mongoose');

console.log("Testing connection to: " + process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("SUCCESS!");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAIL:", err.message);
    process.exit(1);
  });
