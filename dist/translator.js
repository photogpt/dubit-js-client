"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translator = void 0;
const daily_js_1 = __importDefault(require("@daily-co/daily-js"));
//
// Translator allows you to translate audio from one language to another.
//
class Translator {
    constructor(params) {
        this.version = "latest";
        this.callObject = null;
        this.outputTrack = null;
        this.participantId = "";
        this.translatorId = "";
        this.onTranslatedTrackCallback = null;
        this.onCaptionsCallback = null;
        this.instanceId = params.instanceId;
        this.roomUrl = params.roomUrl;
        this.token = params.token;
        this.apiUrl = params.apiUrl;
        this.fromLang = params.fromLang;
        this.toLang = params.toLang;
        this.voiceType = params.voiceType;
        this.version = params.version || this.version;
        this.inputAudioTrack = params.inputAudioTrack;
        this.metadata = params.metadata
            ? safeSerializeMetadata(params.metadata)
            : {};
    }
    /**
     * Initialize the translator:
     * - Create a Call instance (with multiple-instance support)
     * - Join the room using the provided input audio track
     * - Register the local participant and add a translation bot via the API
     * - Set up event listeners for translated tracks and captions.
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.callObject = daily_js_1.default.createCallObject({
                    allowMultipleCallInstances: true,
                    videoSource: false,
                    subscribeToTracksAutomatically: false,
                });
            }
            catch (error) {
                console.error("Translator: Failed to create Daily call object", error);
                throw error;
            }
            try {
                // Determine the audio source to use.
                let audioSource = false;
                if (this.inputAudioTrack && this.inputAudioTrack.readyState === "live") {
                    audioSource = this.inputAudioTrack;
                }
                yield this.callObject.join({
                    url: this.roomUrl,
                    audioSource,
                    videoSource: false,
                    subscribeToTracksAutomatically: true,
                    startAudioOff: audioSource === false,
                });
            }
            catch (error) {
                console.error("Translator: Failed to join the Daily room", error);
                throw error;
            }
            // Retrieve local participant info.
            const participants = this.callObject.participants();
            if (!participants.local) {
                throw new Error("Translator: Failed to obtain local participant");
            }
            this.participantId = participants.local.session_id;
            try {
                yield this.registerParticipant(this.participantId);
                yield this.addTranslationBot(this.roomUrl, this.participantId, this.fromLang, this.toLang, this.voiceType);
            }
            catch (error) {
                console.error("Translator: Error registering participant or adding bot", error);
                throw error;
            }
            this.translatorId = yield this.fetchTranslationBotId(this.participantId);
            // Listen for translated audio track.
            this.callObject.on("track-started", (event) => {
                var _a;
                if (event.track.kind === "audio" &&
                    ((_a = event.participant) === null || _a === void 0 ? void 0 : _a.session_id) == this.translatorId) {
                    this.outputTrack = event.track;
                    if (this.onTranslatedTrackCallback) {
                        this.onTranslatedTrackCallback(this.outputTrack);
                    }
                }
            });
            // Listen for caption events with filtering.
            this.callObject.on("app-message", (event) => {
                const data = event.data;
                // Filter: ensure data exists, has the expected types, and is relevant to this translator.
                if (data &&
                    (data.type === "user-transcript" ||
                        data.type === "translation-transcript" ||
                        data.type === "user-interim-transcript") &&
                    data.participant_id === this.participantId) {
                    if (this.onCaptionsCallback) {
                        this.onCaptionsCallback(data);
                    }
                }
            });
            // Clear output track if a non-local participant (i.e. the bot) leaves.
            this.callObject.on("participant-left", (event) => {
                if (!event.participant.local && this.outputTrack) {
                    this.outputTrack = null;
                    console.error("Translator: Translation bot left; output track cleared");
                }
            });
        });
    }
    /**
     * Registers the local participant
     */
    registerParticipant(participantId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiUrl}/participant`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.token}`,
                    },
                    body: JSON.stringify({ id: participantId }),
                });
                if (!response.ok) {
                    throw new Error("Failed to register participant");
                }
            }
            catch (error) {
                console.error("Translator: Error registering participant", error);
                throw error;
            }
        });
    }
    /**
     * Adds a translation bot for the given participant.
     */
    addTranslationBot(roomUrl, participantId, fromLanguage, toLanguage, voiceType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiUrl}/meeting/bot/join`, {
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
                        metadata: this.metadata,
                    }),
                });
                if (!response.ok) {
                    throw new Error("Failed to add translation bot");
                }
            }
            catch (error) {
                console.error("Translator: Error adding translation bot", error);
                throw error;
            }
        });
    }
    fetchTranslationBotId(participantId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let translatorId = "";
                while (!translatorId) {
                    let botsDataResponse = yield fetch(`${this.apiUrl}/participant/${participantId}/bot`);
                    let json = yield botsDataResponse.json();
                    translatorId = (_b = (_a = json === null || json === void 0 ? void 0 : json.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id; // For now, we only support one bot per participant.
                    yield new Promise((resolve) => setTimeout(resolve, 1000));
                }
                return translatorId;
            }
            catch (err) {
                console.error("Translator: Error fetching translator id", err);
                throw err;
            }
        });
    }
    /**
     * Registers a callback to be invoked when the translated audio track is available.
     */
    onTranslatedTrackReady(callback) {
        this.onTranslatedTrackCallback = callback;
        if (this.outputTrack) {
            callback(this.outputTrack);
        }
    }
    /**
     * Registers a callback for caption events.
     */
    onCaptions(callback) {
        this.onCaptionsCallback = callback;
    }
    /**
     * Allows updating the input audio track.
     */
    updateInputTrack(newInputTrack) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.callObject) {
                throw new Error("Translator: callObject not initialized");
            }
            if (!newInputTrack) {
                yield this.callObject.setInputDevicesAsync({ audioSource: false });
                return;
            }
            this.callObject.setLocalAudio(true);
            if (newInputTrack.readyState === "ended") {
                const stream = yield navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: newInputTrack.id },
                });
                newInputTrack = stream.getAudioTracks()[0];
            }
            this.inputAudioTrack = newInputTrack;
            yield this.callObject.setInputDevicesAsync({ audioSource: newInputTrack });
        });
    }
    /**
     * Returns the local participant's session_id
     */
    getParticipantId() {
        return this.participantId;
    }
    /**
     * Returns the currently available translated audio track, if any.
     */
    getTranslatedTrack() {
        return this.outputTrack;
    }
    /**
     * Clean up the Daily call instance and event listeners.
     */
    destroy() {
        if (this.callObject) {
            this.callObject.leave();
            this.callObject.destroy();
            this.callObject = null;
        }
        // Invoke onDestroy callback for parent cleanup.
        if (this.onDestroy) {
            this.onDestroy();
        }
    }
}
exports.Translator = Translator;
//
// Helper: Safely serialize metadata (removing potential circular references)
//
function safeSerializeMetadata(metadata) {
    try {
        JSON.stringify(metadata);
        return metadata;
    }
    catch (error) {
        console.error("Metadata serialization error; falling back to empty object.", error);
        return {};
    }
}
