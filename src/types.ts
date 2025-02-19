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
  instanceId: string; // room ID from the API
  ownerToken: string;
};

export type TranslatorParams = {
  fromLang: string;
  toLang: string;
  voiceType: "male" | "female";
  version?: string;
  inputAudioTrack: MediaStreamTrack | null;
  metadata?: Record<string, any>;
};
