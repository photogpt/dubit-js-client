const token = "sk_36de4f9a-3c1d-4ea5-9ddd-a791ee396692";

document.getElementById("startCall").addEventListener("click", startCall);
document
  .getElementById("addTranslator-1")
  .addEventListener("click", addTranslator1);
document
  .getElementById("addTranslator-2")
  .addEventListener("click", addTranslator2);

let dubitInstance = null; // Global instance

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

    /**
     * Handles the translatedTrackReady event from the Dubit translator
     */
    translator.onTranslatedTrackReady((track) => {
      logDiv.innerHTML += `<p>Translated track ready for translator ${translatorId}! Routing to output device: ${outputDeviceId}</p>`;
      // Ensure track is enabled
      track.enabled = true;
      console.log(`Track enabled state (${translatorId}):`, track.enabled);

      // Create a unique ID for this routing
      const elementId = `audio-${translatorId}-${translator.getInstanceId()}`;

      // Route the track to the selected output device
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
