import Daily, {
  DailyCall,
  DailyEventObjectParticipantLeft,
  DailyEventObjectTrack,
  DailyParticipantsObject,
} from "@daily-co/daily-js";

const API_URL = process.env.VITE_DUBIT_API_URL as string;

//
// Top-Level Types & Interfaces
//

export type CaptionEvent = {
  participant_id: string;
  timestamp: string;
  transcript: string;
  type: string;
};

export type DubitCreateParams = {
  token: string; // SESSION_KEY or API_KEY
  apiUrl?: string;
};

export type DubitCreateResponse = {
  instanceId: string; // room URL or room ID from the API
  ownerToken: string;
};

export type TranslatorParams = {
  fromLang: string;
  toLang: string;
  voiceType: "male" | "female";
  inputAudioTrack: MediaStreamTrack | null;
  metadata?: Record<string, any>;
};

export type TranslatorCallbacks = {
  onTranslatedTrackReady?: (translatedTrack: MediaStreamTrack) => void;
  onCaptions?: (caption: CaptionEvent) => void;
};

//
// Top-Level Utility Functions
//

export async function getSupportedLanguages(): Promise<string[]> {
  // Example: Either fetch from your API or return a static list.
  return ["en", "es", "fr", "de", "zh"];
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
  const response = await fetch(
    `${apiUrl}/meeting/transcript?instanceId=${encodeURIComponent(instanceId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch complete transcript");
  }
  return response.json();
}

//
// The Dubit Instance – represents a meeting room created via your API
//

export class DubitInstance {
  public instanceId: string;
  public ownerToken: string;
  private apiUrl: string;

  // Store translators if needed
  private translators: Map<string, Translator> = new Map();

  constructor(instanceId: string, ownerToken: string, apiUrl: string) {
    this.instanceId = instanceId;
    this.ownerToken = ownerToken;
    this.apiUrl = apiUrl;
  }

  /**
   * Creates a new translator bot (with its own Daily call instance)
   */
  public async addTranslator(params: TranslatorParams): Promise<Translator> {
    const translator = new Translator({
      instanceId: this.instanceId,
      token: this.ownerToken,
      apiUrl: this.apiUrl,
      ...params,
    });
    await translator.init();
    this.translators.set(translator.getTranslatorId(), translator);
    return translator;
  }
}

/**
 * Creates a new dubit instance (i.e. creates a room via your API)
 */
export async function create({
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
    const data = await response.json();
    // Assume the API returns a roomUrl and that becomes our instanceId.
    const instanceId = data.roomUrl;
    return new DubitInstance(instanceId, token, apiUrl);
  } catch (error) {
    console.error("dubit.create error:", error);
    throw error;
  }
}

//
// Translator – manages a Daily call instance and translation bot subscriptions
//

export class Translator {
  private instanceId: string;
  private token: string;
  private apiUrl: string;
  private fromLang: string;
  private toLang: string;
  private voiceType: "male" | "female";
  private inputAudioTrack: MediaStreamTrack | null;
  private metadata?: Record<string, any>;

  private callObject: DailyCall | null = null;
  private outputTrack: MediaStreamTrack | null = null;
  private translatorId = "";

  private onTranslatedTrackCallback:
    | ((track: MediaStreamTrack) => void)
    | null = null;
  private onCaptionsCallback: ((caption: CaptionEvent) => void) | null = null;

  constructor(params: {
    instanceId: string;
    token: string;
    apiUrl: string;
    fromLang: string;
    toLang: string;
    voiceType: "male" | "female";
    inputAudioTrack: MediaStreamTrack | null;
    metadata?: Record<string, any>;
  }) {
    this.instanceId = params.instanceId;
    this.token = params.token;
    this.apiUrl = params.apiUrl;
    this.fromLang = params.fromLang;
    this.toLang = params.toLang;
    this.voiceType = params.voiceType;
    this.inputAudioTrack = params.inputAudioTrack;
    this.metadata = params.metadata;
  }

  /**
   * Initialize the translator:
   * - Create a Daily call instance (with multiple-instance support)
   * - Join the room using the provided input audio track
   * - Register the local participant and add a translation bot via the API
   * - Set up event listeners for translated tracks and captions.
   */
  public async init(): Promise<void> {
    this.callObject = Daily.createCallObject({
      allowMultipleCallInstances: true,
      videoSource: false,
      subscribeToTracksAutomatically: false,
    });

    // Determine the audio source to use
    let audioSource: MediaStreamTrack | false = false;
    if (this.inputAudioTrack) {
      if (this.inputAudioTrack.readyState === "live") {
        audioSource = this.inputAudioTrack;
      } else {
        // If the provided track is ended, disable audio.
        audioSource = false;
      }
    }

    // Join the room. Here, instanceId is assumed to be a valid Daily room URL.
    await this.callObject.join({
      url: this.instanceId,
      audioSource,
      videoSource: false,
      subscribeToTracksAutomatically: true,
      startAudioOff: audioSource === false,
    });

    // Retrieve local participant info to obtain a translatorId.
    const participants: DailyParticipantsObject =
      this.callObject.participants();
    if (!participants.local) {
      throw new Error("Translator: failed to obtain local participant");
    }
    this.translatorId = participants.local.session_id;

    // Register the participant and add the translation bot.
    await this.registerParticipant(this.translatorId);
    await this.addTranslationBot(
      this.instanceId,
      this.translatorId,
      this.fromLang,
      this.toLang,
      this.voiceType,
    );

    // Listen for the translated audio track from the translation bot.
    this.callObject.on("track-started", (event: DailyEventObjectTrack) => {
      // Assume that the translation bot is the only non-local participant.
      if (event.track.kind === "audio" && !event.participant?.local) {
        this.outputTrack = event.track;
        if (this.onTranslatedTrackCallback) {
          this.onTranslatedTrackCallback(this.outputTrack);
        }
      }
    });

    // Listen for caption events (via app-message).
    this.callObject.on("app-message", (event: any) => {
      const data = event.data;
      if (
        data &&
        (data.type === "user-transcript" ||
          data.type === "translation-transcript")
      ) {
        if (this.onCaptionsCallback) {
          this.onCaptionsCallback(data);
        }
      }
    });

    // If a non‑local participant (i.e. the translation bot) leaves, clear the output track.
    this.callObject.on(
      "participant-left",
      (event: DailyEventObjectParticipantLeft) => {
        if (!event.participant.local && this.outputTrack) {
          this.outputTrack = null;
          console.error(
            "Translator: translation bot left; output track cleared",
          );
        }
      },
    );
  }

  /**
   * Registers the local participant via your API.
   */
  private async registerParticipant(participantId: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/participant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ id: participantId }),
      });
    } catch (error) {
      console.error("Translator: error registering participant:", error);
    }
  }

  /**
   * Adds a translation bot via your API for the given participant.
   */
  private async addTranslationBot(
    roomUrl: string,
    participantId: string,
    fromLanguage: string,
    toLanguage: string,
    voiceType: "male" | "female",
  ): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/meeting/bot/join`, {
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
          metadata: this.metadata || {},
        }),
      });
    } catch (error) {
      console.error("Translator: error adding translation bot:", error);
    }
  }

  /**
   * Registers a callback to be invoked when the translated audio track is available.
   */
  public onTranslatedTrackReady(
    callback: (translatedTrack: MediaStreamTrack) => void,
  ): void {
    this.onTranslatedTrackCallback = callback;
    if (this.outputTrack) {
      callback(this.outputTrack);
    }
  }

  /**
   * Registers a callback for caption events.
   */
  public onCaptions(callback: (caption: CaptionEvent) => void): void {
    this.onCaptionsCallback = callback;
  }

  /**
   * Allows updating the input audio track (e.g. when toggling microphones).
   */
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
    // Enable local audio.
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

  /**
   * Returns the translator's ID (the local participant's session_id).
   */
  public getTranslatorId(): string {
    return this.translatorId;
  }

  /**
   * Returns the currently available translated audio track, if any.
   */
  public getTranslatedTrack(): MediaStreamTrack | null {
    return this.outputTrack;
  }

  /**
   * Clean up the Daily call instance and event listeners.
   */
  public destroy(): void {
    if (this.callObject) {
      this.callObject.leave();
      this.callObject.destroy();
      this.callObject = null;
    }
  }
}

//
// Default export for ease-of-use (import dubit from '@taic/dubit')
//

export default {
  create,
  getSupportedLanguages,
  getCompleteTranscript,
};
