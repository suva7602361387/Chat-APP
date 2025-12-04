const express=require("express")
const router=express.Router();
const {signup,login,logout,getAlluser,getStreamToken,getCurrentUser,getuserProfile,sendotp,updateProfile}=require("../controller/user.controller");
const {secureRoute}=require("../middlewere/secureRoute")
router.post("/signup",signup);
router.post("/login",login);
router.post("/sendotp",sendotp);
router.get("/getCurrentUser",secureRoute,getCurrentUser);
router.get("/token",secureRoute,getStreamToken);
router.get("/",secureRoute,getAlluser);
router.post("/update-profile",secureRoute,updateProfile)
router.post("/logout",logout);
router.get("/getuserProfile",secureRoute,getuserProfile);
router.get("/me", secureRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});
module.exports=router;
