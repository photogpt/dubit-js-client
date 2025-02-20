let dubitInstance;
const token = "sk_36de4f9a-3c1d-4ea5-9ddd-a791ee396692";

async function populateAudioDevices() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log("Devices:", devices);

    const audioInputSelect = document.getElementById("audioInput");
    const audioOutputSelect = document.getElementById("audioOutput");

    audioInputSelect.innerHTML = "";
    audioOutputSelect.innerHTML = "";

    devices.forEach((device) => {
      if (device.kind === "audioinput") {
        const option = new Option(
          device.label || `Mic ${audioInputSelect.length + 1}`,
          device.deviceId,
        );
        audioInputSelect.appendChild(option);
      }
      if (device.kind === "audiooutput") {
        const option = new Option(
          device.label || `Speaker ${audioOutputSelect.length + 1}`,
          device.deviceId,
        );
        audioOutputSelect.appendChild(option);
      }
    });
  } catch (err) {
    console.error("Error enumerating audio devices:", err);
  }
}

async function populateLanguages() {
  const sourceLangSelect = document.getElementById("sourceLang");
  const targetLangSelect = document.getElementById("targetLang");

  try {
    const languages = await Dubit.getSupportedFromLanguages();
    sourceLangSelect.innerHTML = "";
    targetLangSelect.innerHTML = "";

    languages.forEach((lang) => {
      sourceLangSelect.appendChild(new Option(lang.label, lang.langCode));
      targetLangSelect.appendChild(new Option(lang.label, lang.langCode));
    });
  } catch (err) {
    console.error("Error fetching supported languages:", err);
  }
}

async function startCall() {
  document.getElementById("startCall").disabled = true;
  document.getElementById("log").innerHTML = "<p>Starting call...</p>";

  try {
    dubitInstance = await Dubit.createNewInstance({ token });
    document.getElementById("log").innerHTML += "<p>Call started!</p>";
    document.getElementById("controls").style.display = "block";

    await populateAudioDevices();
    await populateLanguages();
  } catch (err) {
    console.error("Error starting call:", err);
    document.getElementById("log").innerHTML +=
      `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

async function addTranslator() {
  if (!dubitInstance) {
    console.error("Call not started yet.");
    return;
  }

  const audioInputSelect = document.getElementById("audioInput");
  const audioOutputSelect = document.getElementById("audioOutput");
  const sourceLangSelect = document.getElementById("sourceLang");
  const targetLangSelect = document.getElementById("targetLang");
  const logDiv = document.getElementById("log");

  const deviceId = audioInputSelect.value;
  const outputDeviceId = audioOutputSelect.value;
  const fromLang = sourceLangSelect.value;
  const toLang = targetLangSelect.value;

  logDiv.innerHTML += `<p>Adding translator: ${fromLang} → ${toLang}</p>`;

  try {
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
      logDiv.innerHTML += `<p>Translated track ready! Routing to output device...</p>`;
      const audioElement = document.createElement("audio");
      audioElement.controls = true;
      audioElement.srcObject = new MediaStream([track]);
      audioElement
        .setSinkId(outputDeviceId)
        .catch((err) => console.error("Error setting output device:", err));
      audioElement.play();
      logDiv.appendChild(audioElement);
    });

    translator.onCaptions((caption) => {
      logDiv.innerHTML += `<p>Caption: ${caption.transcript}</p>`;
    });
  } catch (err) {
    console.error("Error adding translator:", err);
    logDiv.innerHTML += `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

document.getElementById("startCall").addEventListener("click", startCall);
document
  .getElementById("addTranslator")
  .addEventListener("click", addTranslator);
