const token = "sk_36de4f9a-3c1d-4ea5-9ddd-a791ee396692";

document.getElementById("startCall").addEventListener("click", startCall);
document
  .getElementById("addTranslator-1")
  .addEventListener("click", addTranslator1);
document
  .getElementById("addTranslator-2")
  .addEventListener("click", addTranslator2);

let dubitInstance = null; // Global instance

// Global AudioContext cache to ensure we have only one per device
const audioContexts = new Map();

function routeTrackToDevice(track, outputDeviceId, elementId) {
  console.log(`Routing track ${track.id} to device ${outputDeviceId}`);

  // Create or get AudioContext for this output device
  let audioContext;
  if (audioContexts.has(outputDeviceId)) {
    audioContext = audioContexts.get(outputDeviceId);
    console.log(`Reusing existing AudioContext for device ${outputDeviceId}`);
  } else {
    audioContext = new AudioContext({
      // Set the sinkId if the browser supports it at creation time
      sinkId: outputDeviceId,
    });
    audioContexts.set(outputDeviceId, audioContext);
    console.log(`Created new AudioContext for device ${outputDeviceId}`);
  }

  // Resume AudioContext if suspended (autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext
      .resume()
      .then(() =>
        console.log(`AudioContext resumed for device ${outputDeviceId}`),
      )
      .catch((err) => console.error(`Failed to resume AudioContext: ${err}`));
  }

  // Create a MediaStream with the track
  const mediaStream = new MediaStream([track]);

  // Create a MediaStreamAudioSourceNode
  const sourceNode = audioContext.createMediaStreamSource(mediaStream);
  console.log(`Created source node for track ${track.id}`);

  // Create destination node
  const destinationNode = audioContext.destination;

  // Connect source to destination
  sourceNode.connect(destinationNode);
  console.log(
    `Connected track ${track.id} to destination for device ${outputDeviceId}`,
  );

  // If the AudioContext API supports setSinkId directly, use it
  if ("setSinkId" in AudioContext.prototype) {
    audioContext
      .setSinkId(outputDeviceId)
      .then(() =>
        console.log(`Set sinkId ${outputDeviceId} on AudioContext directly`),
      )
      .catch((err) =>
        console.error(`Failed to set sinkId on AudioContext: ${err}`),
      );
  }

  // Create a hidden audio element that will pull from the WebRTC stream
  // This is necessary to get the WebRTC subsystem to deliver the audio to WebAudio
  const pullElement = document.createElement("audio");
  pullElement.id = `pull-${elementId}`;
  pullElement.srcObject = mediaStream;
  pullElement.style.display = "none";
  pullElement.muted = true; // Don't actually play through the default device
  document.body.appendChild(pullElement);

  // Start pulling audio through the element
  pullElement
    .play()
    .then(() => console.log(`Pull element started for track ${track.id}`))
    .catch((err) => console.error(`Failed to start pull element: ${err}`));

  // Return an object with cleanup method and context
  return {
    context: audioContext,
    sourceNode: sourceNode,
    pullElement: pullElement,
    stop: function () {
      // Disconnect and clean up resources
      sourceNode.disconnect();
      document.body.removeChild(pullElement);
      console.log(
        `Stopped routing track ${track.id} to device ${outputDeviceId}`,
      );
    },
  };
}

async function startCall() {
  document.getElementById("startCall").disabled = true;
  const logDiv = document.getElementById("log");
  logDiv.innerHTML = "<p>Starting call...</p>";

  try {
    // Assume 'token' is defined globally.
    dubitInstance = await Dubit.createNewInstance({ token });
    logDiv.innerHTML += "<p>Call started!</p>";
    document.getElementById("controls-1").style.display = "flex";
    document.getElementById("controls-2").style.display = "flex";

    await populateAudioDevices();
    populateLanguages();
  } catch (err) {
    console.error("Error starting call:", err);
    logDiv.innerHTML += `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

async function addTranslator1() {
  await addTranslator("1");
}

async function addTranslator2() {
  await addTranslator("2");
}

// Keep track of active audio routings
const activeAudioRoutings = new Map();

async function addTranslator(translatorId) {
  if (!dubitInstance) {
    console.error("Call not started yet.");
    return;
  }

  const audioInputSelect = document.getElementById(
    `audioInput-${translatorId}`,
  );
  const audioOutputSelect = document.getElementById(
    `audioOutput-${translatorId}`,
  );
  const sourceLangSelect = document.getElementById(
    `sourceLang-${translatorId}`,
  );
  const targetLangSelect = document.getElementById(
    `targetLang-${translatorId}`,
  );
  const logDiv = document.getElementById("log");
  const interimCaptionsDiv = document.getElementById(
    `interimCaptions-${translatorId}`,
  );

  const deviceId = audioInputSelect.value;
  const outputDeviceId = audioOutputSelect.value;
  const fromLang = sourceLangSelect.value;
  const toLang = targetLangSelect.value;

  logDiv.innerHTML += `<p>Adding translator ${translatorId}: ${fromLang} → ${toLang}</p>`;

  try {
    // Get the audio track from the selected input device.
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
    });
    const audioTrack = stream.getAudioTracks()[0];
    console.log("Obtained audioTrack for translator", translatorId, audioTrack);

    const translator = await dubitInstance.addTranslator({
      fromLang,
      toLang,
      voiceType: "female",
      inputAudioTrack: audioTrack,
      metadata: { demo: true },
    });

    translator.onTranslatedTrackReady((track) => {
      logDiv.innerHTML += `<p>Translated track ready for translator ${translatorId}! Routing to output device: ${outputDeviceId}</p>`;

      // Ensure track is enabled
      track.enabled = true;
      console.log(`Track enabled state (${translatorId}):`, track.enabled);

      const elementId = `audio-${translatorId}-${translator.getInstanceId()}`;

      // Stop any existing routing for this translator
      if (activeAudioRoutings.has(translatorId)) {
        activeAudioRoutings.get(translatorId).stop();
        activeAudioRoutings.delete(translatorId);
      }

      // Create new routing
      const audioRouting = routeTrackToDevice(track, outputDeviceId, elementId);
      activeAudioRoutings.set(translatorId, audioRouting);

      logDiv.innerHTML += `<p>Audio routing established for translator ${translatorId} to device ${outputDeviceId}</p>`;
    });

    translator.onCaptions((caption) => {
      if (caption.type !== "user-interim-transcript") {
        if (caption.transcript)
          logDiv.innerHTML += `<p>Caption (Translator ${translatorId}): ${caption.transcript}</p>`;
      } else {
        interimCaptionsDiv.innerHTML = `<p>Live caption (Translator ${translatorId}): ${caption.transcript}</p>`;
      }
    });
  } catch (err) {
    console.error(`Error adding translator ${translatorId}:`, err);
    logDiv.innerHTML += `<p style="color:red;">Error (Translator ${translatorId}): ${err.message}</p>`;
  }
}

async function populateAudioDevices() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();

    const audioInputSelect1 = document.getElementById("audioInput-1");
    const audioInputSelect2 = document.getElementById("audioInput-2");
    const audioOutputSelect1 = document.getElementById("audioOutput-1");
    const audioOutputSelect2 = document.getElementById("audioOutput-2");

    audioInputSelect1.innerHTML = "";
    audioInputSelect2.innerHTML = "";
    audioOutputSelect1.innerHTML = "";
    audioOutputSelect2.innerHTML = "";

    devices.forEach((device) => {
      if (device.kind === "audioinput") {
        const option1 = new Option(
          device.label || `Mic ${audioInputSelect1.length + 1}`,
          device.deviceId,
        );
        const option2 = new Option(
          device.label || `Mic ${audioInputSelect2.length + 1}`,
          device.deviceId,
        );
        audioInputSelect1.appendChild(option1);
        audioInputSelect2.appendChild(option2);
      }
      if (device.kind === "audiooutput") {
        const option1 = new Option(
          device.label || `Speaker ${audioOutputSelect1.length + 1}`,
          device.deviceId,
        );
        const option2 = new Option(
          device.label || `Speaker ${audioOutputSelect2.length + 1}`,
          device.deviceId,
        );
        audioOutputSelect1.appendChild(option1);
        audioOutputSelect2.appendChild(option2);
      }
    });
  } catch (err) {
    console.error("Error enumerating audio devices:", err);
  }
}

function populateLanguages() {
  const sourceLangSelect1 = document.getElementById("sourceLang-1");
  const sourceLangSelect2 = document.getElementById("sourceLang-2");
  const targetLangSelect1 = document.getElementById("targetLang-1");
  const targetLangSelect2 = document.getElementById("targetLang-2");

  try {
    const fromLanguages = Dubit.getSupportedFromLanguages();
    const toLanguages = Dubit.getSupportedToLanguages();
    sourceLangSelect1.innerHTML = "";
    sourceLangSelect2.innerHTML = "";
    targetLangSelect1.innerHTML = "";
    targetLangSelect2.innerHTML = "";

    fromLanguages.forEach((lang) => {
      sourceLangSelect1.appendChild(new Option(lang.label, lang.langCode));
      sourceLangSelect2.appendChild(new Option(lang.label, lang.langCode));
    });
    toLanguages.forEach((lang) => {
      targetLangSelect1.appendChild(new Option(lang.label, lang.langCode));
      targetLangSelect2.appendChild(new Option(lang.label, lang.langCode));
    });
    // Set default language values.
    sourceLangSelect1.value = "hi";
    targetLangSelect1.value = "en-US";
    sourceLangSelect2.value = "en-US";
    targetLangSelect2.value = "hi-IN";
  } catch (err) {
    console.error("Error fetching supported languages:", err);
  }
}

// Initialize audio on first user interaction
function initializeAudio() {
  // Create a short silent audio context to unblock audio
  const silentContext = new (window.AudioContext ||
    window.webkitAudioContext)();
  silentContext.resume().then(() => {
    console.log("Audio context initialized and resumed");
    setTimeout(() => silentContext.close(), 1000);
  });

  // Remove the listener after first interaction
  document.removeEventListener("click", initializeAudio);
  document.removeEventListener("touchstart", initializeAudio);
}

// Set up listeners for user interaction
document.addEventListener("click", initializeAudio);
document.addEventListener("touchstart", initializeAudio);
