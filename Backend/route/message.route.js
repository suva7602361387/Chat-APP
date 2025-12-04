const express = require("express");
const router = express.Router();
const {
  sendmessage,
  getmessage,
  getConversation,
  deleteMessage,   // keep spelling consistent
  markasread,
  uploadfiles,
  localupload,
} = require("../controller/message.controller");
const { secureRoute } = require("../middlewere/secureRoute");
const multer = require("multer");

const upload = multer({ dest: "uploads/files" });

router.post("/upload-files", secureRoute, upload.single("file"), uploadfiles);
router.post("/sendmessage", secureRoute, sendmessage);
router.get("/getconversation", secureRoute, getConversation);
router.get("/getmessage/:id", secureRoute, getmessage);
router.put("/markasread", secureRoute, markasread);   // ✅ cleaned path
router.delete("/deletemeseges/:id", secureRoute, deleteMessage);
router.post("/localupload", localupload);

module.exports = router;
