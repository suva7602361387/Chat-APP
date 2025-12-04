// const { StreamChat } = require("stream-chat");

// const api_key = process.env.STREAM_API_KEY;
// const api_secret = process.env.STREAM_API_SECRET;

// if (!api_key || !api_secret) {
//   throw new Error("Stream key or secret is missing");
// }

// const streamClient = StreamChat.getInstance(api_key, api_secret);

// exports.createStreamUser = async (userdata) => {
//   try {
//     await streamClient.upsertUsers([{
//       id: userdata.id,
//       name: userdata.name,
//       ...userdata
//     }]);
//     return userdata;
//   } catch (error) {
//     console.error("Error upserting Stream user:", error);
//   }
// };

// exports.generateStreamToken=(userId)=>{
//      try {
//     // ensure userId is a string
//     const userIdStr = userId.toString();
//     return streamClient.createToken(userIdStr);
//   } catch (error) {
//     console.error("Error generating Stream token:", error);
//   }
// }
// config/stream.js
const { StreamClient } = require("@stream-io/node-sdk");

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

if (!api_key || !api_secret) {
  throw new Error("STREAM_API_KEY or STREAM_API_SECRET is missing");
}

// Single StreamClient instance for all products (chat + video)
const streamServerClient = new StreamClient(api_key, api_secret);

// Ensure user exists in Stream (chat + video share same user)
const createOrUpdateStreamUser = async (user) => {
  if (!user || !user._id) {
    throw new Error("Invalid user object in createOrUpdateStreamUser");
  }

  await streamServerClient.upsertUsers([
    {
      id: user._id.toString(),
      name: user.firstname,
      image: user.profilepic,
      // add more custom fields if you want
    },
  ]);
};

const generateStreamToken = (userId) => {
  if (!userId) throw new Error("User ID is required to generate token");
  return streamServerClient.createToken(userId.toString());
};

module.exports = {
  streamServerClient,
  createOrUpdateStreamUser,
  generateStreamToken,
};
