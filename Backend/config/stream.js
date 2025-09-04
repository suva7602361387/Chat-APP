//const { StreamChat } = require("stream-chat");
const {StreamChat}=require("stream-chat")
const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

if (!api_key || !api_secret) {
  throw new Error("Stream key or secret is missing");
}

const streamClient = StreamChat.getInstance(api_key, api_secret);

exports.createStreamUser = async (userdata) => {
  try {
    await streamClient.upsertUsers([{
      id: userdata.id,
      name: userdata.name,
      ...userdata
    }]);
    return userdata;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

exports.generateStreamToken=(userId)=>{
     try {
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
}
