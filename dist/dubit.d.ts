export type CaptionEvent = {
    participant_id: string;
    timestamp: string;
    transcript: string;
    type: string;
};
/**
 * For now, only API_KEY is supported as a token.
 * To generate, go to https://www.dubit.live/dashboard/account?selectedTab=apikey
 */
export type DubitCreateParams = {
    token: string;
    apiUrl?: string;
    loggerCallback?: ((log: DubitLog) => void) | null;
};
export type TranslatorParams = {
    fromLang: string;
    toLang: string;
    voiceType: "male" | "female";
    version?: string;
    keywords?: boolean;
    hqVoices?: boolean;
    translationBeep?: boolean;
    inputAudioTrack: MediaStreamTrack | null;
    metadata?: Record<string, any>;
    outputDeviceId?: string;
};
export type LanguageType = {
    langCode: string;
    label: string;
};
export type DubitLog = {
    level: "error" | "warn" | "info" | "debug";
    className: string;
    message: string;
    data?: any;
    timestamp: string;
};
export declare function createNewInstance({ token, apiUrl, loggerCallback, }: DubitCreateParams): Promise<DubitInstance>;
export declare function getSupportedLanguages(): LanguageType[];
export declare function getCompleteTranscript({ instanceId, token, apiUrl, }: {
    instanceId: string;
    token: string;
    apiUrl?: string;
}): Promise<any>;
export declare class DubitInstance {
    instanceId: string;
    private roomUrl;
    ownerToken: string;
    private apiUrl;
    private activeTranslators;
    private loggerCallback;
    constructor(instanceId: string, roomUrl: string, ownerToken: string, apiUrl: string);
    setLoggerCallback(callback: ((log: DubitLog) => void) | null): void;
    /**
     * Internal logging method for DubitInstance and its children.
     */
    _log(level: "error" | "warn" | "info" | "debug", className: string, message: string, data?: any): void;
    addTranslator(params: TranslatorParams): Promise<Translator>;
}
export declare class Translator {
    private instanceId;
    private roomUrl;
    private token;
    private apiUrl;
    private fromLang;
    private toLang;
    private voiceType;
    private version;
    private keywords;
    private translationBeep;
    private hqVoices;
    private inputAudioTrack;
    private metadata?;
    private callObject;
    private translatedTrack;
    private participantId;
    private participantTracks;
    private outputDeviceId;
    private loggerCallback;
    private onTranslatedTrackCallback;
    private onCaptionsCallback;
    onDestroy?: () => void;
    getInstanceId: () => string;
    constructor(params: {
        instanceId: string;
        roomUrl: string;
        token: string;
        apiUrl: string;
        loggerCallback?: ((log: DubitLog) => void) | null;
    } & TranslatorParams);
    /**
     * Internal logging method for Translator.
     */
    private _log;
    private _getTranslatorLabel;
    init(): Promise<void>;
    private registerParticipant;
    private addTranslationBot;
    onTranslatedTrackReady(callback: (translatedTrack: MediaStreamTrack) => void): void;
    onCaptions(callback: (caption: CaptionEvent) => void): void;
    updateInputTrack(newInputTrack: MediaStreamTrack | null): Promise<void>;
    getParticipantId(): string;
    getTranslatedTrack(): MediaStreamTrack | null;
    destroy(): void;
}
/**
 * Routes a WebRTC audio track to a specific output device using WebAudio
 * This implementation avoids the WebRTC track mixing issue by using the WebAudio API
 */
export declare function routeTrackToDevice(track: MediaStreamTrack, outputDeviceId: string, elementId: string): object;
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
export declare const SUPPORTED_TRANSLATOR_VERSIONS: VersionType[];
export declare const SUPPORTED_LANGUAGES: LanguageType[];
//# sourceMappingURL=dubit.d.ts.map