import { DailyNetworkStats } from '@daily-co/daily-js';
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
    loggerCallback?: ((log: DubitUserLog) => void) | null;
};
export type NetworkStats = DailyNetworkStats;
export type TranslatorParams = {
    fromLang: string;
    toLang: string;
    voiceType: 'male' | 'female';
    version?: string;
    keywords?: boolean;
    hqVoices?: boolean;
    translationBeep?: boolean;
    inputAudioTrack: MediaStreamTrack | null;
    metadata?: Record<string, any>;
    outputDeviceId?: string;
    onTranslatedTrackReady?: (track: MediaStreamTrack) => void;
    onCaptions?: (caption: CaptionEvent) => void;
    onNetworkQualityChange?: (stats: NetworkStats) => void;
};
export type LanguageType = {
    langCode: string;
    label: string;
};
interface DubitLogEventDef {
    readonly code: string;
    readonly level: 'error' | 'warn' | 'info' | 'debug';
    readonly userMessage: string;
    readonly description: string;
}
export interface DubitUserLog {
    eventCode: string;
    level: 'error' | 'warn' | 'info' | 'debug';
    userMessage: string;
    className: string;
    timestamp: string;
    internalData?: any;
    error?: Error;
}
export declare function createNewInstance({ token, apiUrl, loggerCallback, }: DubitCreateParams): Promise<DubitInstance>;
export declare function getSupportedLanguages(): LanguageType[];
export declare function validateApiKey(apiKey: string): Promise<boolean>;
export declare function getCompleteTranscript({ instanceId, token, apiUrl, }: {
    instanceId: string;
    token: string;
    apiUrl?: string;
}): Promise<any>;
export declare class DubitInstance {
    instanceId: string;
    private roomUrl;
    token: string;
    private apiUrl;
    private activeTranslators;
    private loggerCallback;
    constructor(instanceId: string, roomUrl: string, token: string, apiUrl: string);
    setLoggerCallback(callback: ((log: DubitUserLog) => void) | null): void;
    _log(eventDef: DubitLogEventDef, internalData?: any, originalError?: Error, messageParams?: Record<string, any>): void;
    addTranslator(params: TranslatorParams): Promise<Translator>;
    getActiveTranslators(): Map<string, Translator>;
    getRoomId(): string;
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
    private translatorParticipantId;
    private outputDeviceId;
    private loggerCallback;
    private onTranslatedTrackCallback;
    private onCaptionsCallback;
    private onNetworkQualityChangeCallback;
    onDestroy?: () => void;
    getInstanceId: () => string;
    constructor(params: {
        instanceId: string;
        roomUrl: string;
        token: string;
        apiUrl: string;
        loggerCallback?: ((log: DubitUserLog) => void) | null;
    } & TranslatorParams);
    private _log;
    private _getTranslatorLabel;
    init(): Promise<void>;
    private handleTrackStarted;
    private handleParticipantJoined;
    private handleAppMessage;
    private handleParticipantLeft;
    private handleNetworkQualityChange;
    private registerParticipant;
    private addTranslationBot;
    onTranslatedTrackReady(callback: (translatedTrack: MediaStreamTrack) => void): void;
    onCaptions(callback: (caption: CaptionEvent) => void): void;
    updateInputTrack(newInputTrack: MediaStreamTrack | null): Promise<void>;
    getParticipantId(): string;
    getTranslatedTrack(): MediaStreamTrack | null;
    getNetworkStats(): Promise<NetworkStats>;
    getTranslatorVolumeLevel(): number;
    destroy(): Promise<void>;
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
export declare const DubitLogEvents: {
    readonly INSTANCE_CREATING: {
        readonly code: "INSTANCE_CREATING";
        readonly level: "info";
        readonly userMessage: "Connecting to Dubit service...";
        readonly description: "Attempting to fetch initial meeting details from the API.";
    };
    readonly INSTANCE_CREATED: {
        readonly code: "INSTANCE_CREATED";
        readonly level: "info";
        readonly userMessage: "Dubit service connected.";
        readonly description: "Successfully created the DubitInstance after API confirmation.";
    };
    readonly INSTANCE_CREATE_FAILED: {
        readonly code: "INSTANCE_CREATE_FAILED";
        readonly level: "error";
        readonly userMessage: "Failed to connect to Dubit service. Please check connection or token.";
        readonly description: "Error occurred during the API call to create a new meeting instance.";
    };
    readonly LOGGER_CALLBACK_SET: {
        readonly code: "LOGGER_CALLBACK_SET";
        readonly level: "debug";
        readonly userMessage: "Logger configured.";
        readonly description: "The logger callback function has been successfully set or updated.";
    };
    readonly LOGGER_CALLBACK_INVALID: {
        readonly code: "LOGGER_CALLBACK_INVALID";
        readonly level: "warn";
        readonly userMessage: "Invalid logger configuration provided.";
        readonly description: "An invalid value was provided for the logger callback.";
    };
    readonly TRANSLATOR_ADDING: {
        readonly code: "TRANSLATOR_ADDING";
        readonly level: "info";
        readonly userMessage: "Adding translator...";
        readonly description: "Starting the process to add a new Translator instance.";
    };
    readonly TRANSLATOR_INITIALIZING: {
        readonly code: "TRANSLATOR_INITIALIZING";
        readonly level: "info";
        readonly userMessage: "Initializing translation session...";
        readonly description: "Creating the underlying call object and preparing to join the room.";
    };
    readonly TRANSLATOR_INIT_FAILED_CALL_OBJECT: {
        readonly code: "TRANSLATOR_INIT_FAILED_CALL_OBJECT";
        readonly level: "error";
        readonly userMessage: "Failed to create translation session component.";
        readonly description: "Error creating the Daily call object.";
    };
    readonly TRANSLATOR_JOINING_ROOM: {
        readonly code: "TRANSLATOR_JOINING_ROOM";
        readonly level: "info";
        readonly userMessage: "Connecting to translation room...";
        readonly description: "Attempting to join the Daily room.";
    };
    readonly TRANSLATOR_JOIN_FAILED: {
        readonly code: "TRANSLATOR_JOIN_FAILED";
        readonly level: "error";
        readonly userMessage: "Failed to connect to translation room.";
        readonly description: "Error joining the Daily room.";
    };
    readonly TRANSLATOR_REGISTERING: {
        readonly code: "TRANSLATOR_REGISTERING";
        readonly level: "debug";
        readonly userMessage: "Registering translator participant...";
        readonly description: "Calling the API to register the local participant for translation.";
    };
    readonly TRANSLATOR_REGISTER_FAILED: {
        readonly code: "TRANSLATOR_REGISTER_FAILED";
        readonly level: "error";
        readonly userMessage: "Failed to register translator participant.";
        readonly description: "Error during the participant registration API call.";
    };
    readonly TRANSLATOR_REQUESTING: {
        readonly code: "TRANSLATOR_REQUESTING";
        readonly level: "info";
        readonly userMessage: "Requesting translator from {fromLang} to {toLang}...";
        readonly description: "Calling the API to request the translator service to join the room.";
    };
    readonly TRANSLATOR_REQUEST_FAILED: {
        readonly code: "TRANSLATOR_REQUEST_FAILED";
        readonly level: "error";
        readonly userMessage: "Failed to request {fromLang} to {toLang} translator.";
        readonly description: "Error during the API call to add the translation service.";
    };
    readonly TRANSLATOR_PARTICIPANT_JOINED: {
        readonly code: "TRANSLATOR_PARTICIPANT_JOINED";
        readonly level: "debug";
        readonly userMessage: "Translator participant connected.";
        readonly description: "The remote translator participant has joined the Daily room.";
    };
    readonly TRANSLATOR_TRACK_READY: {
        readonly code: "TRANSLATOR_TRACK_READY";
        readonly level: "info";
        readonly userMessage: "Translator ready ({fromLang} to {toLang}).";
        readonly description: "The translated audio track from the translator service is now available.";
    };
    readonly TRANSLATOR_CAPTIONS_READY: {
        readonly code: "TRANSLATOR_CAPTIONS_READY";
        readonly level: "debug";
        readonly userMessage: "Captions callback configured.";
        readonly description: "The caption callback has been set by the user.";
    };
    readonly TRANSLATOR_INIT_COMPLETE: {
        readonly code: "TRANSLATOR_INIT_COMPLETE";
        readonly level: "info";
        readonly userMessage: "Translator initialized.";
        readonly description: "The core initialization process for the translator completed successfully (service requested, event listeners set).";
    };
    readonly TRANSLATOR_PARTICIPANT_LEFT: {
        readonly code: "TRANSLATOR_PARTICIPANT_LEFT";
        readonly level: "warn";
        readonly userMessage: "Translator participant disconnected.";
        readonly description: "The remote translator participant has left the room.";
    };
    readonly TRANSLATOR_DESTROYED: {
        readonly code: "TRANSLATOR_DESTROYED";
        readonly level: "info";
        readonly userMessage: "Translator stopped.";
        readonly description: "The translator instance has been destroyed and left the room.";
    };
    readonly TRANSLATOR_REMOVED: {
        readonly code: "TRANSLATOR_REMOVED";
        readonly level: "info";
        readonly userMessage: "Translator removed from instance.";
        readonly description: "Translator instance removed from the DubitInstance active translators map.";
    };
    readonly INPUT_TRACK_UPDATING: {
        readonly code: "INPUT_TRACK_UPDATING";
        readonly level: "debug";
        readonly userMessage: "Updating audio input...";
        readonly description: "Attempting to update the input audio track for the translator.";
    };
    readonly INPUT_TRACK_UPDATED: {
        readonly code: "INPUT_TRACK_UPDATED";
        readonly level: "info";
        readonly userMessage: "Audio input updated.";
        readonly description: "Successfully updated the input audio track.";
    };
    readonly INPUT_TRACK_UPDATE_FAILED: {
        readonly code: "INPUT_TRACK_UPDATE_FAILED";
        readonly level: "error";
        readonly userMessage: "Failed to update audio input.";
        readonly description: "An error occurred while updating the input audio track.";
    };
    readonly INPUT_TRACK_ENDED_RECOVERING: {
        readonly code: "INPUT_TRACK_ENDED_RECOVERING";
        readonly level: "warn";
        readonly userMessage: "Audio input ended unexpectedly, attempting recovery...";
        readonly description: "The provided input track ended; attempting to get a new one via getUserMedia.";
    };
    readonly INPUT_TRACK_RECOVERY_FAILED: {
        readonly code: "INPUT_TRACK_RECOVERY_FAILED";
        readonly level: "error";
        readonly userMessage: "Failed to recover audio input.";
        readonly description: "Failed to get a new audio track via getUserMedia after the previous one ended.";
    };
    readonly INTERNAL_ERROR: {
        readonly code: "INTERNAL_ERROR";
        readonly level: "error";
        readonly userMessage: "An internal error occurred.";
        readonly description: "An unexpected error occurred within the SDK.";
    };
};
export {};
//# sourceMappingURL=dubit.d.ts.map