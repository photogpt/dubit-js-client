"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompleteTranscript = exports.getSupportedToLanguages = exports.getSupportedFromLanguages = exports.DubitInstance = exports.createNewInstance = void 0;
const constants_1 = require("./constants");
const translator_1 = require("./translator");
const API_URL = process.env.DUBIT_API_URL;
/**
 * Creates and returns a new DubitInstance
 */
function createNewInstance({ token, apiUrl = API_URL, }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${apiUrl}/meeting/new-meeting`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to create meeting room");
            }
            const data = yield response.json();
            const instanceId = data.meeting_id;
            const roomUrl = data.roomUrl;
            return new DubitInstance(instanceId, roomUrl, token, apiUrl);
        }
        catch (error) {
            console.error("dubit.createNewInstance error:", error);
            throw error;
        }
    });
}
exports.createNewInstance = createNewInstance;
//
// The Dubit Instance, tracks all active translators
//
class DubitInstance {
    constructor(instanceId, roomUrl, ownerToken, apiUrl) {
        this.activeTranslators = new Map();
        this.instanceId = instanceId;
        this.roomUrl = roomUrl;
        this.ownerToken = ownerToken;
        this.apiUrl = apiUrl;
    }
    validateTranslatorParams(params) {
        if (!constants_1.SUPPORTED_FROM_LANGUAGES.map((x) => x.langCode).includes(params.fromLang)) {
            return new Error(`Unsupported fromLang: ${params.fromLang}. Supported from languages: ${constants_1.SUPPORTED_FROM_LANGUAGES.map((x) => x.langCode)}`);
        }
        if (!constants_1.SUPPORTED_TO_LANGUAGES.map((x) => x.langCode).includes(params.toLang)) {
            return new Error(`Unsupported toLang: ${params.toLang}. Supported to languages: ${constants_1.SUPPORTED_TO_LANGUAGES.map((x) => x.langCode)}`);
        }
        if (params.voiceType !== "male" && params.voiceType !== "female") {
            return new Error(`Unsupported voiceType: ${params.voiceType}. Supported voice types: male, female`);
        }
        if (params.inputAudioTrack === null) {
            return new Error("inputAudioTrack is required");
        }
        if (params.version &&
            !constants_1.SUPPORTED_TRANSLATOR_VERSIONS.map((x) => x.version).includes(params.version)) {
            return new Error(`Unsupported version: ${params.version}. Supported versions: ${constants_1.SUPPORTED_TRANSLATOR_VERSIONS}`);
        }
        return null;
    }
    /**
     * Creates a new translator bot (with its own call instance)
     */
    addTranslator(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationError = this.validateTranslatorParams(params);
            if (validationError) {
                return Promise.reject(validationError);
            }
            const translator = new translator_1.Translator(Object.assign({ instanceId: this.instanceId, roomUrl: this.roomUrl, token: this.ownerToken, apiUrl: this.apiUrl }, params));
            // Set up cleanup callback to remove from this.translators when destroyed
            translator.onDestroy = () => {
                this.activeTranslators.delete(translator.getParticipantId());
            };
            yield translator.init();
            this.activeTranslators.set(translator.getParticipantId(), translator);
            return translator;
        });
    }
}
exports.DubitInstance = DubitInstance;
function getSupportedFromLanguages() {
    return constants_1.SUPPORTED_FROM_LANGUAGES;
}
exports.getSupportedFromLanguages = getSupportedFromLanguages;
function getSupportedToLanguages() {
    return constants_1.SUPPORTED_TO_LANGUAGES;
}
exports.getSupportedToLanguages = getSupportedToLanguages;
function getCompleteTranscript({ instanceId, token, apiUrl = API_URL, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${apiUrl}/meeting/transcript?instanceId=${encodeURIComponent(instanceId)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch complete transcript");
        }
        return response.json();
    });
}
exports.getCompleteTranscript = getCompleteTranscript;
//
// Default export for ease-of-use (import dubit from '@taic/dubit')
//
exports.default = {
    createNewInstance,
    getSupportedFromLanguages,
    getSupportedToLanguages,
    getCompleteTranscript,
};
__exportStar(require("./types"), exports);
__exportStar(require("./translator"), exports);
