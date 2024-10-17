import { useState, useEffect} from "react";
import axios from "axios";
// import {axiosInstance} from "../../lib/axiosInstance"; 

const API_URL = "https://test-api.dubit.live"

const useBotAudioHandling = (client: any, receivingCallObject: any, token:any, from_Language : any, to_language : any, voice_type:any) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false); 
  const [isCameraOn, setIsCameraOn] = useState(false);

  const toggleCamera = () => {
    const newCameraState = !isCameraOn;
    receivingCallObject?.setLocalVideo(newCameraState);
    setIsCameraOn(newCameraState);
  };

  useEffect(() => {
    if (!receivingCallObject) return;

    const handleJoinedMeeting = () => {
      receivingCallObject.setLocalVideo(false); 
      setIsCameraOn(false);
    };

    receivingCallObject.on('joined-meeting', handleJoinedMeeting);
    return () => {
      receivingCallObject.off('joined-meeting', handleJoinedMeeting);
    };
  }, [receivingCallObject]);

  
  const toggleMic = () => {
    setIsMicOn((prevState) => {
      const newMicState = !prevState; 
      console.log("Toggling Mic: New State ->", newMicState);
      receivingCallObject?.setLocalAudio(newMicState); 
      return newMicState;
    });
  };

  useEffect(() => {
    if (!receivingCallObject) return;

    const handleParticipantUpdated = (event: any) => {
      if (event.participant.local) {
        console.log("Participant Audio State Updated:", event.participant.audio);
        setIsMicOn(event.participant.audio); 
      }
    };

    receivingCallObject.on('participant-updated', handleParticipantUpdated);

    return () => {
      receivingCallObject.off('participant-updated', handleParticipantUpdated); 
    };
  }, [receivingCallObject]);

  const createDailyCustomAudioTrack = async (session_id: string, track: any) => {

    let mediaStreamTrack = track?.getMediaStreamTrack();
    console.log("track", track);

    const customDailyTrack = await receivingCallObject?.startCustomTrack({
      track: mediaStreamTrack,
      trackName: "received track 2",
    });

    receivingCallObject?.updateParticipant(session_id, {
      setSubscribedTracks: {
        custom: {
          customDailyTrack: true,
        },
      },
    });
  };

  const startPlayer = async (player: HTMLAudioElement, track: any) => {
    player.muted = false;
    player.autoplay = true;
    if (track != null) {
      player.srcObject = new MediaStream([track]);
      await player.play();
    }
  };

  const buildAudioPlayer = async (track: any, participantId: string) => {
    const player = document.createElement("audio");
    player.dataset.participantId = participantId;
    document.body.appendChild(player);
    await startPlayer(player, track);
    return player;
  };
  console.log("clientclientclient", client)

  const handleMeetingJoin = async () => {
    try {
      const res = await axios.get(`${API_URL}/meeting/new-meeting`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status !== 200) {
        throw new Error(res.statusText || "Failed to create receiving audio meeting");
      }

      const webCall = res.data;

      receivingCallObject?.join({
        url: webCall.roomUrl,
        subscribeToTracksAutomatically: false,
      });

      const localParticipant = receivingCallObject?.participants()?.local;
      if (localParticipant) {
        localParticipant.tracks.audio.subscribed = false;
      }
      
      receivingCallObject?.on("joined-meeting", async (e: any) => {
        const participant_id = e.participants.local.user_id;
        const headers = { "Content-Type": "application/json" };
        const payload = {
          from_language: from_Language,
          to_language: to_language,
          room_url: webCall.roomUrl,
          participant_id,
          bot_type: "translation",
          male: voice_type,
          sub_to_local : false
        };

        await axios.post(`${API_URL}/participant`, { id: participant_id }, { headers });
        await axios.post(`${API_URL}/meeting/bot/join`, payload, { headers });
        console.log("Joined meeting event", e, participant_id);
      });


      receivingCallObject?.on("participant-joined", async (e: any) => {
        if (!e || !e.participant || e.participant.local) return;

        console.log("clientclientclient", client)

        if (e.participant.user_name.includes("Translat")) {
          await createDailyCustomAudioTrack(e.participant.session_id, client.remoteUsers[0].audioTrack );
        }
        receivingCallObject?.sendAppMessage("playable");
      });

      receivingCallObject?.on("track-started", async (e: any) => {
        if (!e || !e.participant || e.participant.local || e.track.kind !== "audio") return;
        await buildAudioPlayer(e.track, e.participant.session_id);
        if (e.participant.user_name === "Dubit") {
          receivingCallObject?.sendAppMessage("playable");
        }
      });

      setIsInitialized(true);
    } catch (e) {
      console.error("Error occurred in receiving call", e);
    }
  };

  return {
    handleMeetingJoin,
    isInitialized,
  };
};

export default useBotAudioHandling;
