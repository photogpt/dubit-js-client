import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AgoraRTCProvider client={client}>
      <App />
    </AgoraRTCProvider>
  </StrictMode>,
)

// const appId = "442969e38bbb4ddf80bf566273325d3c"; 
// const token = "007eJxTYLgo0Me/ZX/q+T5Wa4naCWYruG/Zsf9Zc7h6af5unXpJHRkFBhMTI0szy1Rji6SkJJOUlDQLg6Q0UzMzI3NjYyPTFONklxzB9IZARoYzLwRYGRkgEMRnZUgpTcosYWAAAMtMHXM="; // Replace with your token
// const channelName = "dubit";
