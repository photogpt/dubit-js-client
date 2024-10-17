import { useEffect, useState } from "react";
import AgoraRTC, { ILocalAudioTrack } from "agora-rtc-sdk-ng";
// import {axiosInstance} from "../../lib/axiosInstance"; 
import { useCallObject } from "@daily-co/daily-react";
import axios from "axios";

interface UseBotHandlerSendParams {
  tracks: ILocalAudioTrack[] | null; 
  client: any;
  token:any;
  from_Language : any;
  to_language : any;
  voice_type:any;
  audio:boolean;
}

const API_URL = "https://test-api.dubit.live"

export const useBotHandlerSend = ({ tracks, client , token, from_Language, to_language , voice_type, audio}: UseBotHandlerSendParams) => {
  const [customAudioTrack, setCustomAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [isMicOn, setIsMicOn] = useState(audio); 
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [shouldLeave, setShouldLeave] = useState(false);

  const callObject = useCallObject({});

  const leaveMeeting = async () => {
    try {
      await callObject?.leave();
      console.log('Left the meeting successfully.');
    } catch (error) {
      console.error('Error leaving the meeting:', error);
    }
  };

  useEffect(() => {
    if (shouldLeave) {
      leaveMeeting();
    }
  }, [shouldLeave]);

  const toggleCamera = () => {
    const newCameraState = !isCameraOn;
    callObject?.setLocalVideo(newCameraState);
    setIsCameraOn(newCameraState);
  };

  useEffect(() => {
    if (!callObject) return;

    const handleJoinedMeeting = () => {
      callObject.setLocalVideo(false); 
      setIsCameraOn(false);
    };

    callObject.on('joined-meeting', handleJoinedMeeting);
    return () => {
      callObject.off('joined-meeting', handleJoinedMeeting);
    };
  }, [callObject]);
  

  const toggleMic = () => {
    setIsMicOn((prevState) => {
      const newMicState = !prevState; // Toggle the mic state
      console.log("Toggling Mic: New State ->", newMicState);
      callObject?.setLocalAudio(newMicState); // Sync with callObject
      return newMicState; // Update the state
    });
  };

  useEffect(() => {
    console.log("Audio prop changed to:", audio);
    setIsMicOn(audio); 
    callObject?.setLocalAudio(audio); 
  }, [audio]); 

  useEffect(() => {
    if (!callObject) return;

    const handleParticipantUpdated = (event: any) => {
      if (event.participant.local) {
        console.log("Participant Audio State Updated:", event.participant.audio);
        setIsMicOn(event.participant.audio); 
      }
    };

    callObject.on('participant-updated', handleParticipantUpdated);

    return () => {
      callObject.off('participant-updated', handleParticipantUpdated); 
    };
  }, [callObject]);

  useEffect(() => {
    console.log("Mic state changed to:", isMicOn);
  }, [isMicOn]);


  useEffect(() => {
    console.log("isMicOn state changed:", isMicOn);
  }, [isMicOn]); 

  async function createAgoraCustomAudioTrack(track: MediaStreamTrack) {
    setCustomAudioTrack(
      AgoraRTC.createCustomAudioTrack({
        mediaStreamTrack: track,
      })
    );
  }

  const handleBotClick = async () => {
    try {
      const res = await axios.get(`${API_URL}/meeting/new-meeting`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status !== 200) {
        throw new Error(res.statusText || "Failed to create new meeting");
      }

      if (!callObject) {
        console.error("Call object is not available. Make sure it's properly initialized.");
        return;
      }

      const webCall = res.data;
      callObject.join({
        url: webCall.roomUrl,
        subscribeToTracksAutomatically: true,
        
      });

      console.log("Joined the meeting successfully");

      callObject.on("joined-meeting", (e) => {
        const participant_id = e.participants.local.user_id;
        const headers = { "Content-Type": "application/json" };
        const payload = {
          from_language: from_Language,
          to_language: to_language,
          room_url: webCall.roomUrl,
          participant_id,
          bot_type: "translation",
          male: voice_type,
          sub_to_local:true
        };

        axios
          .post(`${API_URL}/participant`, { id: participant_id }, { headers })
          .then(() =>
            axios
              .post(`${API_URL}/meeting/bot/join`, payload, { headers })
              .then(() => {
                console.log("Joined meeting event", e, participant_id);
              })
          )
          .catch((error:any) => {
            console.error(error);
          });
      });

      callObject.on("track-started", async (e) => {
        if (!e || !e.participant) return;
        if (e.participant?.local) return;
        if (e.track.kind !== "audio") return;

        await createAgoraCustomAudioTrack(e.track);
        callObject?.sendAppMessage("playable");
      });
    } catch (e) {
      console.log("Error in adding bot or daily call", e);
    }
  };

  async function replaceTrack(audioTrack: ILocalAudioTrack) {
    if (tracks && customAudioTrack) {
      await client.unpublish([audioTrack]);
      await client.publish([customAudioTrack]);
    }
  }

  useEffect(() => {
    if (tracks && customAudioTrack) {
      const audioTrack = tracks[0];
      audioTrack.stop();
      replaceTrack(audioTrack);
      console.log("Replaced Agora audio track with custom audio track");
    }

    return () => {
      customAudioTrack?.stop();
    };
  }, [tracks, customAudioTrack]);

  return { 
    handleBotClick ,
    toggleMic,
    setShouldLeave
  };
};
