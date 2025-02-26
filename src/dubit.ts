import Daily, {
  DailyCall,
  DailyEventObjectAppMessage,
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft,
  DailyEventObjectTrack,
  DailyParticipantsObject,
} from "@daily-co/daily-js";

export type CaptionEvent = {
  participant_id: string;
  timestamp: string;
  transcript: string;
  type: string;
};

export type DubitCreateParams = {
  token: string; // for now only API_KEY is supported
  apiUrl?: string;
};

export type TranslatorParams = {
  fromLang: string;
  toLang: string;
  voiceType: "male" | "female";
  version?: string;
  inputAudioTrack: MediaStreamTrack | null;
  metadata?: Record<string, any>;
  outputDeviceId?: string;
};

export type LanguageType = {
  langCode: string;
  label: string;
};

const API_URL = "https://test-api.dubit.live";

export async function createNewInstance({
  token,
  apiUrl = API_URL,
}: DubitCreateParams): Promise<DubitInstance> {
  try {
    const response = await fetch(`${apiUrl}/meeting/new-meeting`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to create meeting room");
    }
    type NewMeetingResponseData = {
      status: string;
      roomUrl: string;
      roomName: string;
      meeting_id: string;
      owner_token: string;
    };
    const data: NewMeetingResponseData = await response.json();
    const instanceId = data.meeting_id;
    const roomUrl = data.roomUrl;
    return new DubitInstance(instanceId, roomUrl, token, apiUrl);
  } catch (error) {
    console.error("dubit.createNewInstance error:", error);
    throw error;
  }
}

export function getSupportedLanguages(): LanguageType[] {
  return SUPPORTED_LANGUAGES;
}

export async function getCompleteTranscript({
  instanceId,
  token,
  apiUrl = API_URL,
}: {
  instanceId: string;
  token: string;
  apiUrl?: string;
}): Promise<any> {
  const response = await fetch(`${apiUrl}/meeting/${instanceId}/transcripts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch complete transcript");
  }
  return response.json();
}

export class DubitInstance {
  public instanceId: string;
  private roomUrl: string;
  public ownerToken: string;
  private apiUrl: string;
  private activeTranslators: Map<string, Translator> = new Map();

  constructor(
    instanceId: string,
    roomUrl: string,
    ownerToken: string,
    apiUrl: string,
  ) {
    this.instanceId = instanceId;
    this.roomUrl = roomUrl;
    this.ownerToken = ownerToken;
    this.apiUrl = apiUrl;
  }

  private validateTranslatorParams(params: TranslatorParams): Error | null {
    if (!SUPPORTED_LANGUAGES.map((x) => x.langCode).includes(params.fromLang)) {
      return new Error(
        `Unsupported fromLang: ${params.fromLang}. Supported from languages: ${SUPPORTED_LANGUAGES.map((x) => x.langCode)}`,
      );
    }
    if (!SUPPORTED_LANGUAGES.map((x) => x.langCode).includes(params.toLang)) {
      return new Error(
        `Unsupported toLang: ${params.toLang}. Supported to languages: ${SUPPORTED_LANGUAGES.map((x) => x.langCode)}`,
      );
    }
    if (params.voiceType !== "male" && params.voiceType !== "female") {
      return new Error(
        `Unsupported voiceType: ${params.voiceType}. Supported voice types: male, female`,
      );
    }
    if (params.inputAudioTrack === null) {
      return new Error("inputAudioTrack is required");
    }
    if (
      params.version &&
      !SUPPORTED_TRANSLATOR_VERSIONS.map((x) => x.version).includes(
        params.version,
      )
    ) {
      return new Error(
        `Unsupported version: ${params.version}. Supported versions: ${SUPPORTED_TRANSLATOR_VERSIONS}`,
      );
    }
    return null;
  }

  public async addTranslator(params: TranslatorParams): Promise<Translator> {
    const validationError = this.validateTranslatorParams(params);
    if (validationError) {
      return Promise.reject(validationError);
    }

    const translator = new Translator({
      instanceId: this.instanceId,
      roomUrl: this.roomUrl,
      token: this.ownerToken,
      apiUrl: this.apiUrl,
      ...params,
    });

    translator.onDestroy = () => {
      this.activeTranslators.delete(translator.getParticipantId());
    };

    await translator.init();
    this.activeTranslators.set(translator.getParticipantId(), translator);
    return translator;
  }
}

export class Translator {
  private instanceId: string;
  private roomUrl: string;
  private token: string;
  private apiUrl: string;
  private fromLang: string;
  private toLang: string;
  private voiceType: "male" | "female";
  private version: string | undefined = "latest";
  private inputAudioTrack: MediaStreamTrack | null;
  private metadata?: Record<string, any>;

  private callObject: DailyCall | null = null;
  private translatedTrack: MediaStreamTrack | null = null;
  private participantId = "";
  private participantTracks: Map<string, MediaStreamTrack> = new Map();
  private outputDeviceId: string | null = null;

  private onTranslatedTrackCallback:
    | ((track: MediaStreamTrack) => void)
    | null = null;
  private onCaptionsCallback: ((caption: CaptionEvent) => void) | null = null;

  // Called upon destroy to allow the parent to clean up references.
  public onDestroy?: () => void;
  public getInstanceId = () => this.instanceId;

  constructor(params: {
    instanceId: string;
    roomUrl: string;
    token: string;
    apiUrl: string;
    fromLang: string;
    toLang: string;
    voiceType: "male" | "female";
    version?: string;
    inputAudioTrack: MediaStreamTrack | null;
    metadata?: Record<string, any>;
    outputDeviceId?: string;
  }) {
    this.instanceId = params.instanceId;
    this.roomUrl = params.roomUrl;
    this.token = params.token;
    this.apiUrl = params.apiUrl;
    this.fromLang = params.fromLang;
    this.toLang = params.toLang;
    this.voiceType = params.voiceType;
    this.version = params.version || this.version;
    this.inputAudioTrack = params.inputAudioTrack;
    this.metadata = params.metadata
      ? safeSerializeMetadata(params.metadata)
      : {};
    this.outputDeviceId = params.outputDeviceId;
  }

  public async init(): Promise<void> {
    try {
      this.callObject = Daily.createCallObject({
        allowMultipleCallInstances: true,
        videoSource: false,
        subscribeToTracksAutomatically: false,
      });
    } catch (error) {
      console.error("Translator: Failed to create Daily call object", error);
      throw error;
    }

    try {
      let audioSource: MediaStreamTrack | false = false;
      if (this.inputAudioTrack && this.inputAudioTrack.readyState === "live") {
        audioSource = this.inputAudioTrack;
      }

      await this.callObject.join({
        url: this.roomUrl,
        audioSource,
        videoSource: false,
        subscribeToTracksAutomatically: false,
        startAudioOff: audioSource === false,
        inputSettings: {
          audio: {
            processor: {
              type: "noise-cancellation",
            },
          },
        },
      });
    } catch (error) {
      console.error("Translator: Failed to join the Daily room", error);
      throw error;
    }

    // Retrieve local participant info.
    const participants: DailyParticipantsObject =
      this.callObject.participants();
    if (!participants.local) {
      throw new Error("Translator: Failed to obtain local participant");
    }
    this.participantId = participants.local.session_id;

    try {
      await this.registerParticipant(this.participantId);
      await this.addTranslationBot(
        this.roomUrl,
        this.participantId,
        this.fromLang,
        this.toLang,
        this.voiceType,
      );
    } catch (error) {
      console.error(
        "Translator: Error registering participant or adding bot",
        error,
      );
      throw error;
    }

    this.callObject.on("track-started", (event: DailyEventObjectTrack) => {
      let fromLangLabel = SUPPORTED_LANGUAGES.find(
        (x) => x.langCode == this.fromLang,
      ).label;
      let toLangLabel = SUPPORTED_LANGUAGES.find(
        (x) => x.langCode == this.toLang,
      ).label;

      // TODO: add better identifier like some kind of id in metadata
      if (
        event.track.kind === "audio" &&
        !event?.participant?.local &&
        event.participant.user_name.includes(
          `Translator ${fromLangLabel} -> ${toLangLabel}`,
        )
      ) {
        console.debug(
          `CallClient: ${this.callObject.callClientId} , event:`,
          event,
        );

        if (this.onTranslatedTrackCallback && event.track) {
          this.onTranslatedTrackCallback(event.track);
          this.translatedTrack = event.track;
        }
      }
    });

    this.callObject.on(
      "participant-joined",
      async (event: DailyEventObjectParticipant) => {
        let fromLangLabel = SUPPORTED_LANGUAGES.find(
          (x) => x.langCode == this.fromLang,
        ).label;
        let toLangLabel = SUPPORTED_LANGUAGES.find(
          (x) => x.langCode == this.toLang,
        ).label;
        if (event?.participant?.local) return;

        // TODO: add better identifier like some kind of id in metadata
        if (
          event.participant.user_name.includes(
            `Translator ${fromLangLabel} -> ${toLangLabel}`,
          )
        ) {
          console.debug(
            `Subscribing - CallClient: ${this.callObject.callClientId} , event:`,
            event,
          );
          this.callObject.updateParticipant(event.participant.session_id, {
            setSubscribedTracks: {
              audio: true,
            },
          });
        } else {
        }
      },
    );

    this.callObject.on("app-message", (event: DailyEventObjectAppMessage) => {
      const data = event.data;
      if (!data?.type?.includes("transcript")) return;
      let validTypes = [
        "user-transcript",
        "translation-transcript",
        "user-interim-transcript",
      ];
      if (
        validTypes.includes(data.type) &&
        data.participant_id === this.participantId &&
        data?.transcript &&
        this.onCaptionsCallback
      ) {
        this.onCaptionsCallback(data);
      }
    });

    // Clear output track if a non-local participant (i.e. the bot) leaves.
    this.callObject.on(
      "participant-left",
      (event: DailyEventObjectParticipantLeft) => {
        if (!event.participant.local && this.translatedTrack) {
          this.translatedTrack = null;
          console.error(
            "Translator: Translation bot left; output track cleared",
          );
        }
      },
    );
  }

  // Register local participant
  private async registerParticipant(participantId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/participant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ id: participantId }),
      });
      if (!response.ok) {
        throw new Error("Failed to register participant");
      }
    } catch (error) {
      console.error("Translator: Error registering participant", error);
      throw error;
    }
  }

  // Adds a translation bot for the given participant
  private async addTranslationBot(
    roomUrl: string,
    participantId: string,
    fromLanguage: string,
    toLanguage: string,
    voiceType: "male" | "female",
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/meeting/bot/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          room_url: roomUrl,
          from_language: fromLanguage,
          to_language: toLanguage,
          participant_id: participantId,
          bot_type: "translation",
          male: voiceType === "male",
          metadata: this.metadata,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add translation bot");
      }
    } catch (error) {
      console.error("Translator: Error adding translation bot", error);
      throw error;
    }
  }

  public onTranslatedTrackReady(
    callback: (translatedTrack: MediaStreamTrack) => void,
  ): void {
    this.onTranslatedTrackCallback = callback;
    if (this.translatedTrack) {
      callback(this.translatedTrack);
    }
  }

  public onCaptions(callback: (caption: CaptionEvent) => void): void {
    this.onCaptionsCallback = callback;
  }

  public async updateInputTrack(
    newInputTrack: MediaStreamTrack | null,
  ): Promise<void> {
    if (!this.callObject) {
      throw new Error("Translator: callObject not initialized");
    }
    if (!newInputTrack) {
      await this.callObject.setInputDevicesAsync({ audioSource: false });
      return;
    }
    this.callObject.setLocalAudio(true);
    if (newInputTrack.readyState === "ended") {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: newInputTrack.id },
      });
      newInputTrack = stream.getAudioTracks()[0];
    }
    this.inputAudioTrack = newInputTrack;
    await this.callObject.setInputDevicesAsync({ audioSource: newInputTrack });
  }

  public getParticipantId(): string {
    return this.participantId;
  }

  public getTranslatedTrack(): MediaStreamTrack | null {
    return this.translatedTrack;
  }

  public destroy(): void {
    if (this.callObject) {
      this.callObject.leave();
      this.callObject.destroy();
      this.callObject = null;
    }
    if (this.onDestroy) {
      this.onDestroy();
    }
  }
}

const audioContexts = new Map();
const activeRoutings = new Map();

/**
 * Routes a WebRTC audio track to a specific output device using WebAudio
 * This implementation avoids the WebRTC track mixing issue by using the WebAudio API
 */
export function routeTrackToDevice(
  track: MediaStreamTrack,
  outputDeviceId: string,
  elementId: string,
): object {
  console.log(`Routing track ${track.id} to device ${outputDeviceId}`);
  if (!elementId) {
    elementId = `audio-${track.id}`;
  }

  // Clean up any existing routing for this element ID
  if (activeRoutings.has(elementId)) {
    const oldRouting = activeRoutings.get(elementId);
    oldRouting.stop();
    activeRoutings.delete(elementId);
    console.log(`Cleaned up previous routing for ${elementId}`);
  }

  // Create or get AudioContext for this output device
  let audioContext: AudioContext;
  if (audioContexts.has(outputDeviceId)) {
    audioContext = audioContexts.get(outputDeviceId);
    console.log(`Reusing existing AudioContext for device ${outputDeviceId}`);
  } else {
    audioContext = new AudioContext();
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

  const mediaStream = new MediaStream([track]);
  const sourceNode = audioContext.createMediaStreamSource(mediaStream);
  console.log(`Created source node for track ${track.id}`);
  const destinationNode = audioContext.destination;
  sourceNode.connect(destinationNode);
  console.log(
    `Connected track ${track.id} to destination for device ${outputDeviceId}`,
  );

  // If the AudioContext API supports setSinkId directly, use it
  if ("setSinkId" in AudioContext.prototype) {
    audioContext //@ts-ignore
      .setSinkId(outputDeviceId)
      .then(() =>
        console.log(`Set sinkId ${outputDeviceId} on AudioContext directly`),
      )
      .catch((err: DOMException) =>
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

  // Create routing info object with stop method
  const routingInfo = {
    context: audioContext,
    sourceNode: sourceNode,
    pullElement: pullElement,
    stop: function () {
      this.sourceNode.disconnect();
      this.pullElement.pause();
      this.pullElement.srcObject = null;
      if (this.pullElement.parentNode) {
        document.body.removeChild(this.pullElement);
      }

      console.log(
        `Stopped routing track ${track.id} to device ${outputDeviceId}`,
      );
    },
  };

  // Store the routing for future cleanup
  activeRoutings.set(elementId, routingInfo);

  return routingInfo;
}

function safeSerializeMetadata(
  metadata: Record<string, any>,
): Record<string, any> {
  try {
    JSON.stringify(metadata);
    return metadata;
  } catch (error) {
    console.error(
      "Metadata serialization error; falling back to empty object.",
      error,
    );
    return {};
  }
}

/**
 * Represents a version object with a version string and a label.
 *
 * @example
 * const version1: VersionType = {
 *   version: '1',
 *   label: 'V1 (Flash)'
 * };
 *
 * const version2: VersionType = {
 *   version: '2',
 *   label: 'V2 (Pro)'
 * };
 *
 * const version3: VersionType = {
 *   version: '3',
 *   label: 'V3 (Noise Reduction)'
 * };
 */
export type VersionType = {
  version: string;
  label: string;
};

/**
 * An array of available translator versions.
 */
export const SUPPORTED_TRANSLATOR_VERSIONS: VersionType[] = [
  {
    label: "V1 (Flash)",
    version: "1",
  },
  {
    label: "V2 (Pro)",
    version: "2",
  },
  {
    label: "V3' (Noise Reduction)",
    version: "3",
  },
];

export const SUPPORTED_LANGUAGES: LanguageType[] = [
  {
    langCode: "multi",
    label: "Multilingual (Spanish + English)",
  },
  {
    langCode: "bg",
    label: "Bulgarian",
  },
  {
    langCode: "ca",
    label: "Catalan",
  },
  {
    langCode: "zh-CN",
    label: "Chinese (Mainland China)",
  },
  {
    langCode: "zh-TW",
    label: "Chinese (Taiwan)",
  },
  {
    langCode: "zh-HK",
    label: "Chinese (Traditional, Hong Kong)",
  },
  {
    langCode: "cs",
    label: "Czech",
  },
  {
    langCode: "da",
    label: "Danish",
  },
  {
    langCode: "da-DK",
    label: "Danish",
  },
  {
    langCode: "nl",
    label: "Dutch",
  },
  {
    langCode: "en",
    label: "English",
  },
  {
    langCode: "en-US",
    label: "English (United States)",
  },
  {
    langCode: "en-AU",
    label: "English (Australia)",
  },
  {
    langCode: "en-GB",
    label: "English (United Kingdom)",
  },
  {
    langCode: "en-NZ",
    label: "English (New Zealand)",
  },
  {
    langCode: "en-IN",
    label: "English (India)",
  },
  {
    langCode: "et",
    label: "Estonian",
  },
  {
    langCode: "fi",
    label: "Finnish",
  },
  {
    langCode: "nl-BE",
    label: "Flemish",
  },
  {
    langCode: "fr",
    label: "French",
  },
  {
    langCode: "fr-CA",
    label: "French (Canada)",
  },
  {
    langCode: "de",
    label: "German",
  },
  {
    langCode: "de-CH",
    label: "German (Switzerland)",
  },
  {
    langCode: "el",
    label: "Greek",
  },
  {
    langCode: "hi",
    label: "Hindi",
  },
  {
    langCode: "hu",
    label: "Hungarian",
  },
  {
    langCode: "id",
    label: "Indonesian",
  },
  {
    langCode: "it",
    label: "Italian",
  },
  {
    langCode: "ja",
    label: "Japanese",
  },
  {
    langCode: "ko-KR",
    label: "Korean",
  },
  {
    langCode: "lv",
    label: "Latvian",
  },
  {
    langCode: "lt",
    label: "Lithuanian",
  },
  {
    langCode: "ms",
    label: "Malay",
  },
  {
    langCode: "no",
    label: "Norwegian",
  },
  {
    langCode: "pl",
    label: "Polish",
  },
  {
    langCode: "pt",
    label: "Portuguese",
  },
  {
    langCode: "pt-BR",
    label: "Portuguese (Brazil)",
  },
  {
    langCode: "pt-PT",
    label: "Portuguese (Portugal)",
  },
  {
    langCode: "ro",
    label: "Romanian",
  },
  {
    langCode: "ru",
    label: "Russian",
  },
  {
    langCode: "sk",
    label: "Slovak",
  },
  {
    langCode: "es",
    label: "Spanish",
  },
  {
    langCode: "es-419",
    label: "Spanish (Latin America & Caribbean)",
  },
  {
    langCode: "sv-SE",
    label: "Swedish (Sweden)",
  },
  {
    langCode: "th-TH",
    label: "Thai (Thailand)",
  },
  {
    langCode: "tr",
    label: "Turkish",
  },
  {
    langCode: "uk",
    label: "Ukrainian",
  },
  {
    langCode: "vi",
    label: "Vietnamese",
  },
];
