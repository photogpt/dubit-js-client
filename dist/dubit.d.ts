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
    fromLanguage: string;
    toLanguage: string;
    voiceType: string;
};
export default class Dubit {
    private apiUrl;
    private inputTrack;
    private token;
    private fromLanguage;
    private toLanguage;
    private voiceType;
    private callObject;
    private outputTrack;
    private onTranslatedTrackCallback;
    constructor({ apiUrl, inputTrack, token, fromLanguage, toLanguage, voiceType, }: DubitTranslationParams);
    private init;
    private validateConfig;
    private getDailyRoomUrl;
    private addTranslationBot;
    private registerParticipant;
    joinDailyRoom(roomUrl: string, audioSource: MediaStreamTrack | null, startAudioOff: boolean): Promise<void>;
    getTranslatedTrack(): MediaStreamTrack | null;
    onTranslatedTrack(callback: (track: MediaStreamTrack) => void): void;
    onCaptions(callback: (event: CaptionEvent) => void): void;
    updateInputTrack(newInputTrack: MediaStreamTrack | null): Promise<void>;
    destroy(): void;
}
