const mongoose = require("mongoose");
require("dotenv").config();

const connectWithDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ DB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectWithDB;
