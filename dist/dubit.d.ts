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
export type DubitCreateResponse = {
    instanceId: string;
    ownerToken: string;
};
export type TranslatorParams = {
    fromLang: string;
    toLang: string;
    voiceType: "male" | "female";
    inputAudioTrack: MediaStreamTrack | null;
    metadata?: Record<string, any>;
};
export declare function getSupportedLanguages(): Promise<string[]>;
export declare function getCompleteTranscript({ instanceId, token, apiUrl, }: {
    instanceId: string;
    token: string;
    apiUrl?: string;
}): Promise<any>;
export declare class DubitInstance {
    instanceId: string;
    ownerToken: string;
    private apiUrl;
    private translators;
    constructor(instanceId: string, ownerToken: string, apiUrl: string);
    /**
     * Creates a new translator bot (with its own Daily call instance)
     */
    addTranslator(params: TranslatorParams): Promise<Translator>;
}
/**
 * Creates a new Dubit instance (i.e. creates a room via your API)
 */
export declare function create({ token, apiUrl, }: DubitCreateParams): Promise<DubitInstance>;
export declare class Translator {
    private instanceId;
    private token;
    private apiUrl;
    private fromLang;
    private toLang;
    private voiceType;
    private inputAudioTrack;
    private metadata?;
    private callObject;
    private outputTrack;
    private translatorId;
    private onTranslatedTrackCallback;
    private onCaptionsCallback;
    onDestroy?: () => void;
    constructor(params: {
        instanceId: string;
        token: string;
        apiUrl: string;
        fromLang: string;
        toLang: string;
        voiceType: "male" | "female";
        inputAudioTrack: MediaStreamTrack | null;
        metadata?: Record<string, any>;
    });
    /**
     * Initialize the translator:
     * - Create a Daily call instance (with multiple-instance support)
     * - Join the room using the provided input audio track
     * - Register the local participant and add a translation bot via the API
     * - Set up event listeners for translated tracks and captions.
     */
    init(): Promise<void>;
    /**
     * Registers the local participant via your API.
     */
    private registerParticipant;
    /**
     * Adds a translation bot via your API for the given participant.
     */
    private addTranslationBot;
    /**
     * Registers a callback to be invoked when the translated audio track is available.
     */
    onTranslatedTrackReady(callback: (translatedTrack: MediaStreamTrack) => void): void;
    /**
     * Registers a callback for caption events.
     */
    onCaptions(callback: (caption: CaptionEvent) => void): void;
    /**
     * Allows updating the input audio track.
     */
    updateInputTrack(newInputTrack: MediaStreamTrack | null): Promise<void>;
    /**
     * Returns the translator's ID (local participant's session_id).
     */
    getTranslatorId(): string;
    /**
     * Returns the currently available translated audio track, if any.
     */
    getTranslatedTrack(): MediaStreamTrack | null;
    /**
     * Clean up the Daily call instance and event listeners.
     */
    destroy(): void;
}
declare const _default: {
    create: typeof create;
    getSupportedLanguages: typeof getSupportedLanguages;
    getCompleteTranscript: typeof getCompleteTranscript;
};
export default _default;
