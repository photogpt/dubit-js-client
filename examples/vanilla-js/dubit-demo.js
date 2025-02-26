const token = "sk_36de4f9a-3c1d-4ea5-9ddd-a791ee396692";

document.getElementById("startCall").addEventListener("click", startCall);
document.getElementById("addTranslator-1").addEventListener("click", () => addTranslator("1"));
document.getElementById("addTranslator-2").addEventListener("click", () => addTranslator("2"));

let dubitInstance = null;

// Start the call and initialize UI
async function startCall() {
  document.getElementById("startCall").disabled = true;
  const logDiv = document.getElementById("log");
  logDiv.innerHTML = "<p>Starting call...</p>";

  try {
    dubitInstance = await Dubit.createNewInstance({ token });

    window._dubit = dubitInstance;
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

// Add a translator with specific language pairs and devices
async function addTranslator(translatorId) {
  if (!dubitInstance) {
    console.error("Call not started yet.");
    return;
  }

  // Get UI elements
  const audioInputSelect = document.getElementById(`audioInput-${translatorId}`);
  const audioOutputSelect = document.getElementById(`audioOutput-${translatorId}`);
  const sourceLangSelect = document.getElementById(`sourceLang-${translatorId}`);
  const targetLangSelect = document.getElementById(`targetLang-${translatorId}`);
  const logDiv = document.getElementById("log");
  const interimCaptionsDiv = document.getElementById(`interimCaptions-${translatorId}`);

  // Get selected values
  const deviceId = audioInputSelect.value;
  const outputDeviceId = audioOutputSelect.value;
  const fromLang = sourceLangSelect.value;
  const toLang = targetLangSelect.value;

  logDiv.innerHTML += `<p>Adding translator ${translatorId}: ${fromLang} → ${toLang}</p>`;

  try {
    // exact avoids browser's fallback logic, we explicitly need certain device
    // if the device we want is not available then we should fail
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
    });
    const audioTrack = stream.getAudioTracks()[0];

    const translator = await dubitInstance.addTranslator({
      fromLang,
      toLang,
      voiceType: "female",
      inputAudioTrack: audioTrack,
      metadata: { demo: true },
    });

    translator.onTranslatedTrackReady((track) => {
      logDiv.innerHTML += `<p>Translated track ready for - ${translatorId}! Routing to: ${outputDeviceId}</p>`;

      track.enabled = true;
      const elementId = `audio-${translatorId}-${translator.getInstanceId()}`;

      // NOTE: it's important to use dubit's provided function for audio routing
      // to avoid WebRTC track mixing issue by using the WebAudio API
      Dubit.routeTrackToDevice(track, outputDeviceId, elementId);

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
        const option1 = new Option(device.label || `Mic ${audioInputSelect1.length + 1}`, device.deviceId);
        const option2 = new Option(device.label || `Mic ${audioInputSelect2.length + 1}`, device.deviceId);
        audioInputSelect1.appendChild(option1);
        audioInputSelect2.appendChild(option2);
      }
      if (device.kind === "audiooutput") {
        const option1 = new Option(device.label || `Speaker ${audioOutputSelect1.length + 1}`, device.deviceId);
        const option2 = new Option(device.label || `Speaker ${audioOutputSelect2.length + 1}`, device.deviceId);
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

    // Set default language values
    sourceLangSelect1.value = "hi";
    targetLangSelect1.value = "en-US";
    sourceLangSelect2.value = "en-US";
    targetLangSelect2.value = "hi-IN";
  } catch (err) {
    console.error("Error fetching supported languages:", err);
  }
}
