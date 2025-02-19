import Daily, {
  DailyCall,
  DailyEventObjectParticipantLeft,
  DailyEventObjectTrack,
  DailyParticipantsObject,
} from "@daily-co/daily-js";
import { CaptionEvent } from "./types";

//
// Translator allows you to translate audio from one language to another.
//
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
  private outputTrack: MediaStreamTrack | null = null;
  private participantId = "";
  private translatorId = "";

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

  /**
   * Initialize the translator:
   * - Create a Call instance (with multiple-instance support)
   * - Join the room using the provided input audio track
   * - Register the local participant and add a translation bot via the API
   * - Set up event listeners for translated tracks and captions.
   */
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
      // Determine the audio source to use.
      let audioSource: MediaStreamTrack | false = false;
      if (this.inputAudioTrack && this.inputAudioTrack.readyState === "live") {
        audioSource = this.inputAudioTrack;
      }

      await this.callObject.join({
        url: this.roomUrl,
        audioSource,
        videoSource: false,
        subscribeToTracksAutomatically: true,
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
    this.translatorId = await this.fetchTranslationBotId(this.participantId);

    // Listen for translated audio track.
    this.callObject.on("track-started", (event: DailyEventObjectTrack) => {
      if (
        event.track.kind === "audio" &&
        event.participant?.session_id == this.translatorId
      ) {
        this.outputTrack = event.track;
        if (this.onTranslatedTrackCallback) {
          this.onTranslatedTrackCallback(this.outputTrack);
        }
      }
    });

    // Listen for caption events with filtering.
    this.callObject.on("app-message", (event: any) => {
      const data = event.data;
      // Filter: ensure data exists, has the expected types, and is relevant to this translator.
      if (
        data &&
        (data.type === "user-transcript" ||
          data.type === "translation-transcript" ||
          data.type === "user-interim-transcript") &&
        data.participant_id === this.participantId
      ) {
        if (this.onCaptionsCallback) {
          this.onCaptionsCallback(data);
        }
      }
    });

    // Clear output track if a non-local participant (i.e. the bot) leaves.
    this.callObject.on(
      "participant-left",
      (event: DailyEventObjectParticipantLeft) => {
        if (!event.participant.local && this.outputTrack) {
          this.outputTrack = null;
          console.error(
            "Translator: Translation bot left; output track cleared",
          );
        }
      },
    );
  }

  /**
   * Registers the local participant
   */
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

  /**
   * Adds a translation bot for the given participant.
   */
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
      return translatorId;
    } catch (err) {
      console.error("Translator: Error fetching translator id", err);
      throw err;
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
   * Allows updating the input audio track.
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
   * Returns the local participant's session_id
   */
  public getParticipantId(): string {
    return this.participantId;
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
    // Invoke onDestroy callback for parent cleanup.
    if (this.onDestroy) {
      this.onDestroy();
    }
  }
}

//
// Helper: Safely serialize metadata (removing potential circular references)
//
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
