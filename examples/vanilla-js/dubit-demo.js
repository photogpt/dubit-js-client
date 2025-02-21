let dubitInstance;
const token = "sk_36de4f9a-3c1d-4ea5-9ddd-a791ee396692";

document.getElementById("startCall").addEventListener("click", startCall);
document
  .getElementById("addTranslator-1")
  .addEventListener("click", addTranslator1);
document
  .getElementById("addTranslator-2")
  .addEventListener("click", addTranslator2);

async function startCall() {
  document.getElementById("startCall").disabled = true;
  document.getElementById("log").innerHTML = "<p>Starting call...</p>";

  try {
    dubitInstance = await Dubit.createNewInstance({ token });
    document.getElementById("log").innerHTML += "<p>Call started!</p>";
    document.getElementById("controls-1").style.display = "flex";
    document.getElementById("controls-2").style.display = "flex";

    await populateAudioDevices();
    populateLanguages();
  } catch (err) {
    console.error("Error starting call:", err);
    document.getElementById("log").innerHTML +=
      `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

async function addTranslator1() {
  if (!dubitInstance) {
    console.error("Call not started yet.");
    return;
  }

  const audioInputSelect = document.getElementById("audioInput-1");
  const audioOutputSelect = document.getElementById("audioOutput-1");
  const sourceLangSelect = document.getElementById("sourceLang-1");
  const targetLangSelect = document.getElementById("targetLang-1");
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
      outputDeviceId: outputDeviceId,
    });

    translator.onTranslatedTrackReady((track) => {
      logDiv.innerHTML += `<p>Translated track ready! Routing to output device: ${outputDeviceId}</p>`;
      const audioElement = document.createElement("audio");
      audioElement.autoplay = true;
      audioElement.muted = false;
      audioElement.srcObject = new MediaStream([track]);
      audioElement
        .play()
        .then(() => console.log("Audio started playing"))
        .catch((error) => console.error("Error playing audio:", error));
      audioElement
        .setSinkId(outputDeviceId)
        .then(() => console.log("Output device set:", outputDeviceId))
        .catch((err) => console.error("Error setting output device:", err));
      console.log(track);

      document.body.appendChild(audioElement);
    });

    const interimCaptionsDiv = document.getElementById("interimCaptions-1");
    translator.onCaptions((caption) => {
      if (caption.type != "user-interim-transcript") {
        if (caption.transcript)
          logDiv.innerHTML += `<p>Caption: ${caption.transcript}</p>`;
      } else {
        interimCaptionsDiv.innerHTML = `<p>Live caption: ${caption.transcript}</p>`;
      }
    });
  } catch (err) {
    console.error("Error adding translator:", err);
    logDiv.innerHTML += `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

async function addTranslator2() {
  if (!dubitInstance) {
    console.error("Call not started yet.");
    return;
  }

  const audioInputSelect = document.getElementById("audioInput-2");
  const audioOutputSelect = document.getElementById("audioOutput-2");
  const sourceLangSelect = document.getElementById("sourceLang-2");
  const targetLangSelect = document.getElementById("targetLang-2");
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
      outputDeviceId: outputDeviceId,
    });

    translator.onTranslatedTrackReady((track) => {
      logDiv.innerHTML += `<p>Translated track ready! Routing to output device: ${outputDeviceId}</p>`;
      const audioElement = document.createElement("audio");
      audioElement.autoplay = true;
      audioElement.muted = false;
      audioElement.srcObject = new MediaStream([track]);
      audioElement
        .play()
        .then(() => console.log("Audio started playing"))
        .catch((error) => console.error("Error playing audio:", error));
      audioElement
        .setSinkId(outputDeviceId)
        .then(() => console.log("Output device set:", outputDeviceId))
        .catch((err) => console.error("Error setting output device:", err));
      // Object.values(document.getElementsByTagName("audio"))
      //   .filter((x) => x.sinkId != outputDeviceId)
      //   .map((x) => {
      //     x.setSinkId(x.sinkId)
      //       .then(() =>
      //         console.log(
      //           "Reset Output device for 1st audio player to:",
      //           x.sinkId,
      //         ),
      //       )
      //       .catch((err) => console.error("Error setting output device:", err));
      //   });

      document.body.appendChild(audioElement);
    });

    const interimCaptionsDiv = document.getElementById("interimCaptions-2");
    translator.onCaptions((caption) => {
      if (caption.type != "user-interim-transcript") {
        if (caption.transcript)
          logDiv.innerHTML += `<p>Caption: ${caption.transcript}</p>`;
      } else {
        interimCaptionsDiv.innerHTML = `<p>Live caption: ${caption.transcript}</p>`;
      }
    });
  } catch (err) {
    console.error("Error adding translator:", err);
    logDiv.innerHTML += `<p style="color:red;">Error: ${err.message}</p>`;
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
  } catch (err) {
    console.error("Error fetching supported languages:", err);
  }
}
