import AgoraRTC, {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  useRemoteUsers,
  usePublish,
  useRTCClient,
  ILocalTrack,
  IAgoraRTCRemoteUser,
  UID,
  useClientEvent,
} from "agora-rtc-react";
import { useEffect, useState } from "react";
import Dubit from "../lib/dubit";
import "./App.css";

interface Transcript {
  participant_id: string;
  transcript?: string;
  timestamp: number;
  type: string;
}

export const Basics = () => {
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [appId, setAppId] = useState("");
  const [channel, setChannel] = useState("");
  const [token, setToken] = useState("");
  
  useJoin(
    { appid: appId, channel: channel, token: token ? token : null },
    calling
  );

  // Agora Client for publishing/unpublishing tracks
  const agoraClient = useRTCClient();

  //local user
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  usePublish([localCameraTrack, localMicrophoneTrack], true, agoraClient);
  //remote users
  const remoteUsers = useRemoteUsers();

  /*
   * dubit mic-side code
   *
   * create a new dubit client
   * pass local microphone track as inputTrack to dubit
   * translation bot will join and once the translated track is ready,
   * unpublish the local microphone track and publish the translated track
   *
   * */
  const [dubitMicClient, setDubitMicClient] = useState<Dubit | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  const handleTranscriptEvent = (event: any) => {
    console.log("event", event);
    const { type, participant_id, transcript, timestamp } = event.data;

    const newTranscript = {
      participant_id: `Participant ${participant_id}`,
      transcriptText: transcript,
      type,
      timestamp: timestamp,
    };
    setTranscripts((prevTranscripts) => [...prevTranscripts, newTranscript]);
  };

  const interceptMicAndTranslate = () => {
    if (dubitMicClient) {
      console.log("Translation bot is already active");
      return;
    }
    const DUBIT_TOKEN = import.meta.env.VITE_DUBIT_TOKEN as string;
    const fromLanguage = "en-IN";
    const toLanguage = "hi-IN";
    const voiceType = "female";

    const dubit = new Dubit({
      apiUrl: import.meta.env.VITE_DUBIT_API_URL as string,
      inputTrack: localMicrophoneTrack?.getMediaStreamTrack(),
      token: DUBIT_TOKEN,
      fromLanguage,
      toLanguage,
      voiceType,
    });

    setDubitMicClient(dubit);
    dubit.onCaptions(handleTranscriptEvent);

    // callback for unpublishing local microphone and publishing translated audio
    dubit.onTranslatedTrack((track: MediaStreamTrack) => {
      const translatedAudioTrack = AgoraRTC.createCustomAudioTrack({
        mediaStreamTrack: track,
      });
      agoraClient.unpublish(localMicrophoneTrack as unknown as ILocalTrack);
      agoraClient.publish([translatedAudioTrack as unknown as ILocalTrack]);
    });

    return () => {
      dubit.destroy();
    };
  };

  const stopLocalAudioTranslation = () => {
    if (dubitMicClient) {
      agoraClient.publish([localMicrophoneTrack as unknown as ILocalTrack]);
      dubitMicClient.destroy();
      setDubitMicClient(null);
    }
  };

  /*
   * dubit receiving-side code
   *
   * create a new dubit client
   * pass remote user's audioTrack as inputTrack to dubit
   * translation bot will join and once the translated track is ready,
   * create a local Agora track using the translated track and play it
   * stop the remote user's audioTrack
   *
   * */
  interface DubitRemoteUserClient {
    id: UID;
    client: Dubit;
  }
  const [dubitRemoteUserClients, setDubitRemoteUserClients] =
    useState<DubitRemoteUserClient[]>();
  const translateRemoteUserAudio = (user: IAgoraRTCRemoteUser) => {
    const existingTranslation = dubitRemoteUserClients?.find(
      (client) => client.id === user.uid
    );

    if (existingTranslation) {
      console.log("Translation already active for this user");
      return;
    }

    const DUBIT_TOKEN = import.meta.env.VITE_DUBIT_TOKEN as string;
    const fromLanguage = "en-IN";
    const toLanguage = "ko-KR";
    const voiceType = "male";
    const dubit = new Dubit({
      apiUrl: import.meta.env.VITE_DUBIT_API_URL as string,
      inputTrack: user.audioTrack?.getMediaStreamTrack(),
      token: DUBIT_TOKEN,
      fromLanguage,
      toLanguage,
      voiceType,
    });

    setDubitRemoteUserClients((prev) => {
      const newEntry = {
        id: user.uid,
        client: dubit,
        from_language_name: fromLanguage,
        to_language_name: toLanguage,
      };

      if (prev) {
        return [...prev, newEntry];
      } else {
        return [newEntry];
      }
    });

    dubit.onCaptions(handleTranscriptEvent);

    dubit.onTranslatedTrack((translatedTrack) => {
      AgoraRTC.createCustomAudioTrack({
        mediaStreamTrack: translatedTrack,
      }).play();
      user.audioTrack?.stop();
    });

    return () => {
      dubit.destroy();
    };
  };
  const stopRemoteUserTranslation = (user: IAgoraRTCRemoteUser) => {
    console.log("stopRemoteUserTranslation", user);
    user.audioTrack?.setVolume(100);
    user.audioTrack?.play();
    dubitRemoteUserClients
      ?.find((client) => client.id === user.uid)
      ?.client.destroy();
  };

  useEffect(() => {
    if (!dubitMicClient) return;

    /**
     * When microphone is enabled again:
     * Update Dubit's input track with the Agora microphone stream
     */
    if (micOn && localMicrophoneTrack) {
      dubitMicClient.updateInputTrack(
        localMicrophoneTrack.getMediaStreamTrack()
      );
    } else if (!micOn) {
      /**
       * When microphone is disabled:
       * - Clear Dubit's input track
       * - Stop publishing local audio to Agora if track exists
       */
      dubitMicClient.updateInputTrack(null);
      if (localMicrophoneTrack) {
        agoraClient.unpublish(localMicrophoneTrack as unknown as ILocalTrack);
      }
    }
  }, [micOn, localMicrophoneTrack]);

  const hasDubitClient = (userId: UID) => {
    return dubitRemoteUserClients?.some((client) => client.id === userId);
  };

  useClientEvent(
    agoraClient,
    "user-published",
    async (user: IAgoraRTCRemoteUser, mediaType) => {
      if (mediaType === "audio") {
        await agoraClient.subscribe(user, mediaType);

        if (hasDubitClient(user.uid)) {
          if (user.audioTrack) {
            /** Mute original audio since we'll play translated version */
            user.audioTrack.setVolume(0);

            const remoteClient = dubitRemoteUserClients?.find(
              (client) => client.id === user.uid
            )?.client;

            /**
             * If remote user has audio enabled:
             * Update Dubit client with their audio track for translation
             */

            if (user.hasAudio) {
              await remoteClient?.updateInputTrack(
                user.audioTrack?.getMediaStreamTrack()
              );
            } else {
              /**
               * If remote user disabled their audio:
               * Clear the input track to stop translation
               */
              await remoteClient?.updateInputTrack(null);
            }
          }
        }
      }
    }
  );

  useClientEvent(
    agoraClient,
    "user-unpublished",
    async (user: IAgoraRTCRemoteUser, mediaType) => {
      /**
       * Handle audio unpublish events for users with Dubit translation:
       * Occurs when remote user stops their audio stream
       */

      if (mediaType === "audio" && hasDubitClient(user.uid)) {
        const remoteClient = dubitRemoteUserClients?.find(
          (client) => client.id === user.uid
        )?.client;

        /** Clear the input track to stop translation when audio stream ends */
        await remoteClient?.updateInputTrack(null);
      }
    }
  );

  console.log("transcripts,", transcripts);

  return (
    <>
      <div className="room">
        {isConnected ? (
          <div className="user-list">
            <div className="user">
              <LocalUser
                cameraOn={cameraOn}
                micOn={micOn}
                audioTrack={localMicrophoneTrack}
                playAudio={false}
                videoTrack={localCameraTrack}
                cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
              >
                <samp className="user-name">You</samp>
              </LocalUser>
            </div>
            {remoteUsers.map((user) => (
              <div className="user" key={user.uid}>
                <RemoteUser
                  cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                  user={user}
                >
                  <samp className="user-name">{user.uid}</samp>
                  <button
                    style={{
                      backgroundColor: "green",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      translateRemoteUserAudio(user);
                    }}
                  >
                    Translate audio
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      stopRemoteUserTranslation(user);
                    }}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Stop translation
                  </button>
                </RemoteUser>
              </div>
            ))}
          </div>
        ) : (
          <div className="join-room">
            <label htmlFor="app-id">App ID:</label>
            <input
              onChange={(e) => setAppId(e.target.value)}
              placeholder=""
              value={appId}
              id="app-id"
            />
            <label htmlFor="channel">Channel:</label>
            <input
              onChange={(e) => setChannel(e.target.value)}
              placeholder=""
              value={channel}
              id="channel"
            />
            <label htmlFor="token">Token:</label>
            <input
              onChange={(e) => setToken(e.target.value)}
              placeholder=""
              value={token}
              id="token"
            />

            <button
              className={`join-channel ${!appId || !channel ? "disabled" : ""}`}
              disabled={!appId || !channel}
              onClick={(e) => {
                e.preventDefault();
                setCalling(true);
              }}
            >
              <span>Join Channel</span>
            </button>
          </div>
        )}
      </div>
      {isConnected && (
        <div className="control">
          <div className="left-control">
            <button className="btn" onClick={() => setMic((a) => !a)}>
              <i className={`i-microphone ${!micOn ? "off" : ""}`} />
            </button>
            <button className="btn" onClick={() => setCamera((a) => !a)}>
              <i className={`i-camera ${!cameraOn ? "off" : ""}`} />
            </button>
            {/* THIS BOT IS FOR SENDING TRANSLATED VOICE */}
            <button
              onClick={(e) => {
                e.preventDefault();
                interceptMicAndTranslate();
              }}
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "10px 20px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Intercept Mic and translate
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                stopLocalAudioTranslation();
              }}
              style={{
                backgroundColor: "red",
                color: "white",
                padding: "10px 20px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Stop translation
            </button>

            {/* THIS BOT IS USED FOR RECEIVING VOICE BOT */}
            {/* <div className={cx("bot-section")} onClick={handleMeetingJoin}>
              {isInitialized 
              ? "Bot Ready" : "Bot 2"}
            </div> */}
          </div>
          <button
            className={`btn btn-phone ${calling ? "btn-phone-active" : ""}`}
            onClick={() => setCalling((a) => !a)}
          >
            {calling ? (
              <i className="i-phone-hangup" />
            ) : (
              <i className="i-mdi-phone" />
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default Basics;
