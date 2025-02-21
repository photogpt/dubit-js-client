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

export function getSupportedFromLanguages(): LanguageType[] {
  return SUPPORTED_FROM_LANGUAGES;
}

export function getSupportedToLanguages(): LanguageType[] {
  return SUPPORTED_TO_LANGUAGES;
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
    if (
      !SUPPORTED_FROM_LANGUAGES.map((x) => x.langCode).includes(params.fromLang)
    ) {
      return new Error(
        `Unsupported fromLang: ${params.fromLang}. Supported from languages: ${SUPPORTED_FROM_LANGUAGES.map((x) => x.langCode)}`,
      );
    }
    if (
      !SUPPORTED_TO_LANGUAGES.map((x) => x.langCode).includes(params.toLang)
    ) {
      return new Error(
        `Unsupported toLang: ${params.toLang}. Supported to languages: ${SUPPORTED_TO_LANGUAGES.map((x) => x.langCode)}`,
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

  private onTranslatedTrackCallback:
    | ((track: MediaStreamTrack) => void)
    | null = null;
  private onCaptionsCallback: ((caption: CaptionEvent) => void) | null = null;

  // Called upon destroy to allow the parent to clean up references.
  public onDestroy?: () => void;

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
  }

  public async init(): Promise<void> {
    try {
      this.callObject = Daily.createCallObject({
        allowMultipleCallInstances: true,
        videoSource: false,
        subscribeToTracksAutomatically: false,
        inputSettings: {
          audio: {
            processor: {
              type: "noise-cancellation",
            },
          },
        },
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
      if (event?.track?.kind === "audio" && !event?.participant?.local) {
        console.debug(
          `CallClient: ${this.callObject.callClientId} , event:`,
          event,
        );
        this.participantTracks.set(event.participant.session_id, event.track);
      }
    });

    this.callObject.on(
      "participant-joined",
      (event: DailyEventObjectParticipant) => {
        let fromLangLabel = SUPPORTED_FROM_LANGUAGES.find(
          (x) => x.langCode == this.fromLang,
        ).label;
        let toLangLabel = SUPPORTED_TO_LANGUAGES.find(
          (x) => x.langCode == this.toLang,
        ).label;
        if (
          !event?.participant?.local &&
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

    this.fetchTranslationBotId(this.participantId)
      .then((botId) => {
        console.debug(
          `Translator ready, Call Id:${this.callObject.callClientId} Translator Id: ${botId}`,
        );
      })
      .catch((error) => {
        console.error("Translator: Error fetching translator id", error);
      });
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

  private async fetchTranslationBotId(participantId: string): Promise<string> {
    try {
      let translatorId = "";
      while (!translatorId) {
        let botsDataResponse = await fetch(
          `${this.apiUrl}/participant/${participantId}/bot`,
        );
        let json = await botsDataResponse.json();
        translatorId = json?.data?.[0]?.id; // For now, we only support one bot per participant.
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      let translatedTrack = this.participantTracks.get(translatorId);
      if (translatedTrack) {
        this.translatedTrack = translatedTrack;
        if (this.onTranslatedTrackCallback) {
          this.onTranslatedTrackCallback(translatedTrack);
        }
      } else {
        console.debug("Translator: !!!!!!!!!!! Edge Case !!!!!!!!!!!");
      }
      return translatorId;
    } catch (err) {
      console.error("Translator: Error fetching translator id", err);
      throw err;
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

export const SUPPORTED_FROM_LANGUAGES: LanguageType[] = [
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

export const SUPPORTED_TO_LANGUAGES: LanguageType[] = [
  {
    langCode: "af-ZA",
    label: "Afrikaans (South Africa)",
  },
  {
    langCode: "am-ET",
    label: "Amharic (Ethiopia)",
  },
  {
    langCode: "ar-AE",
    label: "Arabic (United Arab Emirates)",
  },
  {
    langCode: "ar-BH",
    label: "Arabic (Bahrain)",
  },
  {
    langCode: "ar-DZ",
    label: "Arabic (Algeria)",
  },
  {
    langCode: "ar-EG",
    label: "Arabic (Egypt)",
  },
  {
    langCode: "ar-IQ",
    label: "Arabic (Iraq)",
  },
  {
    langCode: "ar-JO",
    label: "Arabic (Jordan)",
  },
  {
    langCode: "ar-KW",
    label: "Arabic (Kuwait)",
  },
  {
    langCode: "ar-LB",
    label: "Arabic (Lebanon)",
  },
  {
    langCode: "ar-LY",
    label: "Arabic (Libya)",
  },
  {
    langCode: "ar-MA",
    label: "Arabic (Morocco)",
  },
  {
    langCode: "ar-OM",
    label: "Arabic (Oman)",
  },
  {
    langCode: "ar-QA",
    label: "Arabic (Qatar)",
  },
  {
    langCode: "ar-SA",
    label: "Arabic (Saudi Arabia)",
  },
  {
    langCode: "ar-SY",
    label: "Arabic (Syria)",
  },
  {
    langCode: "ar-TN",
    label: "Arabic (Tunisia)",
  },
  {
    langCode: "ar-YE",
    label: "Arabic (Yemen)",
  },
  {
    langCode: "as-IN",
    label: "Assamese (India)",
  },
  {
    langCode: "az-AZ",
    label: "Azerbaijani (Latin, Azerbaijan)",
  },
  {
    langCode: "bg-BG",
    label: "Bulgarian (Bulgaria)",
  },
  {
    langCode: "bn-BD",
    label: "Bangla (Bangladesh)",
  },
  {
    langCode: "bn-IN",
    label: "Bengali (India)",
  },
  {
    langCode: "bs-BA",
    label: "Bosnian (Bosnia and Herzegovina)",
  },
  {
    langCode: "ca-ES",
    label: "Catalan",
  },
  {
    langCode: "cs-CZ",
    label: "Czech (Czechia)",
  },
  {
    langCode: "cy-GB",
    label: "Welsh (United Kingdom)",
  },
  {
    langCode: "da-DK",
    label: "Danish (Denmark)",
  },
  {
    langCode: "de-AT",
    label: "German (Austria)",
  },
  {
    langCode: "de-CH",
    label: "German (Switzerland)",
  },
  {
    langCode: "de-DE",
    label: "German (Germany)",
  },
  {
    langCode: "el-GR",
    label: "Greek (Greece)",
  },
  {
    langCode: "en-AU",
    label: "English (Australia)",
  },
  {
    langCode: "en-CA",
    label: "English (Canada)",
  },
  {
    langCode: "en-GB",
    label: "English (United Kingdom)",
  },
  {
    langCode: "en-HK",
    label: "English (Hong Kong SAR)",
  },
  {
    langCode: "en-IE",
    label: "English (Ireland)",
  },
  {
    langCode: "en-IN",
    label: "English (India)",
  },
  {
    langCode: "en-KE",
    label: "English (Kenya)",
  },
  {
    langCode: "en-NG",
    label: "English (Nigeria)",
  },
  {
    langCode: "en-NZ",
    label: "English (New Zealand)",
  },
  {
    langCode: "en-PH",
    label: "English (Philippines)",
  },
  {
    langCode: "en-SG",
    label: "English (Singapore)",
  },
  {
    langCode: "en-TZ",
    label: "English (Tanzania)",
  },
  {
    langCode: "en-US",
    label: "English (United States)",
  },
  {
    langCode: "en-ZA",
    label: "English (South Africa)",
  },
  {
    langCode: "es-AR",
    label: "Spanish (Argentina)",
  },
  {
    langCode: "es-BO",
    label: "Spanish (Bolivia)",
  },
  {
    langCode: "es-CL",
    label: "Spanish (Chile)",
  },
  {
    langCode: "es-CO",
    label: "Spanish (Colombia)",
  },
  {
    langCode: "es-CR",
    label: "Spanish (Costa Rica)",
  },
  {
    langCode: "es-CU",
    label: "Spanish (Cuba)",
  },
  {
    langCode: "es-DO",
    label: "Spanish (Dominican Republic)",
  },
  {
    langCode: "es-EC",
    label: "Spanish (Ecuador)",
  },
  {
    langCode: "es-ES",
    label: "Spanish (Spain)",
  },
  {
    langCode: "es-GQ",
    label: "Spanish (Equatorial Guinea)",
  },
  {
    langCode: "es-GT",
    label: "Spanish (Guatemala)",
  },
  {
    langCode: "es-HN",
    label: "Spanish (Honduras)",
  },
  {
    langCode: "es-MX",
    label: "Spanish (Mexico)",
  },
  {
    langCode: "es-NI",
    label: "Spanish (Nicaragua)",
  },
  {
    langCode: "es-PA",
    label: "Spanish (Panama)",
  },
  {
    langCode: "es-PE",
    label: "Spanish (Peru)",
  },
  {
    langCode: "es-PR",
    label: "Spanish (Puerto Rico)",
  },
  {
    langCode: "es-PY",
    label: "Spanish (Paraguay)",
  },
  {
    langCode: "es-SV",
    label: "Spanish (El Salvador)",
  },
  {
    langCode: "es-US",
    label: "Spanish (United States)",
  },
  {
    langCode: "es-UY",
    label: "Spanish (Uruguay)",
  },
  {
    langCode: "es-VE",
    label: "Spanish (Venezuela)",
  },
  {
    langCode: "et-EE",
    label: "Estonian (Estonia)",
  },
  {
    langCode: "eu-ES",
    label: "Basque",
  },
  {
    langCode: "fa-IR",
    label: "Persian (Iran)",
  },
  {
    langCode: "fi-FI",
    label: "Finnish (Finland)",
  },
  {
    langCode: "fil-PH",
    label: "Filipino (Philippines)",
  },
  {
    langCode: "fr-BE",
    label: "French (Belgium)",
  },
  {
    langCode: "fr-CA",
    label: "French (Canada)",
  },
  {
    langCode: "fr-CH",
    label: "French (Switzerland)",
  },
  {
    langCode: "fr-FR",
    label: "French (France)",
  },
  {
    langCode: "ga-IE",
    label: "Irish (Ireland)",
  },
  {
    langCode: "gl-ES",
    label: "Galician",
  },
  {
    langCode: "gu-IN",
    label: "Gujarati (India)",
  },
  {
    langCode: "he-IL",
    label: "Hebrew (Israel)",
  },
  {
    langCode: "hi-IN",
    label: "Hindi (India)",
  },
  {
    langCode: "hr-HR",
    label: "Croatian (Croatia)",
  },
  {
    langCode: "hu-HU",
    label: "Hungarian (Hungary)",
  },
  {
    langCode: "hy-AM",
    label: "Armenian (Armenia)",
  },
  {
    langCode: "id-ID",
    label: "Indonesian (Indonesia)",
  },
  {
    langCode: "is-IS",
    label: "Icelandic (Iceland)",
  },
  {
    langCode: "it-IT",
    label: "Italian (Italy)",
  },
  {
    langCode: "iu-CANS-CA",
    label: "Inuktitut (Syllabics, Canada)",
  },
  {
    langCode: "iu-LATN-CA",
    label: "Inuktitut (Latin, Canada)",
  },
  {
    langCode: "ja-JP",
    label: "Japanese (Japan)",
  },
  {
    langCode: "jv-ID",
    label: "Javanese (Latin, Indonesia)",
  },
  {
    langCode: "ka-GE",
    label: "Georgian (Georgia)",
  },
  {
    langCode: "kk-KZ",
    label: "Kazakh (Kazakhstan)",
  },
  {
    langCode: "km-KH",
    label: "Khmer (Cambodia)",
  },
  {
    langCode: "kn-IN",
    label: "Kannada (India)",
  },
  {
    langCode: "ko-KR",
    label: "Korean (Korea)",
  },
  {
    langCode: "lo-LA",
    label: "Lao (Laos)",
  },
  {
    langCode: "lt-LT",
    label: "Lithuanian (Lithuania)",
  },
  {
    langCode: "lv-LV",
    label: "Latvian (Latvia)",
  },
  {
    langCode: "mk-MK",
    label: "Macedonian (North Macedonia)",
  },
  {
    langCode: "ml-IN",
    label: "Malayalam (India)",
  },
  {
    langCode: "mn-MN",
    label: "Mongolian (Mongolia)",
  },
  {
    langCode: "mr-IN",
    label: "Marathi (India)",
  },
  {
    langCode: "ms-MY",
    label: "Malay (Malaysia)",
  },
  {
    langCode: "mt-MT",
    label: "Maltese (Malta)",
  },
  {
    langCode: "my-MM",
    label: "Burmese (Myanmar)",
  },
  {
    langCode: "nb-NO",
    label: "Norwegian Bokmål (Norway)",
  },
  {
    langCode: "ne-NP",
    label: "Nepali (Nepal)",
  },
  {
    langCode: "nl-BE",
    label: "Dutch (Belgium)",
  },
  {
    langCode: "nl-NL",
    label: "Dutch (Netherlands)",
  },
  {
    langCode: "or-IN",
    label: "Oriya (India)",
  },
  {
    langCode: "pa-IN",
    label: "Punjabi (India)",
  },
  {
    langCode: "pl-PL",
    label: "Polish (Poland)",
  },
  {
    langCode: "ps-AF",
    label: "Pashto (Afghanistan)",
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
    langCode: "ro-RO",
    label: "Romanian (Romania)",
  },
  {
    langCode: "ru-RU",
    label: "Russian (Russia)",
  },
  {
    langCode: "si-LK",
    label: "Sinhala (Sri Lanka)",
  },
  {
    langCode: "sk-SK",
    label: "Slovak (Slovakia)",
  },
  {
    langCode: "sl-SI",
    label: "Slovenian (Slovenia)",
  },
  {
    langCode: "so-SO",
    label: "Somali (Somalia)",
  },
  {
    langCode: "sq-AL",
    label: "Albanian (Albania)",
  },
  {
    langCode: "sr-LATN-RS",
    label: "Serbian (Latin, Serbia)",
  },
  {
    langCode: "sr-RS",
    label: "Serbian (Cyrillic, Serbia)",
  },
  {
    langCode: "su-ID",
    label: "Sundanese (Indonesia)",
  },
  {
    langCode: "sv-SE",
    label: "Swedish (Sweden)",
  },
  {
    langCode: "sw-KE",
    label: "Kiswahili (Kenya)",
  },
  {
    langCode: "sw-TZ",
    label: "Kiswahili (Tanzania)",
  },
  {
    langCode: "ta-IN",
    label: "Tamil (India)",
  },
  {
    langCode: "ta-LK",
    label: "Tamil (Sri Lanka)",
  },
  {
    langCode: "ta-MY",
    label: "Tamil (Malaysia)",
  },
  {
    langCode: "ta-SG",
    label: "Tamil (Singapore)",
  },
  {
    langCode: "te-IN",
    label: "Telugu (India)",
  },
  {
    langCode: "th-TH",
    label: "Thai (Thailand)",
  },
  {
    langCode: "tr-TR",
    label: "Turkish (Türkiye)",
  },
  {
    langCode: "uk-UA",
    label: "Ukrainian (Ukraine)",
  },
  {
    langCode: "ur-IN",
    label: "Urdu (India)",
  },
  {
    langCode: "ur-PK",
    label: "Urdu (Pakistan)",
  },
  {
    langCode: "uz-UZ",
    label: "Uzbek (Latin, Uzbekistan)",
  },
  {
    langCode: "vi-VN",
    label: "Vietnamese (Vietnam)",
  },
  {
    langCode: "wuu-CN",
    label: "Chinese (Wu, Simplified)",
  },
  {
    langCode: "yue-CN",
    label: "Chinese (Cantonese, Simplified)",
  },
  {
    langCode: "zh-CN",
    label: "Chinese (Mandarin, Simplified)",
  },
  {
    langCode: "zh-CN-GUANGXI",
    label: "Chinese (Guangxi Accent Mandarin, Simplified)",
  },
  {
    langCode: "zh-CN-henan",
    label: "Chinese (Zhongyuan Mandarin Henan, Simplified)",
  },
  {
    langCode: "zh-CN-liaoning",
    label: "Chinese (Northeastern Mandarin, Simplified)",
  },
  {
    langCode: "zh-CN-shaanxi",
    label: "Chinese (Zhongyuan Mandarin Shaanxi, Simplified)",
  },
  {
    langCode: "zh-CN-shandong",
    label: "Chinese (Jilu Mandarin, Simplified)",
  },
  {
    langCode: "zh-CN-sichuan",
    label: "Chinese (Southwestern Mandarin, Simplified)",
  },
  {
    langCode: "zh-HK",
    label: "Chinese (Cantonese, Traditional)",
  },
  {
    langCode: "zh-TW",
    label: "Chinese (Taiwanese Mandarin, Traditional)",
  },
  {
    langCode: "zu-ZA",
    label: "isiZulu (South Africa)",
  },
];
