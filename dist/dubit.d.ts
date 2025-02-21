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
    outputDeviceId?: string;
};
export type LanguageType = {
    langCode: string;
    label: string;
};
export declare function createNewInstance({ token, apiUrl, }: DubitCreateParams): Promise<DubitInstance>;
export declare function getSupportedFromLanguages(): LanguageType[];
export declare function getSupportedToLanguages(): LanguageType[];
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
    constructor(instanceId: string, roomUrl: string, ownerToken: string, apiUrl: string);
    private validateTranslatorParams;
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
    private inputAudioTrack;
    private metadata?;
    private callObject;
    private translatedTrack;
    private participantId;
    private translatorId;
    private participantTracks;
    private outputDeviceId;
    private onTranslatedTrackCallback;
    private onCaptionsCallback;
    onDestroy?: () => void;
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
        outputDeviceId?: string;
    });
    init(): Promise<void>;
    private registerParticipant;
    private addTranslationBot;
    private fetchTranslationBotId;
    onTranslatedTrackReady(callback: (translatedTrack: MediaStreamTrack) => void): void;
    onCaptions(callback: (caption: CaptionEvent) => void): void;
    updateInputTrack(newInputTrack: MediaStreamTrack | null): Promise<void>;
    getParticipantId(): string;
    getTranslatedTrack(): MediaStreamTrack | null;
    destroy(): void;
}
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
export declare const SUPPORTED_FROM_LANGUAGES: LanguageType[];
export declare const SUPPORTED_TO_LANGUAGES: LanguageType[];
//# sourceMappingURL=dubit.d.ts.map