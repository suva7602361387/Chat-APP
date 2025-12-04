const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { createTokenandSaveCookie } = require("../jwt/generateToken");
const OTP = require("../models/otp.model");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailsender");
//const { default: User } = require("../../Frontend/src/home/left/User");
const cloudinary = require("cloudinary").v2;
//const { generateStreamToken } = require("../config/stream");
const {
  createOrUpdateStreamUser,
  generateStreamToken,
} = require("../config/stream");
require("dotenv").config();
exports.signup = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    confirmPassword,
    PhoneNumber,
    otp,
  } = req.body;
  if (
    !firstname ||
    !lastname ||
    !email ||
    !password ||
    !confirmPassword ||
    !PhoneNumber ||
    !otp
  ) {
    return res.status(403).send({
      success: false,
      message: "All Fields are required",
    });
  }
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already registered" });
    }
    // Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log("This is res:", response);
    if (response.length === 0) {
      // OTP not found for the email
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    } else if (otp !== response[0].otp) {
      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    // Hashing the password
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await new User({
      firstname,
      lastname,
      email,
      password: hashPassword,
      PhoneNumber: PhoneNumber,
    });
    await newUser.save();
    if (newUser) {
      //createTokenandSaveCookie(newUser._id, res);

      res.status(201).json({
        message: "User created successfully",
        success: true,

        user: {
          _id: newUser._id,
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          email: newUser.email,
          PhoneNumber: newUser.PhoneNumber,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email/phone and password",
      });
    }

    // Check if identifier is email or phone
    let user;
    const emailRegex = /\S+@\S+\.\S+/;

    if (emailRegex.test(identifier)) {
      user = await User.findOne({ email: identifier });
    } else {
      user = await User.findOne({ PhoneNumber: identifier });
    }

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered. Please sign up to continue",
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    user.token = token;
    user.password = undefined;

   const options = {
     httpOnly: true,
      secure: true,      // ✅ required in HTTPS (Render)
      sameSite: "None",  // ✅ required for cross-origin
      maxAge: 3 * 24 * 60 * 60 * 1000,
  // expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
  // secure: true,         // ✅ Required for HTTPS
  // sameSite: "None",     // ✅ Required for cross-site
  // httpOnly: true,   // can’t access via JS
  //sameSite: "Lax",  // Lax is okay if both frontend/backend run on localhost
};



    return res
      .cookie("token", token, options)
      .status(200)
      .json({
        success: true,
        token,
        user,
        message: `User login successful via ${
          emailRegex.test(identifier) ? "Email" : "Phone Number"
        }`,
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};


// Get logged in user's details
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id; // this requires your auth middleware to attach req.user
    const user = await User.findById(userId).select("-password"); // never send password

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const { uploadToCloudinary } = require("../config/cloudinary");
exports.updateProfile = async (req, res) => {
  const { firstname, lastname, about, image } = req.body;
  const userId = req.user._id;
  console.log(image);
  try {
    const UserExist = await User.findById(userId);
    if (!UserExist) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    let profilePicUrl = UserExist.profilepic; // keep old if not updating

    // if frontend sends base64 image
    if (image) {
      // image is already data:image/png;base64,... from frontend
      const response = await cloudinary.uploader.upload(image, {
        folder: "Chat-App",
        resource_type: "auto",
      });
      profilePicUrl = response.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstname: firstname || UserExist.firstname,
        lastname: lastname || UserExist.lastname,
        about: about || UserExist.about,
        profilepic: profilePicUrl,
      },
      { new: true }
    ).lean(); // ✅ already plain object

    // no need for .save()

    if (req.io) {
      req.io.emit("profileUpdated", {
        userId: updatedUser._id.toString(),
        updatedUser: {
          _id: updatedUser._id.toString(),
          firstname: updatedUser.firstname,
          lastname: updatedUser.lastname,
          about: updatedUser.about,
          profilepic: updatedUser.profilepic,
        },
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user is already present
    // Find user with provided email
    const checkUserPresent = await User.findOne({ email });
    // to be used in case of signup

    // If user found with provided email
    if (checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }
    //OTP is generate
    var otp = await otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    //check OTP is unick or not
    const result = await OTP.findOne({ otp: otp });
    console.log("Result is Generate OTP Func");
    console.log("OTP", otp);
    console.log("Result", result);
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Body", otpBody);
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ error: "User Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getuserProfile = async (req, res) => {
  try {
    console.log("This is User:", req.user);
    const loggedInUser = req.user._id;
    console.log("id is :", req.user._id);
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select("-password");
    res.status(201).json(filteredUsers);
    // const alluser=await User.find();
    // res.status(201).json({alluser});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// exports.getStreamToken = async (req, res) => {
//   try {
//     //console.log("API key (backend):", apiKey);
//     console.log("Token created for user ID:", req.user.id);

//     const token = generateStreamToken(req.user.id);

//     res.status(200).json({ token });
//     //   const userId = req.user.id; // from your auth middleware
//     // const token = client.createToken(userId);
//     // res.json({ token });
//   } catch (error) {
//     console.log("Error in getStreamToken controller:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
exports.getAlluser=async (req,res)=>{
  const keywords=req.query.search?
                 {
                  $or:[
                    { name : { $regex:req.query.search,$options:"i"}},
                    {email :{ $regex:req.query.search,$options:"i"}}
                  ]
                 }:{};
  const users=await User.find(keywords).find({_id:{$ne:req.user._id}}); 
  res.status(200).json({
      success: true,
      message: "User get Successfully",
      users,
    });              
}
exports.getStreamToken = async (req, res) => {
  try {
    const user = req.user; // must contain {_id, firstname, profilepic}

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // make sure user exists in Stream
    await createOrUpdateStreamUser(user);

    const token = generateStreamToken(user._id);

    return res.json({ token });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return res.status(500).json({ message: "Failed to generate Stream token" });
  }
};
