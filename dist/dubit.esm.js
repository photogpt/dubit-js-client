import Daily from '@daily-co/daily-js';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var API_URL = "https://test-api.dubit.live";
function createNewInstance(_a) {
  var token = _a.token,
    _b = _a.apiUrl,
    apiUrl = _b === void 0 ? API_URL : _b;
  return __awaiter(this, void 0, void 0, function () {
    var response, data, instanceId, roomUrl, error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 3,, 4]);
          return [4 /*yield*/, fetch("".concat(apiUrl, "/meeting/new-meeting"), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer ".concat(token)
            }
          })];
        case 1:
          response = _c.sent();
          if (!response.ok) {
            throw new Error("Failed to create meeting room");
          }
          return [4 /*yield*/, response.json()];
        case 2:
          data = _c.sent();
          instanceId = data.meeting_id;
          roomUrl = data.roomUrl;
          return [2 /*return*/, new DubitInstance(instanceId, roomUrl, token, apiUrl)];
        case 3:
          error_1 = _c.sent();
          console.error("dubit.createNewInstance error:", error_1);
          throw error_1;
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function getSupportedFromLanguages() {
  return SUPPORTED_FROM_LANGUAGES;
}
function getSupportedToLanguages() {
  return SUPPORTED_TO_LANGUAGES;
}
function getCompleteTranscript(_a) {
  var instanceId = _a.instanceId,
    token = _a.token,
    _b = _a.apiUrl,
    apiUrl = _b === void 0 ? API_URL : _b;
  return __awaiter(this, void 0, void 0, function () {
    var response;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, fetch("".concat(apiUrl, "/meeting/").concat(instanceId, "/transcripts"), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer ".concat(token)
            }
          })];
        case 1:
          response = _c.sent();
          if (!response.ok) {
            throw new Error("Failed to fetch complete transcript");
          }
          return [2 /*return*/, response.json()];
      }
    });
  });
}
var DubitInstance = /** @class */function () {
  function DubitInstance(instanceId, roomUrl, ownerToken, apiUrl) {
    this.activeTranslators = new Map();
    this.instanceId = instanceId;
    this.roomUrl = roomUrl;
    this.ownerToken = ownerToken;
    this.apiUrl = apiUrl;
  }
  DubitInstance.prototype.validateTranslatorParams = function (params) {
    if (!SUPPORTED_FROM_LANGUAGES.map(function (x) {
      return x.langCode;
    }).includes(params.fromLang)) {
      return new Error("Unsupported fromLang: ".concat(params.fromLang, ". Supported from languages: ").concat(SUPPORTED_FROM_LANGUAGES.map(function (x) {
        return x.langCode;
      })));
    }
    if (!SUPPORTED_TO_LANGUAGES.map(function (x) {
      return x.langCode;
    }).includes(params.toLang)) {
      return new Error("Unsupported toLang: ".concat(params.toLang, ". Supported to languages: ").concat(SUPPORTED_TO_LANGUAGES.map(function (x) {
        return x.langCode;
      })));
    }
    if (params.voiceType !== "male" && params.voiceType !== "female") {
      return new Error("Unsupported voiceType: ".concat(params.voiceType, ". Supported voice types: male, female"));
    }
    if (params.inputAudioTrack === null) {
      return new Error("inputAudioTrack is required");
    }
    if (params.version && !SUPPORTED_TRANSLATOR_VERSIONS.map(function (x) {
      return x.version;
    }).includes(params.version)) {
      return new Error("Unsupported version: ".concat(params.version, ". Supported versions: ").concat(SUPPORTED_TRANSLATOR_VERSIONS));
    }
    return null;
  };
  DubitInstance.prototype.addTranslator = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var validationError, translator;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            validationError = this.validateTranslatorParams(params);
            if (validationError) {
              return [2 /*return*/, Promise.reject(validationError)];
            }
            translator = new Translator(__assign({
              instanceId: this.instanceId,
              roomUrl: this.roomUrl,
              token: this.ownerToken,
              apiUrl: this.apiUrl
            }, params));
            translator.onDestroy = function () {
              _this.activeTranslators.delete(translator.getParticipantId());
            };
            return [4 /*yield*/, translator.init()];
          case 1:
            _a.sent();
            this.activeTranslators.set(translator.getParticipantId(), translator);
            return [2 /*return*/, translator];
        }
      });
    });
  };
  return DubitInstance;
}();
var Translator = /** @class */function () {
  function Translator(params) {
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
    this.metadata = params.metadata ? safeSerializeMetadata(params.metadata) : {};
  }
  Translator.prototype.init = function () {
    return __awaiter(this, void 0, void 0, function () {
      var audioSource, error_2, participants, error_3;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            try {
              this.callObject = Daily.createCallObject({
                allowMultipleCallInstances: true,
                videoSource: false,
                subscribeToTracksAutomatically: false,
                inputSettings: {
                  audio: {
                    processor: {
                      type: "noise-cancellation"
                    }
                  }
                }
              });
            } catch (error) {
              console.error("Translator: Failed to create Daily call object", error);
              throw error;
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3,, 4]);
            audioSource = false;
            if (this.inputAudioTrack && this.inputAudioTrack.readyState === "live") {
              audioSource = this.inputAudioTrack;
            }
            return [4 /*yield*/, this.callObject.join({
              url: this.roomUrl,
              audioSource: audioSource,
              videoSource: false,
              subscribeToTracksAutomatically: true,
              startAudioOff: audioSource === false
            })];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Translator: Failed to join the Daily room", error_2);
            throw error_2;
          case 4:
            participants = this.callObject.participants();
            if (!participants.local) {
              throw new Error("Translator: Failed to obtain local participant");
            }
            this.participantId = participants.local.session_id;
            _a.label = 5;
          case 5:
            _a.trys.push([5, 8,, 9]);
            return [4 /*yield*/, this.registerParticipant(this.participantId)];
          case 6:
            _a.sent();
            return [4 /*yield*/, this.addTranslationBot(this.roomUrl, this.participantId, this.fromLang, this.toLang, this.voiceType)];
          case 7:
            _a.sent();
            return [3 /*break*/, 9];
          case 8:
            error_3 = _a.sent();
            console.error("Translator: Error registering participant or adding bot", error_3);
            throw error_3;
          case 9:
            // this should be done differently
            // this.translatorId = await this.fetchTranslationBotId(this.participantId);
            // ideally, we should check the bot id and subscribe to it
            this.callObject.on("track-started", function (event) {
              var _a, _b;
              console.debug("Translator: track-started", event);
              if (((_a = event === null || event === void 0 ? void 0 : event.track) === null || _a === void 0 ? void 0 : _a.kind) === "audio" && !((_b = event === null || event === void 0 ? void 0 : event.participant) === null || _b === void 0 ? void 0 : _b.local)) {
                _this.outputTrack = event.track;
                if (_this.onTranslatedTrackCallback) {
                  _this.onTranslatedTrackCallback(_this.outputTrack);
                }
              }
            });
            // Listen for caption events with filtering.
            this.callObject.on("app-message", function (event) {
              var data = event.data;
              // Filter: ensure data exists, has the expected types, and is relevant to this translator.
              if (data && (data.type === "user-transcript" || data.type === "translation-transcript" || data.type === "user-interim-transcript") && data.participant_id === _this.participantId) {
                if (_this.onCaptionsCallback) {
                  _this.onCaptionsCallback(data);
                }
              }
            });
            // Clear output track if a non-local participant (i.e. the bot) leaves.
            this.callObject.on("participant-left", function (event) {
              if (!event.participant.local && _this.outputTrack) {
                _this.outputTrack = null;
                console.error("Translator: Translation bot left; output track cleared");
              }
            });
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Registers the local participant
   */
  Translator.prototype.registerParticipant = function (participantId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2,, 3]);
            return [4 /*yield*/, fetch("".concat(this.apiUrl, "/participant"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer ".concat(this.token)
              },
              body: JSON.stringify({
                id: participantId
              })
            })];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to register participant");
            }
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Translator: Error registering participant", error_4);
            throw error_4;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Adds a translation bot for the given participant.
   */
  Translator.prototype.addTranslationBot = function (roomUrl, participantId, fromLanguage, toLanguage, voiceType) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2,, 3]);
            return [4 /*yield*/, fetch("".concat(this.apiUrl, "/meeting/bot/join"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer ".concat(this.token)
              },
              body: JSON.stringify({
                room_url: roomUrl,
                from_language: fromLanguage,
                to_language: toLanguage,
                participant_id: participantId,
                bot_type: "translation",
                male: voiceType === "male",
                metadata: this.metadata
              })
            })];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to add translation bot");
            }
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Translator: Error adding translation bot", error_5);
            throw error_5;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  Translator.prototype.fetchTranslationBotId = function (participantId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
      var translatorId, botsDataResponse, json, err_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 6,, 7]);
            translatorId = "";
            _c.label = 1;
          case 1:
            if (!!translatorId) return [3 /*break*/, 5];
            return [4 /*yield*/, fetch("".concat(this.apiUrl, "/participant/").concat(participantId, "/bot"))];
          case 2:
            botsDataResponse = _c.sent();
            return [4 /*yield*/, botsDataResponse.json()];
          case 3:
            json = _c.sent();
            translatorId = (_b = (_a = json === null || json === void 0 ? void 0 : json.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id; // For now, we only support one bot per participant.
            return [4 /*yield*/, new Promise(function (resolve) {
              return setTimeout(resolve, 1000);
            })];
          case 4:
            _c.sent();
            return [3 /*break*/, 1];
          case 5:
            return [2 /*return*/, translatorId];
          case 6:
            err_1 = _c.sent();
            console.error("Translator: Error fetching translator id", err_1);
            throw err_1;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  Translator.prototype.onTranslatedTrackReady = function (callback) {
    this.onTranslatedTrackCallback = callback;
    if (this.outputTrack) {
      callback(this.outputTrack);
    }
  };
  Translator.prototype.onCaptions = function (callback) {
    this.onCaptionsCallback = callback;
  };
  Translator.prototype.updateInputTrack = function (newInputTrack) {
    return __awaiter(this, void 0, void 0, function () {
      var stream;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.callObject) {
              throw new Error("Translator: callObject not initialized");
            }
            if (!!newInputTrack) return [3 /*break*/, 2];
            return [4 /*yield*/, this.callObject.setInputDevicesAsync({
              audioSource: false
            })];
          case 1:
            _a.sent();
            return [2 /*return*/];
          case 2:
            this.callObject.setLocalAudio(true);
            if (!(newInputTrack.readyState === "ended")) return [3 /*break*/, 4];
            return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
              audio: {
                deviceId: newInputTrack.id
              }
            })];
          case 3:
            stream = _a.sent();
            newInputTrack = stream.getAudioTracks()[0];
            _a.label = 4;
          case 4:
            this.inputAudioTrack = newInputTrack;
            return [4 /*yield*/, this.callObject.setInputDevicesAsync({
              audioSource: newInputTrack
            })];
          case 5:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  Translator.prototype.getParticipantId = function () {
    return this.participantId;
  };
  Translator.prototype.getTranslatedTrack = function () {
    return this.outputTrack;
  };
  Translator.prototype.destroy = function () {
    if (this.callObject) {
      this.callObject.leave();
      this.callObject.destroy();
      this.callObject = null;
    }
    if (this.onDestroy) {
      this.onDestroy();
    }
  };
  return Translator;
}();
function safeSerializeMetadata(metadata) {
  try {
    JSON.stringify(metadata);
    return metadata;
  } catch (error) {
    console.error("Metadata serialization error; falling back to empty object.", error);
    return {};
  }
}
/**
 * An array of available translator versions.
 */
var SUPPORTED_TRANSLATOR_VERSIONS = [{
  label: "V1 (Flash)",
  version: "1"
}, {
  label: "V2 (Pro)",
  version: "2"
}, {
  label: "V3' (Noise Reduction)",
  version: "3"
}];
var SUPPORTED_FROM_LANGUAGES = [{
  langCode: "multi",
  label: "Multilingual (Spanish + English)"
}, {
  langCode: "bg",
  label: "Bulgarian"
}, {
  langCode: "ca",
  label: "Catalan"
}, {
  langCode: "zh-CN",
  label: "Chinese (Mainland China)"
}, {
  langCode: "zh-TW",
  label: "Chinese (Taiwan)"
}, {
  langCode: "zh-HK",
  label: "Chinese (Traditional, Hong Kong)"
}, {
  langCode: "cs",
  label: "Czech"
}, {
  langCode: "da",
  label: "Danish"
}, {
  langCode: "da-DK",
  label: "Danish"
}, {
  langCode: "nl",
  label: "Dutch"
}, {
  langCode: "en",
  label: "English"
}, {
  langCode: "en-US",
  label: "English (United States)"
}, {
  langCode: "en-AU",
  label: "English (Australia)"
}, {
  langCode: "en-GB",
  label: "English (United Kingdom)"
}, {
  langCode: "en-NZ",
  label: "English (New Zealand)"
}, {
  langCode: "en-IN",
  label: "English (India)"
}, {
  langCode: "et",
  label: "Estonian"
}, {
  langCode: "fi",
  label: "Finnish"
}, {
  langCode: "nl-BE",
  label: "Flemish"
}, {
  langCode: "fr",
  label: "French"
}, {
  langCode: "fr-CA",
  label: "French (Canada)"
}, {
  langCode: "de",
  label: "German"
}, {
  langCode: "de-CH",
  label: "German (Switzerland)"
}, {
  langCode: "el",
  label: "Greek"
}, {
  langCode: "hi",
  label: "Hindi"
}, {
  langCode: "hu",
  label: "Hungarian"
}, {
  langCode: "id",
  label: "Indonesian"
}, {
  langCode: "it",
  label: "Italian"
}, {
  langCode: "ja",
  label: "Japanese"
}, {
  langCode: "ko-KR",
  label: "Korean"
}, {
  langCode: "lv",
  label: "Latvian"
}, {
  langCode: "lt",
  label: "Lithuanian"
}, {
  langCode: "ms",
  label: "Malay"
}, {
  langCode: "no",
  label: "Norwegian"
}, {
  langCode: "pl",
  label: "Polish"
}, {
  langCode: "pt",
  label: "Portuguese"
}, {
  langCode: "pt-BR",
  label: "Portuguese (Brazil)"
}, {
  langCode: "pt-PT",
  label: "Portuguese (Portugal)"
}, {
  langCode: "ro",
  label: "Romanian"
}, {
  langCode: "ru",
  label: "Russian"
}, {
  langCode: "sk",
  label: "Slovak"
}, {
  langCode: "es",
  label: "Spanish"
}, {
  langCode: "es-419",
  label: "Spanish (Latin America & Caribbean)"
}, {
  langCode: "sv-SE",
  label: "Swedish (Sweden)"
}, {
  langCode: "th-TH",
  label: "Thai (Thailand)"
}, {
  langCode: "tr",
  label: "Turkish"
}, {
  langCode: "uk",
  label: "Ukrainian"
}, {
  langCode: "vi",
  label: "Vietnamese"
}];
var SUPPORTED_TO_LANGUAGES = [{
  langCode: "af-ZA",
  label: "Afrikaans (South Africa)"
}, {
  langCode: "am-ET",
  label: "Amharic (Ethiopia)"
}, {
  langCode: "ar-AE",
  label: "Arabic (United Arab Emirates)"
}, {
  langCode: "ar-BH",
  label: "Arabic (Bahrain)"
}, {
  langCode: "ar-DZ",
  label: "Arabic (Algeria)"
}, {
  langCode: "ar-EG",
  label: "Arabic (Egypt)"
}, {
  langCode: "ar-IQ",
  label: "Arabic (Iraq)"
}, {
  langCode: "ar-JO",
  label: "Arabic (Jordan)"
}, {
  langCode: "ar-KW",
  label: "Arabic (Kuwait)"
}, {
  langCode: "ar-LB",
  label: "Arabic (Lebanon)"
}, {
  langCode: "ar-LY",
  label: "Arabic (Libya)"
}, {
  langCode: "ar-MA",
  label: "Arabic (Morocco)"
}, {
  langCode: "ar-OM",
  label: "Arabic (Oman)"
}, {
  langCode: "ar-QA",
  label: "Arabic (Qatar)"
}, {
  langCode: "ar-SA",
  label: "Arabic (Saudi Arabia)"
}, {
  langCode: "ar-SY",
  label: "Arabic (Syria)"
}, {
  langCode: "ar-TN",
  label: "Arabic (Tunisia)"
}, {
  langCode: "ar-YE",
  label: "Arabic (Yemen)"
}, {
  langCode: "as-IN",
  label: "Assamese (India)"
}, {
  langCode: "az-AZ",
  label: "Azerbaijani (Latin, Azerbaijan)"
}, {
  langCode: "bg-BG",
  label: "Bulgarian (Bulgaria)"
}, {
  langCode: "bn-BD",
  label: "Bangla (Bangladesh)"
}, {
  langCode: "bn-IN",
  label: "Bengali (India)"
}, {
  langCode: "bs-BA",
  label: "Bosnian (Bosnia and Herzegovina)"
}, {
  langCode: "ca-ES",
  label: "Catalan"
}, {
  langCode: "cs-CZ",
  label: "Czech (Czechia)"
}, {
  langCode: "cy-GB",
  label: "Welsh (United Kingdom)"
}, {
  langCode: "da-DK",
  label: "Danish (Denmark)"
}, {
  langCode: "de-AT",
  label: "German (Austria)"
}, {
  langCode: "de-CH",
  label: "German (Switzerland)"
}, {
  langCode: "de-DE",
  label: "German (Germany)"
}, {
  langCode: "el-GR",
  label: "Greek (Greece)"
}, {
  langCode: "en-AU",
  label: "English (Australia)"
}, {
  langCode: "en-CA",
  label: "English (Canada)"
}, {
  langCode: "en-GB",
  label: "English (United Kingdom)"
}, {
  langCode: "en-HK",
  label: "English (Hong Kong SAR)"
}, {
  langCode: "en-IE",
  label: "English (Ireland)"
}, {
  langCode: "en-IN",
  label: "English (India)"
}, {
  langCode: "en-KE",
  label: "English (Kenya)"
}, {
  langCode: "en-NG",
  label: "English (Nigeria)"
}, {
  langCode: "en-NZ",
  label: "English (New Zealand)"
}, {
  langCode: "en-PH",
  label: "English (Philippines)"
}, {
  langCode: "en-SG",
  label: "English (Singapore)"
}, {
  langCode: "en-TZ",
  label: "English (Tanzania)"
}, {
  langCode: "en-US",
  label: "English (United States)"
}, {
  langCode: "en-ZA",
  label: "English (South Africa)"
}, {
  langCode: "es-AR",
  label: "Spanish (Argentina)"
}, {
  langCode: "es-BO",
  label: "Spanish (Bolivia)"
}, {
  langCode: "es-CL",
  label: "Spanish (Chile)"
}, {
  langCode: "es-CO",
  label: "Spanish (Colombia)"
}, {
  langCode: "es-CR",
  label: "Spanish (Costa Rica)"
}, {
  langCode: "es-CU",
  label: "Spanish (Cuba)"
}, {
  langCode: "es-DO",
  label: "Spanish (Dominican Republic)"
}, {
  langCode: "es-EC",
  label: "Spanish (Ecuador)"
}, {
  langCode: "es-ES",
  label: "Spanish (Spain)"
}, {
  langCode: "es-GQ",
  label: "Spanish (Equatorial Guinea)"
}, {
  langCode: "es-GT",
  label: "Spanish (Guatemala)"
}, {
  langCode: "es-HN",
  label: "Spanish (Honduras)"
}, {
  langCode: "es-MX",
  label: "Spanish (Mexico)"
}, {
  langCode: "es-NI",
  label: "Spanish (Nicaragua)"
}, {
  langCode: "es-PA",
  label: "Spanish (Panama)"
}, {
  langCode: "es-PE",
  label: "Spanish (Peru)"
}, {
  langCode: "es-PR",
  label: "Spanish (Puerto Rico)"
}, {
  langCode: "es-PY",
  label: "Spanish (Paraguay)"
}, {
  langCode: "es-SV",
  label: "Spanish (El Salvador)"
}, {
  langCode: "es-US",
  label: "Spanish (United States)"
}, {
  langCode: "es-UY",
  label: "Spanish (Uruguay)"
}, {
  langCode: "es-VE",
  label: "Spanish (Venezuela)"
}, {
  langCode: "et-EE",
  label: "Estonian (Estonia)"
}, {
  langCode: "eu-ES",
  label: "Basque"
}, {
  langCode: "fa-IR",
  label: "Persian (Iran)"
}, {
  langCode: "fi-FI",
  label: "Finnish (Finland)"
}, {
  langCode: "fil-PH",
  label: "Filipino (Philippines)"
}, {
  langCode: "fr-BE",
  label: "French (Belgium)"
}, {
  langCode: "fr-CA",
  label: "French (Canada)"
}, {
  langCode: "fr-CH",
  label: "French (Switzerland)"
}, {
  langCode: "fr-FR",
  label: "French (France)"
}, {
  langCode: "ga-IE",
  label: "Irish (Ireland)"
}, {
  langCode: "gl-ES",
  label: "Galician"
}, {
  langCode: "gu-IN",
  label: "Gujarati (India)"
}, {
  langCode: "he-IL",
  label: "Hebrew (Israel)"
}, {
  langCode: "hi-IN",
  label: "Hindi (India)"
}, {
  langCode: "hr-HR",
  label: "Croatian (Croatia)"
}, {
  langCode: "hu-HU",
  label: "Hungarian (Hungary)"
}, {
  langCode: "hy-AM",
  label: "Armenian (Armenia)"
}, {
  langCode: "id-ID",
  label: "Indonesian (Indonesia)"
}, {
  langCode: "is-IS",
  label: "Icelandic (Iceland)"
}, {
  langCode: "it-IT",
  label: "Italian (Italy)"
}, {
  langCode: "iu-CANS-CA",
  label: "Inuktitut (Syllabics, Canada)"
}, {
  langCode: "iu-LATN-CA",
  label: "Inuktitut (Latin, Canada)"
}, {
  langCode: "ja-JP",
  label: "Japanese (Japan)"
}, {
  langCode: "jv-ID",
  label: "Javanese (Latin, Indonesia)"
}, {
  langCode: "ka-GE",
  label: "Georgian (Georgia)"
}, {
  langCode: "kk-KZ",
  label: "Kazakh (Kazakhstan)"
}, {
  langCode: "km-KH",
  label: "Khmer (Cambodia)"
}, {
  langCode: "kn-IN",
  label: "Kannada (India)"
}, {
  langCode: "ko-KR",
  label: "Korean (Korea)"
}, {
  langCode: "lo-LA",
  label: "Lao (Laos)"
}, {
  langCode: "lt-LT",
  label: "Lithuanian (Lithuania)"
}, {
  langCode: "lv-LV",
  label: "Latvian (Latvia)"
}, {
  langCode: "mk-MK",
  label: "Macedonian (North Macedonia)"
}, {
  langCode: "ml-IN",
  label: "Malayalam (India)"
}, {
  langCode: "mn-MN",
  label: "Mongolian (Mongolia)"
}, {
  langCode: "mr-IN",
  label: "Marathi (India)"
}, {
  langCode: "ms-MY",
  label: "Malay (Malaysia)"
}, {
  langCode: "mt-MT",
  label: "Maltese (Malta)"
}, {
  langCode: "my-MM",
  label: "Burmese (Myanmar)"
}, {
  langCode: "nb-NO",
  label: "Norwegian Bokmål (Norway)"
}, {
  langCode: "ne-NP",
  label: "Nepali (Nepal)"
}, {
  langCode: "nl-BE",
  label: "Dutch (Belgium)"
}, {
  langCode: "nl-NL",
  label: "Dutch (Netherlands)"
}, {
  langCode: "or-IN",
  label: "Oriya (India)"
}, {
  langCode: "pa-IN",
  label: "Punjabi (India)"
}, {
  langCode: "pl-PL",
  label: "Polish (Poland)"
}, {
  langCode: "ps-AF",
  label: "Pashto (Afghanistan)"
}, {
  langCode: "pt-BR",
  label: "Portuguese (Brazil)"
}, {
  langCode: "pt-PT",
  label: "Portuguese (Portugal)"
}, {
  langCode: "ro-RO",
  label: "Romanian (Romania)"
}, {
  langCode: "ru-RU",
  label: "Russian (Russia)"
}, {
  langCode: "si-LK",
  label: "Sinhala (Sri Lanka)"
}, {
  langCode: "sk-SK",
  label: "Slovak (Slovakia)"
}, {
  langCode: "sl-SI",
  label: "Slovenian (Slovenia)"
}, {
  langCode: "so-SO",
  label: "Somali (Somalia)"
}, {
  langCode: "sq-AL",
  label: "Albanian (Albania)"
}, {
  langCode: "sr-LATN-RS",
  label: "Serbian (Latin, Serbia)"
}, {
  langCode: "sr-RS",
  label: "Serbian (Cyrillic, Serbia)"
}, {
  langCode: "su-ID",
  label: "Sundanese (Indonesia)"
}, {
  langCode: "sv-SE",
  label: "Swedish (Sweden)"
}, {
  langCode: "sw-KE",
  label: "Kiswahili (Kenya)"
}, {
  langCode: "sw-TZ",
  label: "Kiswahili (Tanzania)"
}, {
  langCode: "ta-IN",
  label: "Tamil (India)"
}, {
  langCode: "ta-LK",
  label: "Tamil (Sri Lanka)"
}, {
  langCode: "ta-MY",
  label: "Tamil (Malaysia)"
}, {
  langCode: "ta-SG",
  label: "Tamil (Singapore)"
}, {
  langCode: "te-IN",
  label: "Telugu (India)"
}, {
  langCode: "th-TH",
  label: "Thai (Thailand)"
}, {
  langCode: "tr-TR",
  label: "Turkish (Türkiye)"
}, {
  langCode: "uk-UA",
  label: "Ukrainian (Ukraine)"
}, {
  langCode: "ur-IN",
  label: "Urdu (India)"
}, {
  langCode: "ur-PK",
  label: "Urdu (Pakistan)"
}, {
  langCode: "uz-UZ",
  label: "Uzbek (Latin, Uzbekistan)"
}, {
  langCode: "vi-VN",
  label: "Vietnamese (Vietnam)"
}, {
  langCode: "wuu-CN",
  label: "Chinese (Wu, Simplified)"
}, {
  langCode: "yue-CN",
  label: "Chinese (Cantonese, Simplified)"
}, {
  langCode: "zh-CN",
  label: "Chinese (Mandarin, Simplified)"
}, {
  langCode: "zh-CN-GUANGXI",
  label: "Chinese (Guangxi Accent Mandarin, Simplified)"
}, {
  langCode: "zh-CN-henan",
  label: "Chinese (Zhongyuan Mandarin Henan, Simplified)"
}, {
  langCode: "zh-CN-liaoning",
  label: "Chinese (Northeastern Mandarin, Simplified)"
}, {
  langCode: "zh-CN-shaanxi",
  label: "Chinese (Zhongyuan Mandarin Shaanxi, Simplified)"
}, {
  langCode: "zh-CN-shandong",
  label: "Chinese (Jilu Mandarin, Simplified)"
}, {
  langCode: "zh-CN-sichuan",
  label: "Chinese (Southwestern Mandarin, Simplified)"
}, {
  langCode: "zh-HK",
  label: "Chinese (Cantonese, Traditional)"
}, {
  langCode: "zh-TW",
  label: "Chinese (Taiwanese Mandarin, Traditional)"
}, {
  langCode: "zu-ZA",
  label: "isiZulu (South Africa)"
}];

export { DubitInstance, SUPPORTED_FROM_LANGUAGES, SUPPORTED_TO_LANGUAGES, SUPPORTED_TRANSLATOR_VERSIONS, Translator, createNewInstance, getCompleteTranscript, getSupportedFromLanguages, getSupportedToLanguages };
