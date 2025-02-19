type CaptionEvent = {
    participant_id: string;
    timestamp: string;
    transcript: string;
    type: string;
};
type DubitCreateParams = {
    token: string;
    apiUrl?: string;
};
type TranslatorParams = {
    fromLang: string;
    toLang: string;
    voiceType: "male" | "female";
    version?: string;
    inputAudioTrack: MediaStreamTrack | null;
    metadata?: Record<string, any>;
};

declare class Translator {
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
    private outputTrack;
    private participantId;
    private translatorId;
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
    });
    /**
     * Initialize the translator:
     * - Create a Call instance (with multiple-instance support)
     * - Join the room using the provided input audio track
     * - Register the local participant and add a translation bot via the API
     * - Set up event listeners for translated tracks and captions.
     */
    init(): Promise<void>;
    /**
     * Registers the local participant
     */
    private registerParticipant;
    /**
     * Adds a translation bot for the given participant.
     */
    private addTranslationBot;
    private fetchTranslationBotId;
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
     * Returns the local participant's session_id
     */
    getParticipantId(): string;
    /**
     * Returns the currently available translated audio track, if any.
     */
    getTranslatedTrack(): MediaStreamTrack | null;
    /**
     * Clean up the Daily call instance and event listeners.
     */
    destroy(): void;
}

/**
 * Represents a language with its code and label.
 *
 * @example
 * const englishUS: LanguageType = {
 *   langCode: 'en-US',
 *   label: 'English (United States)'
 * };
 *
 * const french: LanguageType = {
 *   langCode: 'fr',
 *   label: 'French'
 * };
 */
type LanguageType = {
    langCode: string;
    label: string;
};

/**
 * Creates and returns a new DubitInstance
 */
declare function createNewInstance({ token, apiUrl, }: DubitCreateParams): Promise<DubitInstance>;
declare class DubitInstance {
    instanceId: string;
    private roomUrl;
    ownerToken: string;
    private apiUrl;
    private activeTranslators;
    constructor(instanceId: string, roomUrl: string, ownerToken: string, apiUrl: string);
    private validateTranslatorParams;
    /**
     * Creates a new translator bot (with its own call instance)
     */
    addTranslator(params: TranslatorParams): Promise<Translator>;
}
declare function getSupportedFromLanguages(): LanguageType[];
declare function getSupportedToLanguages(): LanguageType[];
declare function getCompleteTranscript({ instanceId, token, apiUrl, }: {
    instanceId: string;
    token: string;
    apiUrl?: string;
}): Promise<any>;

export { type CaptionEvent, type DubitCreateParams, DubitInstance, Translator, type TranslatorParams, createNewInstance, getCompleteTranscript, getSupportedFromLanguages, getSupportedToLanguages };
