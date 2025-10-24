import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthUser from '../hooks/Authusers';
import axios from 'axios';
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

axios.defaults.timeout = 15000; // global 15s timeout

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

function CallPage() {
const { id: rawCallId } = useParams();
const callId = rawCallId?.replace(/[^a-zA-Z0-9_-]/g, "");
  const { authUser } = useAuthUser();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  // Fetch token from backend
  const getStreamToken = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/token`);
    return res.data;
  };

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // only fetch if user exists
  });

  useEffect(() => {
    const initCall = async () => {
      if (tokenLoading || !tokenData?.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.firstname,
          image: authUser.profilepic,
        };

        console.log("User:", user);
        console.log("API key:", STREAM_API_KEY);
        console.log("Token from backend:", tokenData.token);

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        // Use a closer region to reduce latency
        const callInstance = videoClient.call("default", callId, {
          region: "sin", // Singapore (good for India)
        });

        let joined = false;
        try {
          await callInstance.join({ create: true });
          joined = true;
        } catch (err) {
          if (err.code === "ECONNABORTED") {
            console.warn("Join request timed out, retrying in 2s...");
            await new Promise((res) => setTimeout(res, 2000));
            await callInstance.join({ create: true });
            joined = true;
          } else {
            throw err;
          }
        }

        if (joined) {
          console.log("Joined call successfully");
          setClient(videoClient);
          setCall(callInstance);
        }
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenLoading, tokenData, authUser, callId]);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative w-full h-full">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            {isConnecting ? (
              <p>Connecting to the call...</p>
            ) : (
              <p>Could not initialize call. Please refresh or try again later.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) navigate("/");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
