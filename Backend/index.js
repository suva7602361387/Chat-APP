const express = require("express");
const http = require("http");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const { cloudinaryConnect } = require("./config/cloudinary");
const connectwithDB = require("./config/database");
const initilizeSocket = require("./SocketiO/server");

// App + Server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ✅ Middlewares
app.use(
  fileUpload({
    useTempFiles: true,   // needed for tempFilePath
    tempFileDir: "/tmp/", // system tmp folder
  })
);
app.use(cookieParser());

const corsOptions = {
   // origin: process.env.FRONTENT_URL, // Allow only requests from this origin
   origin:"https://chat-app-nu-liard-37.vercel.app/",
    methods: ['GET','POST','DELETE','PATCH','PUT'], // Allow only these methods
    allowedHeaders: ['Content-Type', 'Authorization'] ,// Allow only these headers
    credentials: true,
};

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cors(corsOptions));

// ✅ DB + Cloudinary
connectwithDB();
cloudinaryConnect();

// ✅ Socket.io
const io = initilizeSocket(server);
app.use((req, res, next) => {
  req.io = io;
  req.socketUserMap = io.socketUserMap;
  next();
});

// ✅ Routes
const userRoute = require("./route/user.route");
const messageRoute = require("./route/message.route");
//const statusRoute = require("./route/status.route");

app.use("/api/v1/users", userRoute);
app.use("/api/v1/messages", messageRoute);
//app.use("/api/v1/status", statusRoute);

// ✅ Static files (if you store uploads locally too)
app.use("/uploads/files", express.static("uploads/files"));

// ✅ Home route
app.get("/", (req, res) => res.send("This is HomePage"));

// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
