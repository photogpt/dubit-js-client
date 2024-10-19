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
class Dubit {
    constructor({ apiUrl = "https://agents.dubit.live", useMic = false, inputTrack = null, token, fromLanguage, toLanguage, voiceType = "female", }) {
        this.apiUrl = apiUrl;
        this.useMic = useMic;
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
                if (this.useMic) {
                    // Use the microphone as the audio input
                    const localStream = yield navigator.mediaDevices.getUserMedia({
                        audio: true,
                    });
                    audioSource = localStream.getAudioTracks()[0];
                }
                else if (this.inputTrack) {
                    // Use the provided MediaStreamTrack as the audio input
                    audioSource = this.inputTrack;
                }
                else {
                    throw new Error("No audio input provided");
                }
                yield this.callObject
                    .join({
                    url: roomUrl,
                    audioSource: audioSource,
                    videoSource: false,
                    subscribeToTracksAutomatically: true,
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
    // Method to retrieve the translated audio track
    getTranslatedTrack() {
        return this.outputTrack;
    }
    // Allow the user to provide a callback for when the translated track is available
    onTranslatedTrack(callback) {
        this.onTranslatedTrackCallback = callback;
    }
    // Clean up
    destroy() {
        if (this.callObject) {
            this.callObject.leave();
            this.callObject.destroy();
            this.callObject = null;
        }
    }
}
exports.default = Dubit;
