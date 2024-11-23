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
} from "agora-rtc-react";
import { useCallback, useState } from "react";
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
    calling,
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
    console.log("event" , event)
    const { type, participant_id, transcript, timestamp } = event.data;

    const newTranscript = {
      participant_id: `Participant ${participant_id}`,
      transcriptText: transcript,
      type,
      timestamp: timestamp
    };    
    setTranscripts((prevTranscripts) => [...prevTranscripts, newTranscript]);
  };

  const interceptMicAndTranslate = () => {
    const DUBIT_TOKEN = "sk_027e80bf-d4f7-408d-8d86-2fbde6beffd7";
    const fromLanguage = "en-IN";
    const toLanguage = "hi-IN";
    const voiceType = "female";
    const dubit = new Dubit({
      apiUrl: "https://test-api.dubit.live",
      useMic: false,
      inputTrack: localMicrophoneTrack?.getMediaStreamTrack(),
      token: "sk_027e80bf-d4f7-408d-8d86-2fbde6beffd7",
      fromLanguage,
      toLanguage,
      voiceType,
    });
    setDubitMicClient(dubit);

    dubit.getCaptions(handleTranscriptEvent);

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
    const DUBIT_TOKEN = "sk_027e80bf-d4f7-408d-8d86-2fbde6beffd7";
    const fromLanguage = "hi-IN";
    const toLanguage = "en-US";
    const voiceType = "male";
    const dubit = new Dubit({
      apiUrl: "https://test-api.dubit.live",
      useMic: false,
      inputTrack: user.audioTrack?.getMediaStreamTrack(),
      token: DUBIT_TOKEN,
      fromLanguage,
      toLanguage,
      voiceType,
    });
    setDubitRemoteUserClients((prev) => {
      if (prev) {
        prev.push({ id: user.uid, client: dubit });
      } else {
        return [{ id: user.uid, client: dubit }];
      }
    });

    dubit.getCaptions(handleTranscriptEvent);

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
    user.audioTrack?.play();
    dubitRemoteUserClients
      ?.find((client) => client.id === user.uid)
      ?.client.destroy();
  };

  console.log("transcripts,", transcripts)

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