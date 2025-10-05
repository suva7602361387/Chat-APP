import { useEffect, useState } from "react";
import moment from "moment";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import { useSocketContext } from "../context/socketcontext";
import { BsEmojiNeutral } from "react-icons/bs";

function Profile() {
  const [authUser, setAuthUser] = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(""); // 👈 preview state
  const [showEmoji1, setShowEmoji1] = useState(false);
  const [showEmoji2, setShowEmoji2] = useState(false);
  const [showEmoji3, setShowEmoji3] = useState(false);

  const { socket } = useSocketContext(); // ✅ get socket instance

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [about, setAbout] = useState("");

  const navigate = useNavigate();

  // Prefill fields
  useEffect(() => {
    if (authUser?.user) {
      setFirstname(authUser.user.firstname || "");
      setLastname(authUser.user.lastname || "");
      setAbout(authUser.user.about || "");
      setPreview(authUser.user.profilepic || ""); // 👈 show existing profilepic
    }
  }, [authUser]);

  const onFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // 👇 create instant preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setPreview(reader.result);
  };

  const handleEmojiClick1 = (emojiData) => {
    setFirstname((prev) => prev + emojiData.emoji);
    setShowEmoji1(false);
  };
  const handleEmojiClick2 = (emojiData) => {
    setLastname((prev) => prev + emojiData.emoji);
    setShowEmoji2(false);
  };
  const handleEmojiClick3 = (emojiData) => {
    setAbout((prev) => prev + emojiData.emoji);
    setShowEmoji3(false);
  };

  const updateProfile = async () => {
    try {
      let base64Image = null;
      if (selectedFile) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        base64Image = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
        });
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/update-profile`,
        {
          firstname,
          lastname,
          about,
          image: base64Image,
        },
        {
          headers: {
            Authorization: `Bearer ${authUser?.token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        setAuthUser({ ...authUser, user: response.data.data }); // ✅ update context
        if (socket) {
          socket.emit("profileUpdated", {
            userId: response.data.data._id,
            updatedUser: response.data.data,
          });
        }
        navigate("/chat-page");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Profile update error:", error);
      toast.error("Failed to update profile");
    }
  };

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="bg-gray-850 shadow-2xl rounded-2xl p-8 w-full max-w-xl relative">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          {preview ? (
            <img
              src={preview}
              alt="Profile Pic"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold border-4 border-blue-500 shadow-lg">
              {authUser?.user?.firstname?.[0]?.toUpperCase() || "U"}
            </div>
          )}

          <label className="mt-4 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300">
            Select Photo
            <input type="file" onChange={onFileSelect} className="hidden" />
          </label>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              placeholder="First name"
              className="w-full p-3 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              onClick={() => setShowEmoji1(!showEmoji1)}
              className="absolute right-3 top-3 text-gray-400 hover:text-yellow-400"
            >
              <BsEmojiNeutral size={20} />
            </button>
            {showEmoji1 && (
              <div className="absolute mt-2 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick1} theme="dark" />
              </div>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              placeholder="Last name"
              className="w-full p-3 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              onClick={() => setShowEmoji2(!showEmoji2)}
              className="absolute right-3 top-3 text-gray-400 hover:text-yellow-400"
            >
              <BsEmojiNeutral size={20} />
            </button>
            {showEmoji2 && (
              <div className="absolute mt-2 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick2} theme="dark" />
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="relative mb-6">
          <textarea
            rows="3"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Write about yourself..."
            className="w-full p-3 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <button
            onClick={() => setShowEmoji3(!showEmoji3)}
            className="absolute right-3 top-3 text-gray-400 hover:text-yellow-400"
          >
            <BsEmojiNeutral size={20} />
          </button>
          {showEmoji3 && (
            <div className="absolute mt-2 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick3} theme="dark" />
            </div>
          )}
        </div>

        {/* Email + Created At */}
        <div className="mb-6 space-y-1 text-gray-300">
          <p>
            <b>Email:</b> {authUser?.user?.email || "Not Available"}
          </p>
          <p>
            <b>Account Created:</b>{" "}
            {authUser?.user?.createdAt
              ? moment(authUser.user.createdAt).format("MMM DD, YYYY")
              : "N/A"}
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={updateProfile}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 font-semibold"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
