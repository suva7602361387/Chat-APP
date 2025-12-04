import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div>
      <button
        onClick={handleVideoCall}
        className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 
                   transition-colors duration-200 shadow-md text-white"
        title="Start a Video Call"
      >
        <VideoIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

export default CallButton;
