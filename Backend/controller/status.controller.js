const uploadtocloudinary = require("../config/cloudinary");
const Status = require("../models/status.model");

exports.createStatus = async (req, res) => {
  const { content, contentType } = req.body;
  const userId = req.user._id;

  try {
    let file = req.file || (req.files && req.files.file);
    let mediaUrl = null;
    let finalcontentType = contentType || "text";

    if (file) {
      const uploaded = await uploadtocloudinary(file);
      if (!uploaded?.secure_url) {
        return res
          .status(400)
          .json({ success: false, message: "File upload failed" });
      }

      mediaUrl = uploaded.secure_url;

      if (file.mimetype.startsWith("image")) {
        finalcontentType = "image";
      } else if (file.mimetype.startsWith("video")) {
        finalcontentType = "video";
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Unsupported file type" });
      }
    } else if (!content?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message content is required" });
    }

    // ✅ Correct expiresAt
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // ✅ Save expiresAt in DB
    const status = await Status.create({
      user: userId,
      content: mediaUrl || content,
      contentType: finalcontentType,
      expiresAt,
    });

    // ✅ Correct findById
    const populatestatus = await Status.findById(status._id)
      .populate("user", "firstname")
      .populate("viewrs", "firstname");
    //emit socket event
    if (req.io && req.socketUserMap) {
      for (const { connectingUserId, socketId } of re.socketUserMap) {
        if (connectingUserId !== userId) {
          req.io.to(socketId).emit("new_status", populatestatus);
        }
      }
    }
    res.status(200).json({
      success: true,
      message: "Status sent successfully",
      data: populatestatus,
    });
  } catch (error) {
    console.error("Error in createStatus:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
exports.getStatus = async (req, res) => {
  try {
    let statusview = await Status.find({
      expiresAt: { $gt: new Date() }, // only non-expired statuses
    })
      .populate("user", "firstname")
      .populate("viewrs", "firstname")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Status get successfully",
      statusview,
    });
  } catch (error) {
    console.error("Error in getStatus:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.viewStatus = async (req, res) => {
  const { id: statusId } = req.params;
  const userid = req.user._id;
  console.log("This is statusid:", statusId);
  try {
    const status = await Status.findById(statusId);
    console.log("This is statusid:", status);

    if (!status) {
      return res.status(401).json({
        success: false,
        message: "Status not found",
      });
    }
    if (!status.viewrs.includes(userid)) {
      status.viewrs.push(userid);
      await status.save();
      const updatedstatus = await Status.findById(statusId)
        .populate("user", "firstname ")
        .populate("viewrs", "firstname ");
      //emit socket event
      if (req.io && req.socketUserMap) {
        const statusOwnerSocketId = req.socketUserMap.get(
          status.user._id.toString()
        );
        if (statusOwnerSocketId) {
          const viewData = {
            statusId,
            viewrsId: userid,
            totalviewrs: status.viewrs.length,
            viewrs: updatedstatus.viewrs,
          };
          req.io.to(statusOwnerSocketId).emit("status_viewe", viewData);
        } else {
          console.log("Status owner not found");
        }
      }
    } else {
      console.log("User already view the status");
    }
    return res.status(200).json({
      success: true,
      message: "Status view successfully",
      //data:updatedstatus
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error in Viewstatys" });
  }
};

exports.deleteStatus = async (req, res) => {
  const { id: statusId } = req.params;
  const userid = req.user._id;
  console.log("This is statusid:", statusId);
  console.log("This is statusid:", userid);

  try {
    const status = await Status.findById(statusId);
    console.log("This is statusid:", status);

    if (!status) {
      return res.status(401).json({
        success: false,
        message: "Status not found",
      });
    }
    if (status.user.toString() !== userid.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await status.deleteOne();
    if (req.io && req.socketUserMap) {
      for (const { connectingUserId, socketId } of re.socketUserMap) {
        if (connectingUserId !== userId) {
          req.io.to(socketId).emit("status_deleted", statusId);
        }
      }
    }
    return res.status(200).json({
      success: true,
      message: "Status deleted successfully",
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error in Viewstatys" });
  }
};
