const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("CMS MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
