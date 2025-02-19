export type CaptionEvent = {
    participant_id: string;
    timestamp: string;
    transcript: string;
    type: string;
};
export type DubitCreateParams = {
    token: string;
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
