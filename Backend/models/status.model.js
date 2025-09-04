const mongoose=require("mongoose");

const statusSchema = mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    enum: ["video", "image", "text"],
    default: "text",
  },
  viewrs: [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
 expiresAt: {
  type: Date,
  default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
  required: true,
}

}, { timestamps: true });

module.exports = mongoose.model('Status', statusSchema);
