// const appId = "442969e38bbb4ddf80bf566273325d3c"; 
// const token = "007eJxTYLgo0Me/ZX/q+T5Wa4naCWYruG/Zsf9Zc7h6af5unXpJHRkFBhMTI0szy1Rji6SkJJOUlDQLg6Q0UzMzI3NjYyPTFONklxzB9IZARoYzLwRYGRkgEMRnZUgpTcosYWAAAMtMHXM="; // Replace with your token
// const channelName = "dubit";

import useBotAudioHandling from './useBotAudioHandling.ts'
import {useBotHandlerSend} from './useBotHandlerSend.ts'

import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import { useState } from "react";

import "./App.css";

export const Basics = () => {
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [appId, setAppId] = useState(""); 
  const [channel, setChannel] = useState(""); 
  const [token, setToken] = useState("");

  useJoin({appid: appId, channel: channel, token: token ? token : null}, calling);
  //local user
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  usePublish([localMicrophoneTrack, localCameraTrack]);
  //remote users
  const remoteUsers = useRemoteUsers();

  const DUBIT_TOKEN = "sk_481ce9fb-657e-420e-a392-27b1bd886584";      
  const from_Language = "en-IN"
  const to_language = "hi-IN"
  const voice_type = false

    //THIS IS USED FOR SENDING TRANSLATED VOICE  

    // const { handleBotClick , toggleMic, setShouldLeave} = useBotHandlerSend({
    //     tracks,
    //     client,
    //     DUBIT_TOKEN,
    //     from_Language,
    //     to_language,
    //     voice_type,
    //     audio: controls.audio
    //   } as UseBotHandlerSendParams);

    //THIS IS USED FOR RECEIVING TRANSLATED VOICE

    // const receivingCallObject = useCallObject({}); 
    // const { handleMeetingJoin, isInitialized } = useBotAudioHandling(client, receivingCallObject, DUBIT_TOKEN, from_Language, to_language, voice_type);
    
    // useEffect(()=>{
    //     console.log("clientclientclient", client)
    // }, [client])

            
  return (
    <>
      <div className="room">
        {isConnected ? (
          <div className="user-list">
            <div className="user">
              <LocalUser
                audioTrack={localMicrophoneTrack}
                cameraOn={cameraOn}
                micOn={micOn}
                videoTrack={localCameraTrack}
                cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
              >
                <samp className="user-name">You</samp>
              </LocalUser>
            </div>
            {remoteUsers.map((user) => (
              <div className="user" key={user.uid}>
                <RemoteUser cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg" user={user}>
                  <samp className="user-name">{user.uid}</samp>
                </RemoteUser>
              </div>
            ))}
          </div>
        ) : (
          <div className="join-room">
            <input
              onChange={e => setAppId(e.target.value)}
              placeholder="<Your app ID>"
              value={appId}
            />
            <input
              onChange={e => setChannel(e.target.value)}
              placeholder="<Your channel Name>"
              value={channel}
            />
            <input
              onChange={e => setToken(e.target.value)}
              placeholder="<Your token>"
              value={token}
            />

            <button
              className={`join-channel ${!appId || !channel ? "disabled" : ""}`}
              disabled={!appId || !channel}
              onClick={() => setCalling(true)}
            >
              <span>Join Channel</span>
            </button>
          </div>
        )}
      </div>
      {isConnected && (
        <div className="control">
          <div className="left-control">
            <button className="btn" onClick={() => setMic(a => !a)}>
              <i className={`i-microphone ${!micOn ? "off" : ""}`} />
            </button>
            <button className="btn" onClick={() => setCamera(a => !a)}>
              <i className={`i-camera ${!cameraOn ? "off" : ""}`} />
            </button>
            {/* THIS BOT IS FOR SENDING TRANSLATED VOICE */}
            {/* <div onClick = {handleBotClick} >Bot 1</div> */}

            {/* THIS BOT IS USED FOR RECEIVING VOICE BOT */}
            {/* <div className={cx("bot-section")} onClick={handleMeetingJoin}>
              {isInitialized 
              ? "Bot Ready" : "Bot 2"}
            </div> */}

          </div>
          <button
            className={`btn btn-phone ${calling ? "btn-phone-active" : ""}`}
            onClick={() => setCalling(a => !a)}
          >
            {calling ? <i className="i-phone-hangup" /> : <i className="i-mdi-phone" />}
          </button>
        </div>
      )}
    </>
  );
};

export default Basics;
