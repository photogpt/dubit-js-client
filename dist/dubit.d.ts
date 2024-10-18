export type DubitTranslationParams = {
    apiUrl?: string;
    useMic?: boolean;
    inputTrack?: MediaStreamTrack | null;
    token: string;
    fromLanguage: string;
    toLanguage: string;
    voiceType: string;
};
export default class Dubit {
    private API_URL;
    private useMic;
    private inputTrack;
    private token;
    private fromLanguage;
    private toLanguage;
    private voiceType;
    private callObject;
    private outputTrack;
    private onTranslatedTrackCallback;
    constructor({ apiUrl, useMic, inputTrack, token, fromLanguage, toLanguage, voiceType, }: DubitTranslationParams);
    private init;
    private validateConfig;
    private getDailyRoomUrl;
    private addTranslationBot;
    private registerParticipant;
    getTranslatedTrack(): MediaStreamTrack | null;
    onTranslatedTrack(callback: (track: MediaStreamTrack) => void): void;
    destroy(): void;
}
