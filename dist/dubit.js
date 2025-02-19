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
const daily_js_1 = __importDefault(require("@daily-co/daily-js"));
const API_URL = process.env.VITE_DUBIT_API_URL;
class Dubit {
    constructor({ apiUrl = API_URL, inputTrack = null, token, fromLanguage, toLanguage, voiceType = "female", }) {
        this.apiUrl = apiUrl;
        this.inputTrack = inputTrack;
        this.token = token;
        this.fromLanguage = fromLanguage;
        this.toLanguage = toLanguage;
        this.voiceType = voiceType;
        this.callObject = null;
        this.outputTrack = null;
        this.onTranslatedTrackCallback = null;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.callObject = daily_js_1.default.createCallObject({
                    allowMultipleCallInstances: true,
                });
                this.validateConfig();
                const roomUrl = yield this.getDailyRoomUrl(this.token);
                if (!roomUrl) {
                    throw new Error("Failed to obtain room URL");
                }
                let audioSource = null;
                if (this.inputTrack) {
                    // Check if the input track is in "ended" state, which means microphone is initially off
                    // MediaStreamTrack.readyState can be "live", "ended", or "stopped"
                    if (this.inputTrack.readyState === "ended") {
                        // Microphone is off, so disable audio in Daily call:
                        audioSource = null;
                        this.callObject.setLocalAudio(false);
                        yield this.callObject.setInputDevicesAsync({
                            audioSource: false,
                        });
                    }
                    // If track is active and streaming audio ("live" state)
                    if (this.inputTrack.readyState === "live") {
                        audioSource = this.inputTrack;
                    }
                }
                else {
                    // No input track provided, disable audio input
                    audioSource = null;
                    this.updateInputTrack(null);
                }
                yield this.joinDailyRoom(roomUrl, audioSource, audioSource ? false : true);
                // Listen for new audio tracks (translated audio)
                this.callObject.on("track-started", (event) => {
                    var _a;
                    // for now, only other participant is the bot; in future make this strict using participant.session_id
                    if (event.track.kind === "audio" && !((_a = event.participant) === null || _a === void 0 ? void 0 : _a.local)) {
                        console.log("Dubit:: new remote audio track");
                        this.outputTrack = event.track;
                        if (this.onTranslatedTrackCallback && this.outputTrack) {
                            this.onTranslatedTrackCallback(this.outputTrack);
                        }
                        else {
                            console.error("Dubit:: no track callback; please call onTranslatedTrack() and use the track for playing the translated audio");
                        }
                    }
                });
                this.callObject.on("participant-left", (event) => {
                    if (!event.participant.local && this.outputTrack) {
                        this.outputTrack = null;
                        console.error("Dubit:: translation errored; translator left;");
                    }
                });
            }
            catch (error) {
                console.error("Dubit::", error);
            }
        });
    }
    // Validate the configuration; for e.g, token, language codes, etc.
    validateConfig() {
        // For now, we assume the configuration is valid
    }
    getDailyRoomUrl(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiUrl}/meeting/new-meeting`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch room URL");
                }
                const data = yield response.json();
                return data.roomUrl;
            }
            catch (error) {
                console.error("Dubit:", error);
                return null;
            }
        });
    }
    addTranslationBot(roomUrl, participantId, fromLanguage, toLanguage, voiceType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fetch(`${this.apiUrl}/meeting/bot/join`, {
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
                    }),
                });
            }
            catch (error) {
                console.error("Dubit:: Error adding translation bot:", error);
            }
        });
    }
    registerParticipant(participantId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fetch(`${this.apiUrl}/participant`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.token}`,
                    },
                    body: JSON.stringify({
                        id: participantId,
                    }),
                });
            }
            catch (error) {
                console.error("Dubit:: Error registering participant:", error);
            }
        });
    }
    joinDailyRoom(roomUrl, audioSource, startAudioOff) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.callObject) {
                throw new Error("Call object not initialized");
            }
            yield this.callObject
                .join({
                url: roomUrl,
                /**  Configure audio source for Daily call:
                 * - If audioSource exists, use the MediaStreamTrack
                 * - If null/undefined, disable audio by setting to false
                 * See: https://docs.daily.co/reference/daily-js/factory-methods/create-call-object
                 */
                audioSource: audioSource || false,
                videoSource: false,
                subscribeToTracksAutomatically: true,
                startAudioOff: startAudioOff, //Ensures the Daily call starts with microphone disabled when startAudioOff is true
            })
                .then((e) => __awaiter(this, void 0, void 0, function* () {
                if (e) {
                    yield this.registerParticipant(e.local.session_id);
                    yield this.addTranslationBot(roomUrl, e.local.session_id, this.fromLanguage, this.toLanguage, this.voiceType);
                }
            }))
                .catch((error) => {
                console.error("Dubit:", error);
            });
        });
    }
    // Method to retrieve the translated audio track
    getTranslatedTrack() {
        return this.outputTrack;
    }
    // Allow the user to provide a callback for when the translated track is available
    onTranslatedTrack(callback) {
        this.onTranslatedTrackCallback = callback;
    }
    //Captions
    onCaptions(callback) {
        if (!this.callObject) {
            throw new Error("Dubit:: callObject is not initialized");
        }
        // Subscribe to the 'app-message' event
        this.callObject.on("app-message", (event) => {
            const { type } = event.data;
            if (type === "user-transcript" || type === "translation-transcript") {
                callback(event);
            }
        });
    }
    updateInputTrack(newInputTrack) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.callObject) {
                throw new Error("Call object not initialized");
            }
            if (!newInputTrack) {
                // If the new input track is null, we need to disable the microphone in Daily Call.
                yield this.callObject.setInputDevicesAsync({
                    audioSource: false,
                });
                return;
            }
            // Enable the microphone
            this.callObject.setLocalAudio(true);
            /**
             *  When toggling the microphone, the audio track may occasionally be in an 'ended' state, rendering it unable to transmit audio.
             * To resolve this, a new active audio stream is created using the same device ID.
             * This process disconnects the old track and then establish a new one.
             */
            if (newInputTrack.readyState === "ended") {
                const stream = yield navigator.mediaDevices.getUserMedia({
                    audio: {
                        deviceId: newInputTrack.id,
                    },
                });
                newInputTrack = stream.getAudioTracks()[0];
            }
            this.inputTrack = newInputTrack;
            yield this.callObject.setInputDevicesAsync({
                audioSource: newInputTrack,
            });
            console.log("newInputTrack", newInputTrack);
        });
    }
    destroy() {
        if (this.callObject) {
            this.callObject.leave();
            this.callObject.destroy();
            this.callObject = null;
        }
    }
}
exports.default = Dubit;
