const express = require("express");
const router = express.Router();
const { secureRoute } = require("../middlewere/secureRoute");
const multer = require("multer");
const {createStatus,getStatus,viewStatus,deleteStatus}=require("../controller/status.controller")
router.post("/create-status",secureRoute,createStatus);
router.get("/get-status",secureRoute,getStatus);
router.put("/view-status/:id",secureRoute,viewStatus);
router.delete("/delete-status/:id",secureRoute,deleteStatus)
module.exports = router;
