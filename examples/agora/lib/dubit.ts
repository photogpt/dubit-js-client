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
  useMic?: boolean; // defaults to false
  inputTrack?: MediaStreamTrack | null;
  token: string;
  fromLanguage: string; // BCP 47 language code
  toLanguage: string; // BCP 47 language code
  voiceType: string; // male or female

  /** Determines if the current user is local (true) or remote (false) to configure bot translation routing */
  isLocal: boolean;
};

export default class Dubit {
  private apiUrl: string;
  private useMic: boolean;
  private inputTrack: MediaStreamTrack | null;
  private token: string;
  private fromLanguage: string;
  private toLanguage: string;
  private voiceType: string;
  private isLocal: boolean;

  private callObject: DailyCall | null;
  private outputTrack: MediaStreamTrack | null;
  private onTranslatedTrackCallback: ((track: MediaStreamTrack) => void) | null;

  constructor({
    apiUrl = import.meta.env.VITE_DUBIT_API_URL as string,
    useMic = false,
    inputTrack = null,
    token,
    fromLanguage,
    toLanguage,
    voiceType = "female",
    isLocal = false,
  }: DubitTranslationParams) {
    this.apiUrl = apiUrl;
    this.useMic = useMic;
    this.inputTrack = inputTrack;
    this.token = token;
    this.fromLanguage = fromLanguage;
    this.toLanguage = toLanguage;
    this.voiceType = voiceType;
    this.isLocal = isLocal;

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

      if (this.useMic) {
        /**
         * When microphone is enabled, obtain the local audio stream track
         * from user's microphone device for translation input
         * For remote users useMic is always false
         */
        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioSource = localStream.getAudioTracks()[0];
      } else if (this.inputTrack) {
        /**
         * For local users with microphone disabled:
         * Set audio source to null and mute mic in Daily Call
         * Otherwise use the provided input track as audio source
         */
        if (this.isLocal && !this.useMic) {
          audioSource = null;
          this.callObject.setLocalAudio(false);
        } else {
          audioSource = this.inputTrack;
        }
      } else {
        /**
         * When no audio input is available:
         * - Update input track state to reflect disabled audio
         */
        audioSource = null;
        this.updateInputTrack(null);
      }

      await this.joinDailyRoom(
        roomUrl,
        audioSource,
        this.isLocal && !this.useMic ? true : false
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
              "Dubit:: no track callback; please call onTranslatedTrack() and use the track for playing the translated audio"
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
        }
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
    voiceType: string
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
    startAudioOff: boolean
  ): Promise<void> {
    if (!this.callObject) {
      throw new Error("Call object not initialized");
    }

    await this.callObject
      .join({
        url: roomUrl,
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
            this.voiceType
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
    if (this.callObject) {
      this.callObject.on("app-message", (event: CaptionEvent) => {
        const { type } = event.data;

        if (type === "user-transcript" || type === "translation-transcript") {
          callback(event);
        }
      });
    } else {
      console.error("Dubit:: callObject is not initialized");
    }
  }

  public async updateInputTrack(
    newInputTrack: MediaStreamTrack | null
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
