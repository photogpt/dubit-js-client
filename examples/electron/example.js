import dubit from "@taic/dubit";

async function runVirtualDeviceTranslationExample() {
  try {
    const token = "YOUR_API_KEY";
    const dubitInstance = await dubit.create({ token });

    // Enumerate devices to find our virtual devices.
    const devices = await navigator.mediaDevices.enumerateDevices();
    // Find the physical system mic (for Translator A)
    const systemMic = devices.find(
      (device) =>
        device.kind === "audioinput" && device.label.includes("System Mic"),
    );
    // Find the virtual input for remote audio (for Translator B)
    const dubitSpeakerDevice = devices.find(
      (device) =>
        device.kind === "audioinput" && device.label.includes("Dubit Speaker"),
    );
    // Find the virtual output for Translator A's translated audio.
    const dubitMicDevice = devices.find(
      (device) =>
        device.kind === "audiooutput" && device.label.includes("Dubit Mic"),
    );
    if (!systemMic) {
      throw new Error("System Mic not found");
    }
    if (!dubitSpeakerDevice) {
      throw new Error("Dubit Speaker input not found");
    }
    if (!dubitMicDevice) {
      throw new Error("Dubit Mic output not found");
    }

    // Get media stream from the system mic for Translator A.
    const systemMicStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: systemMic.deviceId } },
    });
    const systemMicTrack = systemMicStream.getAudioTracks()[0];

    // Translator A: from English to Spanish, female voice.
    const translatorA = await dubitInstance.addTranslator({
      fromLang: "en",
      toLang: "es",
      voiceType: "female",
      inputAudioTrack: systemMicTrack,
      metadata: { translatorName: "Translator A" },
    });

    translatorA.onTranslatedTrackReady((track) => {
      console.log("Translator A output track ready:", track);
      // Create an audio element and set its sink to the virtual "Dubit Mic".
      const audioElementA = new Audio();
      audioElementA.srcObject = new MediaStream([track]);
      // Use setSinkId to direct the output to the virtual device.
      if (typeof audioElementA.setSinkId === "function") {
        audioElementA
          .setSinkId(dubitMicDevice.deviceId)
          .then(() => console.log("Translator A audio routed to Dubit Mic"))
          .catch((err) =>
            console.error("Error setting sink ID for Translator A:", err),
          );
      }
      audioElementA
        .play()
        .catch((err) => console.error("Play error for Translator A:", err));
    });

    translatorA.onCaptions((caption) => {
      console.log("Translator A caption event:", caption);
    });

    // Get media stream from the virtual "Dubit Speaker" for Translator B.
    const dubitSpeakerStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: dubitSpeakerDevice.deviceId } },
    });
    const dubitSpeakerTrack = dubitSpeakerStream.getAudioTracks()[0];

    // Translator B: from Spanish to English, male voice.
    const translatorB = await dubitInstance.addTranslator({
      fromLang: "es",
      toLang: "en",
      voiceType: "male",
      inputAudioTrack: dubitSpeakerTrack,
      metadata: { translatorName: "Translator B" },
    });

    translatorB.onTranslatedTrackReady((track) => {
      console.log("Translator B output track ready:", track);
      // Create an audio element for the system speaker (default output).
      const audioElementB = new Audio();
      audioElementB.srcObject = new MediaStream([track]);
      audioElementB
        .play()
        .catch((err) => console.error("Play error for Translator B:", err));
    });

    translatorB.onCaptions((caption) => {
      console.log("Translator B caption event:", caption);
    });
  } catch (error) {
    console.error("Error in virtual device translation example:", error);
  }
}

runVirtualDeviceTranslationExample();
