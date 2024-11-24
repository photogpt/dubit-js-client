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
};

export default class Dubit {
  private apiUrl: string;
  private useMic: boolean;
  private inputTrack: MediaStreamTrack | null;
  private token: string;
  private fromLanguage: string;
  private toLanguage: string;
  private voiceType: string;

  private callObject: DailyCall | null;
  private outputTrack: MediaStreamTrack | null;
  private onTranslatedTrackCallback: ((track: MediaStreamTrack) => void) | null;

  constructor({
    apiUrl = "https://agents.dubit.live",
    useMic = false,
    inputTrack = null,
    token,
    fromLanguage,
    toLanguage,
    voiceType = "female",
  }: DubitTranslationParams) {
    this.apiUrl = apiUrl;
    this.useMic = useMic;
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
      if (this.useMic) {
        // Use the microphone as the audio input
        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioSource = localStream.getAudioTracks()[0];
      } else if (this.inputTrack) {
        // Use the provided MediaStreamTrack as the audio input
        audioSource = this.inputTrack;
      } else {
        throw new Error("No audio input provided");
      }

      await this.joinDailyRoom(roomUrl, audioSource);

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
    audioSource: MediaStreamTrack,
  ): Promise<void> {
    if (!this.callObject) {
      throw new Error('Call object not initialized');
    }

    await this.callObject
      .join({
        url: roomUrl,
        audioSource: audioSource,
        videoSource: false,
        subscribeToTracksAutomatically: true,
      })
      .then(async (e: void | DailyParticipantsObject) => {
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
        console.error('Dubit:', error);
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
  
        if (type === 'user-transcript' || type === 'translation-transcript') {
          callback(event);
        }
      });
    } else {
      console.error("Dubit:: callObject is not initialized");
    }
  }

  public async updateInputTrack(newInputTrack: MediaStreamTrack | null): Promise<void> {
    if (!this.callObject) {
      throw new Error('Call object not initialized');
    }

    if (!newInputTrack) {
      await this.callObject.setInputDevicesAsync({
        audioSource: false
      });
      return;
    }

    if (newInputTrack.readyState === 'ended') {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                deviceId: newInputTrack.id
            }
        });
        newInputTrack = stream.getAudioTracks()[0];
    }

    this.inputTrack = newInputTrack;

    await this.callObject.setInputDevicesAsync({
        audioSource: newInputTrack
    });

    console.log("newInputTrack", newInputTrack)
  }

  public destroy(): void {
    if (this.callObject) {
      this.callObject.leave();
      this.callObject.destroy();
      this.callObject = null;
    }
  }
}
