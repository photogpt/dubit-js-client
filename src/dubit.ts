import Daily, {
  DailyCall,
  DailyEventObjectParticipantLeft,
  DailyEventObjectTrack,
  DailyParticipantsObject,
} from "@daily-co/daily-js";

export type CaptionEvent = {
  action: string;
  callClientId: string;
  data: {
    participant_id: string;
    timestamp: string;
    transcript: string;
    type: string;
  };
  fromId: string;
};

export type DubitTranslationParams = {
  apiUrl?: string;
  inputTrack?: MediaStreamTrack | null;
  token: string;
  fromLanguage: string; // BCP 47 language code
  toLanguage: string; // BCP 47 language code
  voiceType: string; // male or female
};

const API_URL = process.env.VITE_DUBIT_API_URL;

export default class Dubit {
  private apiUrl: string;
  private inputTrack: MediaStreamTrack | null;
  private token: string;
  private fromLanguage: string;
  private toLanguage: string;
  private voiceType: string;

  private callObject: DailyCall | null;
  private outputTrack: MediaStreamTrack | null;
  private onTranslatedTrackCallback: ((track: MediaStreamTrack) => void) | null;

  constructor({
    apiUrl = API_URL as string,
    inputTrack = null,
    token,
    fromLanguage,
    toLanguage,
    voiceType = "female",
  }: DubitTranslationParams) {
    this.apiUrl = apiUrl;
    this.inputTrack = inputTrack;
    this.token = token;
    this.fromLanguage = fromLanguage;
    this.toLanguage = toLanguage;
    this.voiceType = voiceType;

    this.callObject = null;
    this.outputTrack = null;
    this.onTranslatedTrackCallback = null;

    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.callObject = Daily.createCallObject({
        allowMultipleCallInstances: true,
      });
      this.validateConfig();

      const roomUrl = await this.getDailyRoomUrl(this.token);
      if (!roomUrl) {
        throw new Error("Failed to obtain room URL");
      }

      let audioSource: MediaStreamTrack | null = null;

      if (this.inputTrack) {
        // Check if the input track is in "ended" state, which means microphone is initially off
        // MediaStreamTrack.readyState can be "live", "ended", or "stopped"

        if (this.inputTrack.readyState === "ended") {
          // Microphone is off, so disable audio in Daily call:

          audioSource = null;
          this.callObject.setLocalAudio(false);

          await this.callObject.setInputDevicesAsync({
            audioSource: false,
          });
        }

        // If track is active and streaming audio ("live" state)
        if (this.inputTrack.readyState === "live") {
          audioSource = this.inputTrack;
        }
      } else {
        // No input track provided, disable audio input

        audioSource = null;
        this.updateInputTrack(null);
      }

      await this.joinDailyRoom(
        roomUrl,
        audioSource,
        audioSource ? false : true,
      );

      // Listen for new audio tracks (translated audio)
      this.callObject.on("track-started", (event: DailyEventObjectTrack) => {
        // for now, only other participant is the bot; in future make this strict using participant.session_id
        if (event.track.kind === "audio" && !event.participant?.local) {
          console.log("Dubit:: new remote audio track");
          this.outputTrack = event.track;
          if (this.onTranslatedTrackCallback && this.outputTrack) {
            this.onTranslatedTrackCallback(this.outputTrack);
          } else {
            console.error(
              "Dubit:: no track callback; please call onTranslatedTrack() and use the track for playing the translated audio",
            );
          }
        }
      });

      this.callObject.on(
        "participant-left",
        (event: DailyEventObjectParticipantLeft) => {
          if (!event.participant.local && this.outputTrack) {
            this.outputTrack = null;
            console.error("Dubit:: translation errored; translator left;");
          }
        },
      );
    } catch (error) {
      console.error("Dubit::", error);
    }
  }

  // Validate the configuration; for e.g, token, language codes, etc.
  private validateConfig(): void {
    // For now, we assume the configuration is valid
  }

  private async getDailyRoomUrl(token: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiUrl}/meeting/new-meeting`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch room URL");
      }

      const data = await response.json();
      return data.roomUrl;
    } catch (error) {
      console.error("Dubit:", error);
      return null;
    }
  }

  private async addTranslationBot(
    roomUrl: string,
    participantId: string,
    fromLanguage: string,
    toLanguage: string,
    voiceType: string,
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
        }),
      });
    } catch (error) {
      console.error("Dubit:: Error adding translation bot:", error);
    }
  }

  private async registerParticipant(participantId: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/participant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          id: participantId,
        }),
      });
    } catch (error) {
      console.error("Dubit:: Error registering participant:", error);
    }
  }

  public async joinDailyRoom(
    roomUrl: string,
    audioSource: MediaStreamTrack | null,
    startAudioOff: boolean,
  ): Promise<void> {
    if (!this.callObject) {
      throw new Error("Call object not initialized");
    }

    await this.callObject
      .join({
        url: roomUrl,

        /**  Configure audio source for Daily call:
         * - If audioSource exists, use the MediaStreamTrack
         * - If null/undefined, disable audio by setting to false
         * See: https://docs.daily.co/reference/daily-js/factory-methods/create-call-object
         */

        audioSource: audioSource || false,
        videoSource: false,
        subscribeToTracksAutomatically: true,
        startAudioOff: startAudioOff, //Ensures the Daily call starts with microphone disabled when startAudioOff is true
      })
      .then(async (e: void | DailyParticipantsObject | void) => {
        if (e) {
          await this.registerParticipant(e.local.session_id);
          await this.addTranslationBot(
            roomUrl,
            e.local.session_id,
            this.fromLanguage,
            this.toLanguage,
            this.voiceType,
          );
        }
      })
      .catch((error) => {
        console.error("Dubit:", error);
      });
  }

  // Method to retrieve the translated audio track
  public getTranslatedTrack(): MediaStreamTrack | null {
    return this.outputTrack;
  }

  // Allow the user to provide a callback for when the translated track is available
  public onTranslatedTrack(callback: (track: MediaStreamTrack) => void): void {
    this.onTranslatedTrackCallback = callback;
  }

  //Captions
  public onCaptions(callback: (event: CaptionEvent) => void): void {
    if (!this.callObject) {
      throw new Error("Dubit:: callObject is not initialized");
    }
    // Subscribe to the 'app-message' event
    this.callObject.on("app-message", (event: CaptionEvent) => {
      const { type } = event.data;

      if (type === "user-transcript" || type === "translation-transcript") {
        callback(event);
      }
    });
  }

  public async updateInputTrack(
    newInputTrack: MediaStreamTrack | null,
  ): Promise<void> {
    if (!this.callObject) {
      throw new Error("Call object not initialized");
    }

    if (!newInputTrack) {
      // If the new input track is null, we need to disable the microphone in Daily Call.
      await this.callObject.setInputDevicesAsync({
        audioSource: false,
      });
      return;
    }

    // Enable the microphone
    this.callObject.setLocalAudio(true);

    /**
     *  When toggling the microphone, the audio track may occasionally be in an 'ended' state, rendering it unable to transmit audio.
     * To resolve this, a new active audio stream is created using the same device ID.
     * This process disconnects the old track and then establish a new one.
     */

    if (newInputTrack.readyState === "ended") {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: newInputTrack.id,
        },
      });
      newInputTrack = stream.getAudioTracks()[0];
    }

    this.inputTrack = newInputTrack;

    await this.callObject.setInputDevicesAsync({
      audioSource: newInputTrack,
    });

    console.log("newInputTrack", newInputTrack);
  }

  public destroy(): void {
    if (this.callObject) {
      this.callObject.leave();
      this.callObject.destroy();
      this.callObject = null;
    }
  }
}
