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
function enhanceError(baseMessage, originalError) {
  var enhancedError = new Error("".concat(baseMessage, ". Original error: ").concat((originalError === null || originalError === void 0 ? void 0 : originalError.message) || "No original error message"));
  enhancedError.stack = originalError === null || originalError === void 0 ? void 0 : originalError.stack;
  enhancedError.cause = originalError;
  return enhancedError;
}
function executeLog(loggerCallback, logEntry) {
  if (loggerCallback) {
    try {
      loggerCallback(logEntry);
    } catch (error) {
      console.error("Error in loggerCallback:", error);
      console.error("Original log message:", logEntry);
    }
  } else {
    var logMessage = "[".concat(logEntry.timestamp, "] [").concat(logEntry.className, "] ").concat(logEntry.level.toUpperCase(), ": ").concat(logEntry.message);
    switch (logEntry.level) {
      case "error":
        console.error(logMessage, logEntry.data || "");
        break;
      case "warn":
        console.warn(logMessage, logEntry.data || "");
        break;
      case "info":
        console.info(logMessage, logEntry.data || "");
        break;
      case "debug":
        console.debug(logMessage, logEntry.data || "");
        break;
      default:
        console.log(logMessage, logEntry.data || "");
    }
  }
}
function createNewInstance(_a) {
  var token = _a.token,
    _b = _a.apiUrl,
    apiUrl = _b === void 0 ? API_URL : _b,
    _c = _a.loggerCallback,
    loggerCallback = _c === void 0 ? null : _c;
  return __awaiter(this, void 0, void 0, function () {
    var response, errorData, errorMessage, data, instanceId, roomUrl, instance, error_1, completeError;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5,, 6]);
          return [4 /*yield*/, fetch("".concat(apiUrl, "/meeting/new-meeting"), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer ".concat(token)
            }
          })];
        case 1:
          response = _d.sent();
          if (!!response.ok) return [3 /*break*/, 3];
          return [4 /*yield*/, response.json()];
        case 2:
          errorData = _d.sent();
          errorMessage = (errorData === null || errorData === void 0 ? void 0 : errorData.message) || "Failed to create connection with Dubit servers (HTTP ".concat(response.status, ")");
          throw new Error(errorMessage);
        case 3:
          return [4 /*yield*/, response.json()];
        case 4:
          data = _d.sent();
          instanceId = data.meeting_id;
          roomUrl = data.roomUrl;
          instance = new DubitInstance(instanceId, roomUrl, token, apiUrl);
          instance.setLoggerCallback(loggerCallback);
          instance._log("info", "DubitInstance", "Instance created successfully", {
            instanceId: instanceId
          });
          return [2 /*return*/, instance];
        case 5:
          error_1 = _d.sent();
          completeError = enhanceError("Unable to create Dubit instance. Please check your network connection and API token", error_1);
          console.error("dubit.createNewInstance error:", completeError);
          throw completeError;
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}
function validateApiKey(apiKey) {
  var _a;
  return __awaiter(this, void 0, void 0, function () {
    var response, result, error_2, completeError;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3,, 4]);
          return [4 /*yield*/, fetch("".concat(API_URL, "/user/validate/").concat(apiKey), {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          })];
        case 1:
          response = _b.sent();
          if (!response.ok) {
            throw new Error("HTTP error: ".concat(response.status));
          }
          return [4 /*yield*/, response.json()];
        case 2:
          result = _b.sent();
          return [2 /*return*/, ((_a = result.data) === null || _a === void 0 ? void 0 : _a.is_exists) || false];
        case 3:
          error_2 = _b.sent();
          completeError = enhanceError("Unable to validate API key. Please check your network connection and API key", error_2);
          console.error("dubit.validateApiKey error:", completeError);
          throw completeError;
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function getCompleteTranscript(_a) {
  var instanceId = _a.instanceId,
    token = _a.token,
    _b = _a.apiUrl,
    apiUrl = _b === void 0 ? API_URL : _b;
  return __awaiter(this, void 0, void 0, function () {
    var response, errorData, errorMessage, error_3;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4,, 5]);
          return [4 /*yield*/, fetch("".concat(apiUrl, "/meeting/").concat(instanceId, "/transcripts"), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer ".concat(token)
            }
          })];
        case 1:
          response = _c.sent();
          if (!!response.ok) return [3 /*break*/, 3];
          return [4 /*yield*/, response.json()];
        case 2:
          errorData = _c.sent();
          errorMessage = (errorData === null || errorData === void 0 ? void 0 : errorData.message) || "Failed to fetch complete transcript";
          throw new Error(errorMessage);
        case 3:
          return [2 /*return*/, response.json()];
        case 4:
          error_3 = _c.sent();
          console.error("dubit.getCompleteTranscript error:", error_3);
          throw error_3;
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function validateTranslatorParams(params) {
  if (!SUPPORTED_LANGUAGES.map(function (x) {
    return x.langCode;
  }).includes(params.fromLang)) {
    return new Error("Unsupported fromLang: ".concat(params.fromLang, ". Supported from languages: ").concat(SUPPORTED_LANGUAGES.map(function (x) {
      return x.langCode;
    })));
  }
  if (!SUPPORTED_LANGUAGES.map(function (x) {
    return x.langCode;
  }).includes(params.toLang)) {
    return new Error("Unsupported toLang: ".concat(params.toLang, ". Supported to languages: ").concat(SUPPORTED_LANGUAGES.map(function (x) {
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
}
var DubitInstance = /** @class */function () {
  function DubitInstance(instanceId, roomUrl, ownerToken, apiUrl) {
    this.activeTranslators = new Map();
    this.loggerCallback = null;
    this.instanceId = instanceId;
    this.roomUrl = roomUrl;
    this.ownerToken = ownerToken;
    this.apiUrl = apiUrl;
  }
  DubitInstance.prototype.setLoggerCallback = function (callback) {
    if (typeof callback === "function" || callback === null) {
      this.loggerCallback = callback;
      this._log("debug", "DubitInstance", "Logger callback updated", {
        callback: !!callback
      });
    } else {
      console.warn("Invalid loggerCallback provided. It should be a function or null.");
      this.loggerCallback = null;
    }
  };
  /**
   * Internal logging method for DubitInstance and its children.
   */
  DubitInstance.prototype._log = function (level, className, message, data) {
    var logEntry = {
      level: level,
      className: className,
      message: message,
      data: data,
      timestamp: new Date().toISOString()
    };
    executeLog(this.loggerCallback, logEntry);
  };
  DubitInstance.prototype.addTranslator = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var validationError, translator, error_4;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            validationError = validateTranslatorParams(params);
            if (validationError) {
              return [2 /*return*/, Promise.reject(validationError)];
            }
            translator = new Translator(__assign({
              instanceId: this.instanceId,
              roomUrl: this.roomUrl,
              token: this.ownerToken,
              apiUrl: this.apiUrl,
              loggerCallback: this.loggerCallback
            }, params));
            translator.onDestroy = function () {
              _this.activeTranslators.delete(translator.getParticipantId());
              _this._log("info", "DubitInstance", "Translator removed", {
                participantId: translator.getParticipantId()
              });
            };
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3,, 4]);
            return [4 /*yield*/, translator.init()];
          case 2:
            _a.sent();
            this.activeTranslators.set(translator.getParticipantId(), translator);
            this._log("info", "DubitInstance", "Translator added and initialized", {
              participantId: translator.getParticipantId(),
              toLang: params.toLang,
              fromLang: params.fromLang
            });
            return [2 /*return*/, translator];
          case 3:
            error_4 = _a.sent();
            this._log("error", "DubitInstance", "Failed to initialize translator", {
              error: error_4.message,
              params: params
            });
            return [2 /*return*/, Promise.reject(error_4)];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return DubitInstance;
}();
var Translator = /** @class */function () {
  function Translator(params) {
    var _this = this;
    this.version = "latest";
    this.keywords = false;
    this.translationBeep = false;
    this.hqVoices = false;
    this.callObject = null;
    this.translatedTrack = null;
    this.participantId = "";
    this.participantTracks = new Map();
    this.outputDeviceId = null;
    this.loggerCallback = null;
    this.onTranslatedTrackCallback = null;
    this.onCaptionsCallback = null;
    this.getInstanceId = function () {
      return _this.instanceId;
    };
    this.instanceId = params.instanceId;
    this.roomUrl = params.roomUrl;
    this.token = params.token;
    this.apiUrl = params.apiUrl;
    this.fromLang = params.fromLang;
    this.toLang = params.toLang;
    this.voiceType = params.voiceType;
    this.version = params.version || this.version;
    this.keywords = params.keywords;
    this.translationBeep = params.translationBeep;
    this.hqVoices = params.hqVoices;
    this.inputAudioTrack = params.inputAudioTrack;
    this.metadata = params.metadata ? safeSerializeMetadata(params.metadata) : {};
    this.outputDeviceId = params.outputDeviceId;
    this.loggerCallback = params.loggerCallback || null;
  }
  /**
   * Internal logging method for Translator.
   */
  Translator.prototype._log = function (level, message, data) {
    var logEntry = {
      level: level,
      className: "Translator",
      message: message,
      data: data,
      timestamp: new Date().toISOString()
    };
    executeLog(this.loggerCallback, logEntry);
  };
  Translator.prototype._getTranslatorLabel = function () {
    var _this = this;
    var _a, _b;
    var fromLangLabel = (_a = SUPPORTED_LANGUAGES.find(function (x) {
      return x.langCode == _this.fromLang;
    })) === null || _a === void 0 ? void 0 : _a.label;
    var toLangLabel = (_b = SUPPORTED_LANGUAGES.find(function (x) {
      return x.langCode == _this.toLang;
    })) === null || _b === void 0 ? void 0 : _b.label;
    return "Translator ".concat(fromLangLabel, " -> ").concat(toLangLabel);
  };
  Translator.prototype.init = function () {
    return __awaiter(this, void 0, void 0, function () {
      var audioSource, error_5, participants, error_6;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            try {
              this.callObject = Daily.createCallObject({
                allowMultipleCallInstances: true,
                videoSource: false,
                subscribeToTracksAutomatically: false
              });
              this._log("debug", "Call object created");
            } catch (error) {
              this._log("error", "Failed to create Daily call object", {
                error: error.message
              });
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
              subscribeToTracksAutomatically: false,
              startAudioOff: audioSource === false,
              inputSettings: {
                audio: {
                  processor: {
                    type: "noise-cancellation"
                  }
                }
              }
            })];
          case 2:
            _a.sent();
            this._log("info", "Joined Call", {
              roomUrl: this.roomUrl,
              audioSource: !!audioSource
            });
            return [3 /*break*/, 4];
          case 3:
            error_5 = _a.sent();
            this._log("error", "Failed to join call", {
              error: error_5.message,
              roomUrl: this.roomUrl
            });
            throw error_5;
          case 4:
            participants = this.callObject.participants();
            this.participantId = participants.local.session_id;
            this._log("debug", "Local participant info retrieved", {
              participantId: this.participantId
            });
            _a.label = 5;
          case 5:
            _a.trys.push([5, 8,, 9]);
            return [4 /*yield*/, this.registerParticipant(this.participantId)];
          case 6:
            _a.sent();
            return [4 /*yield*/, this.addTranslationBot(this.roomUrl, this.participantId, this.fromLang, this.toLang, this.voiceType, this.version, this.keywords, this.translationBeep, this.hqVoices)];
          case 7:
            _a.sent();
            this._log("info", "Requested translator", {
              participantId: this.participantId,
              fromLang: this.fromLang,
              toLang: this.toLang
            });
            return [3 /*break*/, 9];
          case 8:
            error_6 = _a.sent();
            this._log("error", "Error registering participant or requesting bot", {
              error: error_6.message
            });
            throw error_6;
          case 9:
            this.callObject.on("track-started", function (event) {
              var _a;
              // TODO: add better identifier like some kind of id in metadata
              if (event.track.kind === "audio" && !((_a = event === null || event === void 0 ? void 0 : event.participant) === null || _a === void 0 ? void 0 : _a.local) && event.participant.user_name.includes(_this._getTranslatorLabel())) {
                _this._log("debug", "Translation track started", {
                  participantName: event.participant.user_name,
                  trackId: event.track.id
                });
                if (_this.onTranslatedTrackCallback && event.track) {
                  _this.onTranslatedTrackCallback(event.track);
                  _this.translatedTrack = event.track;
                }
              }
            });
            this.callObject.on("participant-joined", function (event) {
              return __awaiter(_this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                  if ((_a = event === null || event === void 0 ? void 0 : event.participant) === null || _a === void 0 ? void 0 : _a.local) return [2 /*return*/];
                  // TODO: add better identifier like some kind of id in metadata
                  if (event.participant.user_name.includes(this._getTranslatorLabel())) {
                    this._log("debug", "Translator joined, connecting audio", {
                      participantId: event.participant.session_id,
                      participantName: event.participant.user_name
                    });
                    this.callObject.updateParticipant(event.participant.session_id, {
                      setSubscribedTracks: {
                        audio: true
                      }
                    });
                  }
                  return [2 /*return*/];
                });
              });
            });
            this.callObject.on("app-message", function (event) {
              var _a;
              var data = event.data;
              if (!((_a = data === null || data === void 0 ? void 0 : data.type) === null || _a === void 0 ? void 0 : _a.includes("transcript"))) return;
              var validTypes = ["user-transcript", "translation-transcript", "user-interim-transcript"];
              if (validTypes.includes(data.type) && data.participant_id === _this.participantId && (data === null || data === void 0 ? void 0 : data.transcript) && _this.onCaptionsCallback) {
                _this.onCaptionsCallback(data);
              }
            });
            // Clear output track if the bot leaves.
            this.callObject.on("participant-left", function (event) {
              if (!event.participant.local && event.participant.user_name.includes(_this._getTranslatorLabel()) && _this.translatedTrack) {
                _this.translatedTrack = null;
                _this._log("warn", "Translator left; output track cleared", {
                  participantId: event.participant.session_id,
                  participantName: event.participant.user_name
                });
              }
            });
            this._log("info", "Translator initialized successfully", {
              fromLang: this.fromLang,
              toLang: this.toLang,
              version: this.version
            });
            return [2 /*return*/];
        }
      });
    });
  };
  // Register local participant
  Translator.prototype.registerParticipant = function (participantId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, errorData, errorMessage, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4,, 5]);
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
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            errorData = _a.sent();
            errorMessage = (errorData === null || errorData === void 0 ? void 0 : errorData.message) || "Failed to register participant";
            this._log("error", "Failed to register participant", {
              error: errorMessage
            });
            throw new Error(errorMessage);
          case 3:
            this._log("debug", "Participant registered successfully", {
              participantId: participantId
            });
            return [3 /*break*/, 5];
          case 4:
            error_7 = _a.sent();
            this._log("error", "Error registering participant", {
              error: error_7.message
            });
            throw error_7;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Adds a translation bot for the given participant
  Translator.prototype.addTranslationBot = function (roomUrl, participantId, fromLanguage, toLanguage, voiceType, version, keywords, translationBeep, hqVoices) {
    if (keywords === void 0) {
      keywords = false;
    }
    if (translationBeep === void 0) {
      translationBeep = false;
    }
    if (hqVoices === void 0) {
      hqVoices = false;
    }
    return __awaiter(this, void 0, void 0, function () {
      var response, errorData, errorMessage, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4,, 5]);
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
                version: version,
                keywords: keywords,
                translation_beep: translationBeep,
                hq_voices: hqVoices,
                metadata: this.metadata
              })
            })];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            errorData = _a.sent();
            errorMessage = (errorData === null || errorData === void 0 ? void 0 : errorData.message) || "Failed to request translator";
            this._log("error", "Failed to request translator", {
              error: errorMessage
            });
            throw new Error(errorMessage);
          case 3:
            this._log("debug", "Translator requested successfully", {
              roomUrl: roomUrl,
              participantId: participantId,
              fromLanguage: fromLanguage,
              toLanguage: toLanguage,
              version: version
            });
            return [3 /*break*/, 5];
          case 4:
            error_8 = _a.sent();
            this._log("error", "Error adding translator", {
              error: error_8.message
            });
            throw error_8;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  Translator.prototype.onTranslatedTrackReady = function (callback) {
    this.onTranslatedTrackCallback = callback;
    if (this.translatedTrack) {
      callback(this.translatedTrack);
      this._log("debug", "onTranslatedTrackReady callback invoked immediately as track is already available");
    }
  };
  Translator.prototype.onCaptions = function (callback) {
    this.onCaptionsCallback = callback;
    this._log("debug", "onCaptions callback set");
  };
  Translator.prototype.updateInputTrack = function (newInputTrack) {
    return __awaiter(this, void 0, void 0, function () {
      var stream, e_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.callObject) {
              this._log("error", "callObject not initialized when updating input audio track");
              throw new Error("Translator: callObject not initialized");
            }
            if (!!newInputTrack) return [3 /*break*/, 2];
            return [4 /*yield*/, this.callObject.setInputDevicesAsync({
              audioSource: false
            })];
          case 1:
            _a.sent();
            this._log("info", "Input audio track updated to false (muted)");
            return [2 /*return*/];
          case 2:
            this.callObject.setLocalAudio(true);
            if (!(newInputTrack.readyState === "ended")) return [3 /*break*/, 6];
            _a.label = 3;
          case 3:
            _a.trys.push([3, 5,, 6]);
            return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
              audio: {
                deviceId: newInputTrack.id
              }
            })];
          case 4:
            stream = _a.sent();
            newInputTrack = stream.getAudioTracks()[0];
            this._log("warn", "Input audio track was ended, obtained a new track from getUserMedia", {
              trackId: newInputTrack.id
            });
            return [3 /*break*/, 6];
          case 5:
            e_1 = _a.sent();
            this._log("error", "Failed to get new audio track from getUserMedia when updating input track", {
              error: e_1.message
            });
            return [2 /*return*/];
          case 6:
            this.inputAudioTrack = newInputTrack;
            return [4 /*yield*/, this.callObject.setInputDevicesAsync({
              audioSource: newInputTrack
            })];
          case 7:
            _a.sent();
            this._log("info", "Input audio track updated", {
              trackId: newInputTrack.id
            });
            return [2 /*return*/];
        }
      });
    });
  };
  Translator.prototype.getParticipantId = function () {
    return this.participantId;
  };
  Translator.prototype.getTranslatedTrack = function () {
    return this.translatedTrack;
  };
  Translator.prototype.destroy = function () {
    if (this.callObject) {
      this.callObject.leave();
      this.callObject.destroy();
      this.callObject = null;
      this._log("info", "Call object destroyed and left the session");
    }
    if (this.onDestroy) {
      this.onDestroy();
      this._log("debug", "onDestroy callback invoked");
    }
    this._log("info", "Translator instance destroyed", {
      participantId: this.participantId
    });
  };
  return Translator;
}();
var audioContexts = new Map();
var activeRoutings = new Map();
/**
 * Routes a WebRTC audio track to a specific output device using WebAudio
 * This implementation avoids the WebRTC track mixing issue by using the WebAudio API
 */
function routeTrackToDevice(track, outputDeviceId, elementId) {
  console.log("Routing track ".concat(track.id, " to device ").concat(outputDeviceId));
  if (!elementId) {
    elementId = "audio-".concat(track.id);
  }
  // Clean up any existing routing for this element ID
  if (activeRoutings.has(elementId)) {
    var oldRouting = activeRoutings.get(elementId);
    oldRouting.stop();
    activeRoutings.delete(elementId);
    console.log("Cleaned up previous routing for ".concat(elementId));
  }
  // Create or get AudioContext for this output device
  var audioContext;
  if (audioContexts.has(outputDeviceId)) {
    audioContext = audioContexts.get(outputDeviceId);
    console.log("Reusing existing AudioContext for device ".concat(outputDeviceId));
  } else {
    audioContext = new AudioContext();
    audioContexts.set(outputDeviceId, audioContext);
    console.log("Created new AudioContext for device ".concat(outputDeviceId));
  }
  // Resume AudioContext if suspended (autoplay policy)
  if (audioContext.state === "suspended") {
    audioContext.resume().then(function () {
      return console.log("AudioContext resumed for device ".concat(outputDeviceId));
    }).catch(function (err) {
      return console.error("Failed to resume AudioContext: ".concat(err));
    });
  }
  var mediaStream = new MediaStream([track]);
  var sourceNode = audioContext.createMediaStreamSource(mediaStream);
  console.log("Created source node for track ".concat(track.id));
  var destinationNode = audioContext.destination;
  sourceNode.connect(destinationNode);
  console.log("Connected track ".concat(track.id, " to destination for device ").concat(outputDeviceId));
  // If the AudioContext API supports setSinkId directly, use it
  if ("setSinkId" in AudioContext.prototype) {
    audioContext //@ts-ignore
    .setSinkId(outputDeviceId).then(function () {
      return console.log("Set sinkId ".concat(outputDeviceId, " on AudioContext directly"));
    }).catch(function (err) {
      return console.error("Failed to set sinkId on AudioContext: ".concat(err));
    });
  }
  // Create a hidden audio element that will pull from the WebRTC stream
  // This is necessary to get the WebRTC subsystem to deliver the audio to WebAudio
  var pullElement = document.createElement("audio");
  pullElement.id = "pull-".concat(elementId);
  pullElement.srcObject = mediaStream;
  pullElement.style.display = "none";
  pullElement.muted = true; // Don't actually play through the default device
  document.body.appendChild(pullElement);
  // Start pulling audio through the element
  pullElement.play().then(function () {
    return console.log("Pull element started for track ".concat(track.id));
  }).catch(function (err) {
    return console.error("Failed to start pull element: ".concat(err));
  });
  // Create routing info object with stop method
  var routingInfo = {
    context: audioContext,
    sourceNode: sourceNode,
    pullElement: pullElement,
    stop: function () {
      this.sourceNode.disconnect();
      this.pullElement.pause();
      this.pullElement.srcObject = null;
      if (this.pullElement.parentNode) {
        document.body.removeChild(this.pullElement);
      }
      console.log("Stopped routing track ".concat(track.id, " to device ").concat(outputDeviceId));
    }
  };
  // Store the routing for future cleanup
  activeRoutings.set(elementId, routingInfo);
  return routingInfo;
}
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
var SUPPORTED_LANGUAGES = [{
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

export { DubitInstance, SUPPORTED_LANGUAGES, SUPPORTED_TRANSLATOR_VERSIONS, Translator, createNewInstance, getCompleteTranscript, getSupportedLanguages, routeTrackToDevice, validateApiKey };
