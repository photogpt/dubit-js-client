(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@daily-co/daily-js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@daily-co/daily-js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Dubit = {}, global.Daily));
})(this, (function (exports, Daily) { 'use strict';

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

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

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

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var eventemitter3 = {exports: {}};

    var hasRequiredEventemitter3;

    function requireEventemitter3 () {
    	if (hasRequiredEventemitter3) return eventemitter3.exports;
    	hasRequiredEventemitter3 = 1;
    	(function (module) {

    		var has = Object.prototype.hasOwnProperty
    		  , prefix = '~';

    		/**
    		 * Constructor to create a storage for our `EE` objects.
    		 * An `Events` instance is a plain object whose properties are event names.
    		 *
    		 * @constructor
    		 * @private
    		 */
    		function Events() {}

    		//
    		// We try to not inherit from `Object.prototype`. In some engines creating an
    		// instance in this way is faster than calling `Object.create(null)` directly.
    		// If `Object.create(null)` is not supported we prefix the event names with a
    		// character to make sure that the built-in object properties are not
    		// overridden or used as an attack vector.
    		//
    		if (Object.create) {
    		  Events.prototype = Object.create(null);

    		  //
    		  // This hack is needed because the `__proto__` property is still inherited in
    		  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    		  //
    		  if (!new Events().__proto__) prefix = false;
    		}

    		/**
    		 * Representation of a single event listener.
    		 *
    		 * @param {Function} fn The listener function.
    		 * @param {*} context The context to invoke the listener with.
    		 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
    		 * @constructor
    		 * @private
    		 */
    		function EE(fn, context, once) {
    		  this.fn = fn;
    		  this.context = context;
    		  this.once = once || false;
    		}

    		/**
    		 * Add a listener for a given event.
    		 *
    		 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
    		 * @param {(String|Symbol)} event The event name.
    		 * @param {Function} fn The listener function.
    		 * @param {*} context The context to invoke the listener with.
    		 * @param {Boolean} once Specify if the listener is a one-time listener.
    		 * @returns {EventEmitter}
    		 * @private
    		 */
    		function addListener(emitter, event, fn, context, once) {
    		  if (typeof fn !== 'function') {
    		    throw new TypeError('The listener must be a function');
    		  }

    		  var listener = new EE(fn, context || emitter, once)
    		    , evt = prefix ? prefix + event : event;

    		  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
    		  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
    		  else emitter._events[evt] = [emitter._events[evt], listener];

    		  return emitter;
    		}

    		/**
    		 * Clear event by name.
    		 *
    		 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
    		 * @param {(String|Symbol)} evt The Event name.
    		 * @private
    		 */
    		function clearEvent(emitter, evt) {
    		  if (--emitter._eventsCount === 0) emitter._events = new Events();
    		  else delete emitter._events[evt];
    		}

    		/**
    		 * Minimal `EventEmitter` interface that is molded against the Node.js
    		 * `EventEmitter` interface.
    		 *
    		 * @constructor
    		 * @public
    		 */
    		function EventEmitter() {
    		  this._events = new Events();
    		  this._eventsCount = 0;
    		}

    		/**
    		 * Return an array listing the events for which the emitter has registered
    		 * listeners.
    		 *
    		 * @returns {Array}
    		 * @public
    		 */
    		EventEmitter.prototype.eventNames = function eventNames() {
    		  var names = []
    		    , events
    		    , name;

    		  if (this._eventsCount === 0) return names;

    		  for (name in (events = this._events)) {
    		    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    		  }

    		  if (Object.getOwnPropertySymbols) {
    		    return names.concat(Object.getOwnPropertySymbols(events));
    		  }

    		  return names;
    		};

    		/**
    		 * Return the listeners registered for a given event.
    		 *
    		 * @param {(String|Symbol)} event The event name.
    		 * @returns {Array} The registered listeners.
    		 * @public
    		 */
    		EventEmitter.prototype.listeners = function listeners(event) {
    		  var evt = prefix ? prefix + event : event
    		    , handlers = this._events[evt];

    		  if (!handlers) return [];
    		  if (handlers.fn) return [handlers.fn];

    		  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    		    ee[i] = handlers[i].fn;
    		  }

    		  return ee;
    		};

    		/**
    		 * Return the number of listeners listening to a given event.
    		 *
    		 * @param {(String|Symbol)} event The event name.
    		 * @returns {Number} The number of listeners.
    		 * @public
    		 */
    		EventEmitter.prototype.listenerCount = function listenerCount(event) {
    		  var evt = prefix ? prefix + event : event
    		    , listeners = this._events[evt];

    		  if (!listeners) return 0;
    		  if (listeners.fn) return 1;
    		  return listeners.length;
    		};

    		/**
    		 * Calls each of the listeners registered for a given event.
    		 *
    		 * @param {(String|Symbol)} event The event name.
    		 * @returns {Boolean} `true` if the event had listeners, else `false`.
    		 * @public
    		 */
    		EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    		  var evt = prefix ? prefix + event : event;

    		  if (!this._events[evt]) return false;

    		  var listeners = this._events[evt]
    		    , len = arguments.length
    		    , args
    		    , i;

    		  if (listeners.fn) {
    		    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    		    switch (len) {
    		      case 1: return listeners.fn.call(listeners.context), true;
    		      case 2: return listeners.fn.call(listeners.context, a1), true;
    		      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
    		      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
    		      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
    		      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    		    }

    		    for (i = 1, args = new Array(len -1); i < len; i++) {
    		      args[i - 1] = arguments[i];
    		    }

    		    listeners.fn.apply(listeners.context, args);
    		  } else {
    		    var length = listeners.length
    		      , j;

    		    for (i = 0; i < length; i++) {
    		      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

    		      switch (len) {
    		        case 1: listeners[i].fn.call(listeners[i].context); break;
    		        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
    		        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
    		        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
    		        default:
    		          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
    		            args[j - 1] = arguments[j];
    		          }

    		          listeners[i].fn.apply(listeners[i].context, args);
    		      }
    		    }
    		  }

    		  return true;
    		};

    		/**
    		 * Add a listener for a given event.
    		 *
    		 * @param {(String|Symbol)} event The event name.
    		 * @param {Function} fn The listener function.
    		 * @param {*} [context=this] The context to invoke the listener with.
    		 * @returns {EventEmitter} `this`.
    		 * @public
    		 */
    		EventEmitter.prototype.on = function on(event, fn, context) {
    		  return addListener(this, event, fn, context, false);
    		};

    		/**
    		 * Add a one-time listener for a given event.
    		 *
    		 * @param {(String|Symbol)} event The event name.
    		 * @param {Function} fn The listener function.
    		 * @param {*} [context=this] The context to invoke the listener with.
    		 * @returns {EventEmitter} `this`.
    		 * @public
    		 */
    		EventEmitter.prototype.once = function once(event, fn, context) {
    		  return addListener(this, event, fn, context, true);
    		};

    		/**
    		 * Remove the listeners of a given event.
    		 *
    		 * @param {(String|Symbol)} event The event name.
    		 * @param {Function} fn Only remove the listeners that match this function.
    		 * @param {*} context Only remove the listeners that have this context.
    		 * @param {Boolean} once Only remove one-time listeners.
    		 * @returns {EventEmitter} `this`.
    		 * @public
    		 */
    		EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    		  var evt = prefix ? prefix + event : event;

    		  if (!this._events[evt]) return this;
    		  if (!fn) {
    		    clearEvent(this, evt);
    		    return this;
    		  }

    		  var listeners = this._events[evt];

    		  if (listeners.fn) {
    		    if (
    		      listeners.fn === fn &&
    		      (!once || listeners.once) &&
    		      (!context || listeners.context === context)
    		    ) {
    		      clearEvent(this, evt);
    		    }
    		  } else {
    		    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
    		      if (
    		        listeners[i].fn !== fn ||
    		        (once && !listeners[i].once) ||
    		        (context && listeners[i].context !== context)
    		      ) {
    		        events.push(listeners[i]);
    		      }
    		    }

    		    //
    		    // Reset the array, or remove it completely if we have no more listeners.
    		    //
    		    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    		    else clearEvent(this, evt);
    		  }

    		  return this;
    		};

    		/**
    		 * Remove all listeners, or those of the specified event.
    		 *
    		 * @param {(String|Symbol)} [event] The event name.
    		 * @returns {EventEmitter} `this`.
    		 * @public
    		 */
    		EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    		  var evt;

    		  if (event) {
    		    evt = prefix ? prefix + event : event;
    		    if (this._events[evt]) clearEvent(this, evt);
    		  } else {
    		    this._events = new Events();
    		    this._eventsCount = 0;
    		  }

    		  return this;
    		};

    		//
    		// Alias methods names because people roll like that.
    		//
    		EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    		EventEmitter.prototype.addListener = EventEmitter.prototype.on;

    		//
    		// Expose the prefix.
    		//
    		EventEmitter.prefixed = prefix;

    		//
    		// Allow `EventEmitter` to be imported as module namespace.
    		//
    		EventEmitter.EventEmitter = EventEmitter;

    		//
    		// Expose the module.
    		//
    		{
    		  module.exports = EventEmitter;
    		} 
    	} (eventemitter3));
    	return eventemitter3.exports;
    }

    var eventemitter3Exports = requireEventemitter3();
    var EventEmitter = /*@__PURE__*/getDefaultExportFromCjs(eventemitter3Exports);

    var API_URL = 'https://test-api.dubit.live';
    function enhanceError(baseMessage, originalError) {
      var errorMessage = baseMessage;
      if (originalError === null || originalError === void 0 ? void 0 : originalError.message) {
        errorMessage += " Original error: ".concat(originalError === null || originalError === void 0 ? void 0 : originalError.message);
      }
      var enhancedError = new Error(errorMessage);
      enhancedError.stack = originalError === null || originalError === void 0 ? void 0 : originalError.stack;
      try {
        if (typeof structuredClone === 'function') {
          enhancedError.cause = structuredClone(originalError);
        } else {
          enhancedError.cause = originalError;
        }
      } catch (cloneError) {
        enhancedError.cause = originalError;
      }
      return enhancedError;
    }
    function formatUserMessage(template, params) {
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, function (_, key) {
        return params.hasOwnProperty(key) ? String(params[key]) : "{".concat(key, "}");
      });
    }
    function logUserEvent(loggerCallback, eventDef, className, internalData, originalError, messageParams) {
      var userMessage = formatUserMessage(eventDef.userMessage, messageParams);
      var logEntry = {
        eventCode: eventDef.code,
        level: eventDef.level,
        userMessage: userMessage,
        className: className,
        timestamp: new Date().toISOString(),
        internalData: internalData,
        error: originalError
      };
      if (loggerCallback) {
        try {
          loggerCallback(logEntry);
        } catch (callbackError) {
          if (loggerCallback !== console.error) {
            console.error('Error occurred within the provided loggerCallback:', callbackError);
            console.error('Original Dubit log event:', logEntry);
          }
        }
      } else {
        var logArgs = ["[".concat(logEntry.timestamp, "] [").concat(logEntry.className, "] ").concat(logEntry.level.toUpperCase(), " (").concat(logEntry.eventCode, "): ").concat(logEntry.userMessage)];
        if (logEntry.internalData && Object.keys(logEntry.internalData).length > 0) {
          logArgs.push('Data:', logEntry.internalData);
        }
        if (logEntry.error) {
          logArgs.push('Error:', logEntry.error);
        }
        switch (logEntry.level) {
          case 'error':
            console.error.apply(console, logArgs);
            break;
          case 'warn':
            console.warn.apply(console, logArgs);
            break;
          case 'info':
            console.info.apply(console, logArgs);
            break;
          case 'debug':
            console.debug.apply(console, logArgs);
            break;
          default:
            console.log.apply(console, logArgs);
        }
      }
    }
    // util functions 
    function checkWord(a, b) {
      var bList = b.split(' ').filter(Boolean);
      var found = bList.reduce(function (i, w) {
        if (i == -1) return -1;
        var index = a.indexOf(w, i);
        return index == -1 ? -1 : index + w.length;
      }, 0);
      return found != -1;
    }
    var DubitEventEmitter = /** @class */function (_super) {
      __extends(DubitEventEmitter, _super);
      function DubitEventEmitter() {
        return _super !== null && _super.apply(this, arguments) || this;
      }
      return DubitEventEmitter;
    }(EventEmitter);
    function listenEvents(url) {
      return __awaiter(this, void 0, void 0, function () {
        var emitter, callObj;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              emitter = new DubitEventEmitter();
              callObj = Daily.createCallObject({
                allowMultipleCallInstances: true,
                videoSource: false,
                subscribeToTracksAutomatically: false
              });
              callObj.startRemoteParticipantsAudioLevelObserver(100);
              callObj.on('app-message', function (ev) {
                return emitter.emit('app-message', ev);
              });
              callObj.on('participant-joined', function (ev) {
                return emitter.emit('participant-joined', ev);
              });
              callObj.on('participant-left', function (ev) {
                return emitter.emit('participant-left', ev);
              });
              callObj.on('remote-participants-audio-level', function (ev) {
                return emitter.emit('remote-participants-audio-level', ev);
              });
              return [4 /*yield*/, callObj.join({
                url: url,
                audioSource: false,
                videoSource: false,
                subscribeToTracksAutomatically: true
              })];
            case 1:
              _a.sent();
              return [2 /*return*/, {
                dubitEmitter: emitter,
                leaveCall: function () {
                  callObj.leave();
                }
              }];
          }
        });
      });
    }
    function createNewInstance(_a) {
      return __awaiter(this, arguments, void 0, function (_b) {
        var response, errorData, errorMessage, error, data, instanceId, roomUrl, instance, error_1, completeError, baseMessageFromError;
        var token = _b.token,
          _c = _b.apiUrl,
          apiUrl = _c === void 0 ? API_URL : _c,
          _d = _b.loggerCallback,
          loggerCallback = _d === void 0 ? null : _d;
        return __generator(this, function (_e) {
          switch (_e.label) {
            case 0:
              logUserEvent(loggerCallback, DubitLogEvents.INSTANCE_CREATING, 'DubitSDK');
              _e.label = 1;
            case 1:
              _e.trys.push([1, 9,, 10]);
              return [4 /*yield*/, fetch("".concat(apiUrl, "/meeting/new-meeting"), {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: "Bearer ".concat(token)
                }
              })];
            case 2:
              response = _e.sent();
              errorData = null;
              if (!!response.ok) return [3 /*break*/, 7];
              _e.label = 3;
            case 3:
              _e.trys.push([3, 5,, 6]);
              return [4 /*yield*/, response.json()];
            case 4:
              errorData = _e.sent();
              return [3 /*break*/, 6];
            case 5:
              _e.sent();
              errorData = {
                message: "Received non-JSON error response (HTTP ".concat(response.status, ")")
              };
              return [3 /*break*/, 6];
            case 6:
              errorMessage = (errorData === null || errorData === void 0 ? void 0 : errorData.message) || "Failed to create connection with Dubit servers (HTTP ".concat(response.status, ")");
              error = new Error(errorMessage);
              logUserEvent(loggerCallback, DubitLogEvents.INSTANCE_CREATE_FAILED, 'DubitSDK', {
                status: response.status,
                responseData: errorData
              }, error);
              throw error;
            case 7:
              return [4 /*yield*/, response.json()];
            case 8:
              data = _e.sent();
              instanceId = data.meeting_id;
              roomUrl = data.roomUrl;
              instance = new DubitInstance(instanceId, roomUrl, token, apiUrl);
              instance.setLoggerCallback(loggerCallback);
              instance._log(DubitLogEvents.INSTANCE_CREATED, {
                instanceId: instanceId
              });
              return [2 /*return*/, instance];
            case 9:
              error_1 = _e.sent();
              completeError = enhanceError('Unable to create Dubit instance', error_1);
              baseMessageFromError = completeError.message.split('. Original error:')[0];
              if (error_1.message !== baseMessageFromError) {
                logUserEvent(loggerCallback, DubitLogEvents.INTERNAL_ERROR, 'DubitSDK', undefined, completeError);
              }
              throw completeError;
            case 10:
              return [2 /*return*/];
          }
        });
      });
    }
    function getSupportedLanguages() {
      return SUPPORTED_LANGUAGES;
    }
    function validateApiKey(apiKey) {
      return __awaiter(this, void 0, void 0, function () {
        var response, result, error_2, completeError;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 3,, 4]);
              return [4 /*yield*/, fetch("".concat(API_URL, "/user/validate/api_key/").concat(apiKey), {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
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
              completeError = enhanceError('Unable to validate API key. Please check your network connection and API key', error_2);
              console.error('dubit.validateApiKey error:', completeError);
              throw completeError;
            case 4:
              return [2 /*return*/];
          }
        });
      });
    }
    function getCompleteTranscript(_a) {
      return __awaiter(this, arguments, void 0, function (_b) {
        var response, errorData, errorMessage, error_3;
        var instanceId = _b.instanceId,
          token = _b.token,
          _c = _b.apiUrl,
          apiUrl = _c === void 0 ? API_URL : _c;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              _d.trys.push([0, 4,, 5]);
              return [4 /*yield*/, fetch("".concat(apiUrl, "/meeting/").concat(instanceId, "/transcripts"), {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: "Bearer ".concat(token)
                }
              })];
            case 1:
              response = _d.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              errorData = _d.sent();
              errorMessage = (errorData === null || errorData === void 0 ? void 0 : errorData.message) || 'Failed to fetch complete transcript';
              throw new Error(errorMessage);
            case 3:
              return [2 /*return*/, response.json()];
            case 4:
              error_3 = _d.sent();
              console.error('dubit.getCompleteTranscript error:', error_3);
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
      if (params.voiceType !== 'male' && params.voiceType !== 'female') {
        return new Error("Unsupported voiceType: ".concat(params.voiceType, ". Supported voice types: male, female"));
      }
      if (params.inputAudioTrack === null) {
        return new Error('inputAudioTrack is required');
      }
      if (params.version && !SUPPORTED_TRANSLATOR_VERSIONS.map(function (x) {
        return x.version;
      }).includes(params.version)) {
        return new Error("Unsupported version: ".concat(params.version, ". Supported versions: ").concat(SUPPORTED_TRANSLATOR_VERSIONS));
      }
      return null;
    }
    var DubitInstance = /** @class */function () {
      function DubitInstance(instanceId, roomUrl, token, apiUrl) {
        this.activeTranslators = new Map();
        this.loggerCallback = null;
        this.instanceId = instanceId;
        this.roomUrl = roomUrl;
        this.token = token;
        this.apiUrl = apiUrl;
      }
      DubitInstance.prototype.setLoggerCallback = function (callback) {
        if (typeof callback === 'function' || callback === null) {
          var hadCallback = !!this.loggerCallback;
          this.loggerCallback = callback;
          if (!!callback !== hadCallback || !hadCallback) {
            this._log(DubitLogEvents.LOGGER_CALLBACK_SET, {
              hasCallback: !!callback
            });
          }
        } else {
          logUserEvent(this.loggerCallback, DubitLogEvents.LOGGER_CALLBACK_INVALID, this.constructor.name, {
            providedType: typeof callback
          });
          this.loggerCallback = null;
        }
      };
      DubitInstance.prototype._log = function (eventDef, internalData, originalError, messageParams) {
        logUserEvent(this.loggerCallback, eventDef, this.constructor.name, internalData, originalError, messageParams);
      };
      DubitInstance.prototype.addTranslator = function (params) {
        return __awaiter(this, void 0, void 0, function () {
          var validationError, translator, error_4, enhancedError;
          var _this = this;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                this._log(DubitLogEvents.TRANSLATOR_ADDING, {
                  params: params
                });
                validationError = validateTranslatorParams(params);
                if (validationError) {
                  return [2 /*return*/, Promise.reject(validationError)];
                }
                translator = new Translator(__assign({
                  instanceId: this.instanceId,
                  roomUrl: this.roomUrl,
                  token: this.token,
                  apiUrl: this.apiUrl,
                  loggerCallback: this.loggerCallback
                }, params));
                translator.onDestroy = function () {
                  var participantId = translator.getParticipantId();
                  _this.activeTranslators.delete(participantId);
                  _this._log(DubitLogEvents.TRANSLATOR_REMOVED, {
                    participantId: participantId
                  });
                };
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3,, 4]);
                return [4 /*yield*/, translator.init()];
              case 2:
                _a.sent();
                this.activeTranslators.set(translator.getParticipantId(), translator);
                return [2 /*return*/, translator];
              case 3:
                error_4 = _a.sent();
                enhancedError = enhanceError('Failed to add and initialize translator', error_4);
                this._log(DubitLogEvents.INTERNAL_ERROR, {
                  params: params,
                  stage: 'addTranslator'
                }, enhancedError);
                return [2 /*return*/, Promise.reject(enhancedError)];
              case 4:
                return [2 /*return*/];
            }
          });
        });
      };
      DubitInstance.prototype.getActiveTranslators = function () {
        return this.activeTranslators;
      };
      DubitInstance.prototype.getRoomId = function () {
        var parts = this.roomUrl.split('/');
        return parts[parts.length - 1] || '';
      };
      return DubitInstance;
    }();
    var Translator = /** @class */function () {
      function Translator(params) {
        var _this = this;
        this.version = 'latest';
        this.keywords = false;
        this.translationBeep = false;
        this.hqVoices = false;
        this.callObject = null;
        this.translatedTrack = null;
        this.participantId = '';
        this.translatorParticipantId = '';
        // private participantTracks: Map<string, MediaStreamTrack> = new Map();
        this.outputDeviceId = null;
        this.loggerCallback = null;
        this.onTranslatedTrackCallback = null;
        this.onCaptionsCallback = null;
        this.onNetworkQualityChangeCallback = null;
        this.getInstanceId = function () {
          return _this.instanceId;
        };
        this.handleTrackStarted = function (event) {
          var _a;
          // TODO: add better identifier like some kind of id in metadata or user_participant_id in translator name
          var isValidTranslatorTrack = event.track && event.track.kind === 'audio' && !((_a = event === null || event === void 0 ? void 0 : event.participant) === null || _a === void 0 ? void 0 : _a.local) && checkWord(event.participant.user_name, _this._getTranslatorLabel());
          if (isValidTranslatorTrack) {
            _this._log(DubitLogEvents.TRANSLATOR_TRACK_READY, {
              participantName: event.participant.user_name,
              trackId: event.track.id
            }, undefined, {
              fromLang: _this.fromLang,
              toLang: _this.toLang
            });
            if (_this.onTranslatedTrackCallback) {
              try {
                _this.onTranslatedTrackCallback(event.track);
                _this.translatedTrack = event.track;
              } catch (callbackError) {
                _this._log(DubitLogEvents.INTERNAL_ERROR, {
                  handler: 'onTranslatedTrackCallback'
                }, enhanceError('Error in onTranslatedTrackReady callback', callbackError));
              }
            }
          }
        };
        this.handleParticipantJoined = function (event) {
          var _a, _b;
          if ((_a = event === null || event === void 0 ? void 0 : event.participant) === null || _a === void 0 ? void 0 : _a.local) return;
          if (checkWord(event.participant.user_name, _this._getTranslatorLabel())) {
            _this.translatorParticipantId = event.participant.session_id;
            _this._log(DubitLogEvents.TRANSLATOR_PARTICIPANT_JOINED, {
              participantId: _this.translatorParticipantId,
              participantName: event.participant.user_name
            });
            (_b = _this.callObject) === null || _b === void 0 ? void 0 : _b.updateParticipant(_this.translatorParticipantId, {
              setSubscribedTracks: {
                audio: true
              }
            });
          }
        };
        this.handleAppMessage = function (event) {
          var _a;
          var data = event.data;
          if (((_a = data === null || data === void 0 ? void 0 : data.type) === null || _a === void 0 ? void 0 : _a.includes('transcript')) && (data === null || data === void 0 ? void 0 : data.transcript) && _this.onCaptionsCallback) {
            var validTypes = ['user-transcript', 'translation-transcript', 'user-interim-transcript'];
            if (validTypes.includes(data.type) && data.participant_id === _this.participantId) {
              try {
                _this.onCaptionsCallback(data);
              } catch (callbackError) {
                _this._log(DubitLogEvents.INTERNAL_ERROR, {
                  handler: 'onCaptionsCallback',
                  messageData: data
                }, enhanceError('Error in onCaptions callback', callbackError));
              }
            }
          }
        };
        this.handleParticipantLeft = function (event) {
          if (!event.participant.local && checkWord(event.participant.user_name, _this._getTranslatorLabel())) {
            _this._log(DubitLogEvents.TRANSLATOR_PARTICIPANT_LEFT, {
              participantId: event.participant.session_id,
              participantName: event.participant.user_name
            });
            if (_this.translatedTrack) {
              _this.translatedTrack = null;
            }
          }
        };
        this.handleNetworkQualityChange = function (event) {
          var _a;
          (_a = _this.onNetworkQualityChangeCallback) === null || _a === void 0 ? void 0 : _a.call(_this, event);
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
        if (params.onTranslatedTrackReady) this.onTranslatedTrackCallback = params.onTranslatedTrackReady;
        if (params.onCaptions) this.onCaptionsCallback = params.onCaptions;
        if (params.onNetworkQualityChange) this.onNetworkQualityChangeCallback = params.onNetworkQualityChange;
      }
      Translator.prototype._log = function (eventDef, internalData, originalError, messageParams) {
        logUserEvent(this.loggerCallback, eventDef, this.constructor.name, internalData, originalError, messageParams);
      };
      // TODO: improve this label, it should rather be some kind of metadata or user_participant_id
      Translator.prototype._getTranslatorLabel = function () {
        var _this = this;
        var _a, _b;
        var fromLangLabel = (_a = SUPPORTED_LANGUAGES.find(function (x) {
          return x.langCode == _this.fromLang;
        })) === null || _a === void 0 ? void 0 : _a.label;
        var toLangLabel = (_b = SUPPORTED_LANGUAGES.find(function (x) {
          return x.langCode == _this.toLang;
        })) === null || _b === void 0 ? void 0 : _b.label;
        return "Translator ".concat(fromLangLabel, " -> ").concat(toLangLabel, " : ").concat(this.participantId);
      };
      Translator.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
          var enhancedError, audioSource, error_5, enhancedError, participants, error_6, messageParams, error_7;
          var _a, _b, _c, _d, _e;
          return __generator(this, function (_f) {
            switch (_f.label) {
              case 0:
                try {
                  this.callObject = Daily.createCallObject({
                    allowMultipleCallInstances: true,
                    videoSource: false,
                    subscribeToTracksAutomatically: false
                  });
                  this._log(DubitLogEvents.TRANSLATOR_INITIALIZING, {
                    stage: 'callObjectCreated'
                  });
                } catch (error) {
                  enhancedError = enhanceError('Failed to create call object', error);
                  this._log(DubitLogEvents.TRANSLATOR_INIT_FAILED_CALL_OBJECT, undefined, enhancedError);
                  throw enhancedError;
                }
                audioSource = false;
                if (this.inputAudioTrack && this.inputAudioTrack.readyState === 'live') {
                  audioSource = this.inputAudioTrack;
                }
                _f.label = 1;
              case 1:
                _f.trys.push([1, 3,, 5]);
                this._log(DubitLogEvents.TRANSLATOR_JOINING_ROOM, {
                  roomUrl: this.roomUrl,
                  hasAudioSource: !!audioSource
                });
                return [4 /*yield*/, this.callObject.join({
                  url: this.roomUrl,
                  audioSource: audioSource,
                  videoSource: false,
                  subscribeToTracksAutomatically: false,
                  startAudioOff: audioSource === false,
                  inputSettings: {
                    audio: {
                      processor: {
                        type: 'noise-cancellation'
                      }
                    }
                  }
                })];
              case 2:
                _f.sent();
                return [3 /*break*/, 5];
              case 3:
                error_5 = _f.sent();
                enhancedError = enhanceError('Failed to establish connection', error_5);
                this._log(DubitLogEvents.TRANSLATOR_JOIN_FAILED, {
                  roomUrl: this.roomUrl
                }, enhancedError);
                return [4 /*yield*/, (_a = this.callObject) === null || _a === void 0 ? void 0 : _a.destroy()];
              // Clean up partially created call object
              case 4:
                _f.sent(); // Clean up partially created call object
                this.callObject = null;
                throw enhancedError;
              case 5:
                participants = this.callObject.participants();
                this.participantId = participants.local.session_id;
                _f.label = 6;
              case 6:
                _f.trys.push([6, 8,, 11]);
                this._log(DubitLogEvents.TRANSLATOR_REGISTERING, {
                  participantId: this.participantId
                });
                return [4 /*yield*/, this.registerParticipant(this.participantId)];
              case 7:
                _f.sent();
                return [3 /*break*/, 11];
              case 8:
                error_6 = _f.sent();
                return [4 /*yield*/, (_b = this.callObject) === null || _b === void 0 ? void 0 : _b.leave()];
              case 9:
                _f.sent();
                return [4 /*yield*/, (_c = this.callObject) === null || _c === void 0 ? void 0 : _c.destroy()];
              case 10:
                _f.sent();
                this.callObject = null;
                throw error_6;
              case 11:
                _f.trys.push([11, 13,, 16]);
                messageParams = {
                  fromLang: this.fromLang,
                  toLang: this.toLang
                };
                this._log(DubitLogEvents.TRANSLATOR_REQUESTING, {
                  /* bot params could go here */
                }, undefined, messageParams);
                return [4 /*yield*/, this.addTranslationBot(this.roomUrl, this.participantId, this.fromLang, this.toLang, this.voiceType, this.version, this.keywords, this.translationBeep, this.hqVoices)];
              case 12:
                _f.sent();
                return [3 /*break*/, 16];
              case 13:
                error_7 = _f.sent();
                return [4 /*yield*/, (_d = this.callObject) === null || _d === void 0 ? void 0 : _d.leave()];
              case 14:
                _f.sent();
                return [4 /*yield*/, (_e = this.callObject) === null || _e === void 0 ? void 0 : _e.destroy()];
              case 15:
                _f.sent();
                this.callObject = null;
                throw error_7;
              case 16:
                this.callObject.on('track-started', this.handleTrackStarted);
                this.callObject.on('participant-joined', this.handleParticipantJoined);
                this.callObject.on('app-message', this.handleAppMessage);
                this.callObject.on('participant-left', this.handleParticipantLeft);
                this.callObject.on('network-quality-change', this.handleNetworkQualityChange);
                this._log(DubitLogEvents.TRANSLATOR_INIT_COMPLETE, {
                  fromLang: this.fromLang,
                  toLang: this.toLang,
                  version: this.version
                });
                return [2 /*return*/];
            }
          });
        });
      };
      Translator.prototype.registerParticipant = function (participantId) {
        return __awaiter(this, void 0, void 0, function () {
          var response, errorData, errorMessage, error, enhancedError, error_8, enhancedError;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                _b.trys.push([0, 7,, 8]);
                return [4 /*yield*/, fetch("".concat(this.apiUrl, "/participant"), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer ".concat(this.token)
                  },
                  body: JSON.stringify({
                    id: participantId
                  })
                })];
              case 1:
                response = _b.sent();
                errorData = null;
                if (!!response.ok) return [3 /*break*/, 6];
                _b.label = 2;
              case 2:
                _b.trys.push([2, 4,, 5]);
                return [4 /*yield*/, response.json()];
              case 3:
                errorData = _b.sent();
                return [3 /*break*/, 5];
              case 4:
                _b.sent();
                return [3 /*break*/, 5];
              case 5:
                errorMessage = (errorData === null || errorData === void 0 ? void 0 : errorData.message) || "Failed API call to register participant (HTTP ".concat(response.status, ")");
                error = new Error(errorMessage);
                enhancedError = enhanceError('Participant registration failed', error);
                this._log(DubitLogEvents.TRANSLATOR_REGISTER_FAILED, {
                  participantId: participantId,
                  status: response.status,
                  responseData: errorData
                }, enhancedError);
                throw enhancedError;
              case 6:
                return [3 /*break*/, 8];
              case 7:
                error_8 = _b.sent();
                enhancedError = enhanceError('Error during participant registration', error_8);
                if (error_8.eventCode !== DubitLogEvents.TRANSLATOR_REGISTER_FAILED.code) {
                  this._log(DubitLogEvents.TRANSLATOR_REGISTER_FAILED, {
                    participantId: participantId
                  }, enhancedError);
                }
                throw enhancedError;
              case 8:
                return [2 /*return*/];
            }
          });
        });
      };
      // Adds a translation bot for the given participant
      Translator.prototype.addTranslationBot = function (roomUrl, participantId, fromLanguage, toLanguage, voiceType, version, keywords, translationBeep, hqVoices) {
        return __awaiter(this, void 0, void 0, function () {
          var apiPayload, messageParams, response, errorData, errorMessage, error, enhancedError, error_9, enhancedError;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                apiPayload = {
                  room_url: roomUrl,
                  from_language: fromLanguage,
                  to_language: toLanguage,
                  participant_id: participantId,
                  bot_type: 'translation',
                  male: voiceType === 'male',
                  version: version,
                  keywords: keywords,
                  translation_beep: translationBeep,
                  hq_voices: hqVoices,
                  metadata: __assign({}, this.metadata)
                };
                messageParams = {
                  fromLang: fromLanguage,
                  toLang: toLanguage
                };
                _b.label = 1;
              case 1:
                _b.trys.push([1, 8,, 9]);
                return [4 /*yield*/, fetch("".concat(this.apiUrl, "/meeting/bot/join"), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer ".concat(this.token)
                  },
                  body: JSON.stringify(apiPayload)
                })];
              case 2:
                response = _b.sent();
                errorData = null;
                if (!!response.ok) return [3 /*break*/, 7];
                _b.label = 3;
              case 3:
                _b.trys.push([3, 5,, 6]);
                return [4 /*yield*/, response.json()];
              case 4:
                errorData = _b.sent();
                return [3 /*break*/, 6];
              case 5:
                _b.sent();
                return [3 /*break*/, 6];
              case 6:
                errorMessage = (errorData === null || errorData === void 0 ? void 0 : errorData.message) || "Failed API call to request translator service (HTTP ".concat(response.status, ")");
                error = new Error(errorMessage);
                enhancedError = enhanceError('Translator request failed', error) // Enhance here
                ;
                this._log(DubitLogEvents.TRANSLATOR_REQUEST_FAILED, {
                  payload: apiPayload,
                  status: response.status,
                  responseData: errorData
                }, enhancedError, messageParams);
                throw enhancedError;
              case 7:
                return [3 /*break*/, 9];
              case 8:
                error_9 = _b.sent();
                enhancedError = enhanceError('Error requesting translation service', error_9);
                if (error_9.eventCode !== DubitLogEvents.TRANSLATOR_REQUEST_FAILED.code) {
                  this._log(DubitLogEvents.TRANSLATOR_REQUEST_FAILED, {
                    payload: apiPayload
                  }, enhancedError, messageParams);
                }
                throw enhancedError;
              case 9:
                return [2 /*return*/];
            }
          });
        });
      };
      Translator.prototype.onTranslatedTrackReady = function (callback) {
        if (typeof callback !== 'function') {
          this._log(DubitLogEvents.INTERNAL_ERROR, {
            reason: 'Invalid callback provided to onTranslatedTrackReady'
          });
          return;
        }
        this.onTranslatedTrackCallback = callback;
        if (this.translatedTrack) {
          try {
            callback(this.translatedTrack);
          } catch (callbackError) {
            this._log(DubitLogEvents.INTERNAL_ERROR, {
              handler: 'onTranslatedTrackReadyImmediate'
            }, enhanceError('Error in onTranslatedTrackReady callback (immediate invoke)', callbackError));
          }
        }
      };
      Translator.prototype.onCaptions = function (callback) {
        if (typeof callback !== 'function') {
          this._log(DubitLogEvents.INTERNAL_ERROR, {
            reason: 'Invalid callback provided to onCaptions'
          });
          return;
        }
        this.onCaptionsCallback = callback;
        this._log(DubitLogEvents.TRANSLATOR_CAPTIONS_READY);
      };
      Translator.prototype.updateInputTrack = function (newInputTrack) {
        return __awaiter(this, void 0, void 0, function () {
          var trackId, trackState, error, targetTrack, constraints, stream, e_1, error, audioSource, e_2, error;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                trackId = newInputTrack === null || newInputTrack === void 0 ? void 0 : newInputTrack.id;
                trackState = newInputTrack === null || newInputTrack === void 0 ? void 0 : newInputTrack.readyState;
                this._log(DubitLogEvents.INPUT_TRACK_UPDATING, {
                  hasNewTrack: !!newInputTrack,
                  trackId: trackId,
                  trackState: trackState
                });
                if (!this.callObject) {
                  error = new Error('Translator not initialized (callObject is null)');
                  this._log(DubitLogEvents.INPUT_TRACK_UPDATE_FAILED, {
                    reason: 'Not initialized'
                  }, error);
                  throw error;
                }
                targetTrack = newInputTrack;
                if (!(targetTrack && targetTrack.readyState === 'ended')) return [3 /*break*/, 4];
                this._log(DubitLogEvents.INPUT_TRACK_ENDED_RECOVERING, {
                  trackId: targetTrack.id
                });
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3,, 4]);
                constraints = {
                  audio: {
                    deviceId: targetTrack.getSettings().deviceId ? {
                      exact: targetTrack.getSettings().deviceId
                    } : undefined
                  }
                };
                return [4 /*yield*/, navigator.mediaDevices.getUserMedia(constraints)];
              case 2:
                stream = _a.sent();
                targetTrack = stream.getAudioTracks()[0];
                this._log(DubitLogEvents.INPUT_TRACK_UPDATED, {
                  trackId: targetTrack.id,
                  reason: 'Recovered ended track'
                });
                return [3 /*break*/, 4];
              case 3:
                e_1 = _a.sent();
                error = enhanceError('Failed to get new audio track via getUserMedia', e_1);
                this._log(DubitLogEvents.INPUT_TRACK_RECOVERY_FAILED, {
                  originalTrackId: trackId
                }, error);
                targetTrack = null;
                this._log(DubitLogEvents.INPUT_TRACK_UPDATE_FAILED, {
                  reason: 'Recovery failed, setting input to null'
                });
                return [3 /*break*/, 4];
              case 4:
                this.inputAudioTrack = targetTrack;
                _a.label = 5;
              case 5:
                _a.trys.push([5, 7,, 8]);
                audioSource = targetTrack || false;
                return [4 /*yield*/, this.callObject.setInputDevicesAsync({
                  audioSource: audioSource
                })];
              case 6:
                _a.sent();
                this.callObject.setLocalAudio(!!targetTrack);
                this._log(DubitLogEvents.INPUT_TRACK_UPDATED, {
                  trackId: targetTrack === null || targetTrack === void 0 ? void 0 : targetTrack.id,
                  enabled: !!targetTrack
                });
                return [3 /*break*/, 8];
              case 7:
                e_2 = _a.sent();
                error = enhanceError('Failed call to setInputDevicesAsync or setLocalAudio', e_2);
                this._log(DubitLogEvents.INPUT_TRACK_UPDATE_FAILED, {
                  trackId: targetTrack === null || targetTrack === void 0 ? void 0 : targetTrack.id
                }, error);
                throw error;
              case 8:
                return [2 /*return*/];
            }
          });
        });
      };
      Translator.prototype.getParticipantId = function () {
        return this.participantId;
      };
      Translator.prototype.getTranslatorParticipantId = function () {
        return this.translatorParticipantId;
      };
      Translator.prototype.getTranslatedTrack = function () {
        return this.translatedTrack;
      };
      Translator.prototype.getNetworkStats = function () {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            return [2 /*return*/, this.callObject.getNetworkStats()];
          });
        });
      };
      Translator.prototype.getTranslatorVolumeLevel = function () {
        var _a;
        if (!this.translatorParticipantId) {
          return 0;
        }
        var remoteParticipantsAudioLevels = this.callObject.getRemoteParticipantsAudioLevel();
        return (_a = remoteParticipantsAudioLevels[this.translatorParticipantId]) !== null && _a !== void 0 ? _a : 0;
      };
      Translator.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
          var participantId, leaveError_1, destroyError_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                participantId = this.participantId // Capture before nulling
                ;
                this._log(DubitLogEvents.TRANSLATOR_DESTROYED, {
                  stage: 'starting',
                  participantId: participantId
                });
                if (!this.callObject) return [3 /*break*/, 8];
                this.callObject.off('track-started', this.handleTrackStarted);
                this.callObject.off('participant-joined', this.handleParticipantJoined);
                this.callObject.off('app-message', this.handleAppMessage);
                this.callObject.off('participant-left', this.handleParticipantLeft);
                this.callObject.off('network-quality-change', this.handleNetworkQualityChange);
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3,, 4]);
                return [4 /*yield*/, this.callObject.leave()];
              case 2:
                _a.sent();
                return [3 /*break*/, 4];
              case 3:
                leaveError_1 = _a.sent();
                this._log(DubitLogEvents.INTERNAL_ERROR, {
                  stage: 'destroyLeaveCall'
                }, enhanceError('Error leaving call during destroy', leaveError_1));
                return [3 /*break*/, 4];
              case 4:
                _a.trys.push([4, 6,, 7]);
                return [4 /*yield*/, this.callObject.destroy()];
              case 5:
                _a.sent();
                return [3 /*break*/, 7];
              case 6:
                destroyError_1 = _a.sent();
                this._log(DubitLogEvents.INTERNAL_ERROR, {
                  stage: 'destroyCallObject'
                }, enhanceError('Error destroying call object during destroy', destroyError_1));
                return [3 /*break*/, 7];
              case 7:
                this.callObject = null;
                _a.label = 8;
              case 8:
                this.onTranslatedTrackCallback = null;
                this.onCaptionsCallback = null;
                this.translatedTrack = null;
                if (this.onDestroy) {
                  try {
                    this.onDestroy();
                  } catch (destroyCbError) {
                    this._log(DubitLogEvents.INTERNAL_ERROR, {
                      stage: 'onDestroyCallback'
                    }, enhanceError('Error in onDestroy callback', destroyCbError));
                  }
                }
                this._log(DubitLogEvents.TRANSLATOR_DESTROYED, {
                  stage: 'complete',
                  participantId: participantId
                });
                return [2 /*return*/];
            }
          });
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
      if (audioContext.state === 'suspended') {
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
      if ('setSinkId' in AudioContext.prototype) {
        audioContext //@ts-ignore
        .setSinkId(outputDeviceId).then(function () {
          return console.log("Set sinkId ".concat(outputDeviceId, " on AudioContext directly"));
        }).catch(function (err) {
          return console.error("Failed to set sinkId on AudioContext: ".concat(err));
        });
      }
      // Create a hidden audio element that will pull from the WebRTC stream
      // This is necessary to get the WebRTC subsystem to deliver the audio to WebAudio
      var pullElement = document.createElement('audio');
      pullElement.id = "pull-".concat(elementId);
      pullElement.srcObject = mediaStream;
      pullElement.style.display = 'none';
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
        console.error('Metadata serialization error; falling back to empty object.', error);
        return {};
      }
    }
    /**
     * An array of available translator versions.
     */
    var SUPPORTED_TRANSLATOR_VERSIONS = [{
      label: 'V1 (Flash)',
      version: '1'
    }, {
      label: 'V2 (Pro)',
      version: '2'
    }, {
      label: "V3' (Noise Reduction)",
      version: '3'
    }];
    var SUPPORTED_LANGUAGES = [{
      langCode: 'multi',
      label: 'Multilingual (Spanish + English)'
    }, {
      langCode: 'bg',
      label: 'Bulgarian'
    }, {
      langCode: 'ca',
      label: 'Catalan'
    }, {
      langCode: 'zh-CN',
      label: 'Chinese (Mainland China)'
    }, {
      langCode: 'zh-TW',
      label: 'Chinese (Taiwan)'
    }, {
      langCode: 'zh-HK',
      label: 'Chinese (Traditional, Hong Kong)'
    }, {
      langCode: 'cs',
      label: 'Czech'
    }, {
      langCode: 'da',
      label: 'Danish'
    }, {
      langCode: 'da-DK',
      label: 'Danish'
    }, {
      langCode: 'nl',
      label: 'Dutch'
    }, {
      langCode: 'en',
      label: 'English'
    }, {
      langCode: 'en-US',
      label: 'English (United States)'
    }, {
      langCode: 'en-AU',
      label: 'English (Australia)'
    }, {
      langCode: 'en-GB',
      label: 'English (United Kingdom)'
    }, {
      langCode: 'en-NZ',
      label: 'English (New Zealand)'
    }, {
      langCode: 'en-IN',
      label: 'English (India)'
    }, {
      langCode: 'et',
      label: 'Estonian'
    }, {
      langCode: 'fi',
      label: 'Finnish'
    }, {
      langCode: 'nl-BE',
      label: 'Flemish'
    }, {
      langCode: 'fr',
      label: 'French'
    }, {
      langCode: 'fr-CA',
      label: 'French (Canada)'
    }, {
      langCode: 'de',
      label: 'German'
    }, {
      langCode: 'de-CH',
      label: 'German (Switzerland)'
    }, {
      langCode: 'el',
      label: 'Greek'
    }, {
      langCode: 'hi',
      label: 'Hindi'
    }, {
      langCode: 'hu',
      label: 'Hungarian'
    }, {
      langCode: 'id',
      label: 'Indonesian'
    }, {
      langCode: 'it',
      label: 'Italian'
    }, {
      langCode: 'ja',
      label: 'Japanese'
    }, {
      langCode: 'ko-KR',
      label: 'Korean'
    }, {
      langCode: 'lv',
      label: 'Latvian'
    }, {
      langCode: 'lt',
      label: 'Lithuanian'
    }, {
      langCode: 'ms',
      label: 'Malay'
    }, {
      langCode: 'no',
      label: 'Norwegian'
    }, {
      langCode: 'pl',
      label: 'Polish'
    }, {
      langCode: 'pt',
      label: 'Portuguese'
    }, {
      langCode: 'pt-BR',
      label: 'Portuguese (Brazil)'
    }, {
      langCode: 'pt-PT',
      label: 'Portuguese (Portugal)'
    }, {
      langCode: 'ro',
      label: 'Romanian'
    }, {
      langCode: 'ru',
      label: 'Russian'
    }, {
      langCode: 'sk',
      label: 'Slovak'
    }, {
      langCode: 'es',
      label: 'Spanish'
    }, {
      langCode: 'es-419',
      label: 'Spanish (Latin America & Caribbean)'
    }, {
      langCode: 'sv-SE',
      label: 'Swedish (Sweden)'
    }, {
      langCode: 'th-TH',
      label: 'Thai (Thailand)'
    }, {
      langCode: 'tr',
      label: 'Turkish'
    }, {
      langCode: 'uk',
      label: 'Ukrainian'
    }, {
      langCode: 'vi',
      label: 'Vietnamese'
    }];
    var DubitLogEvents = {
      // Instance Lifecycle
      INSTANCE_CREATING: {
        code: 'INSTANCE_CREATING',
        level: 'info',
        userMessage: 'Connecting to Dubit service...',
        description: 'Attempting to fetch initial meeting details from the API.'
      },
      INSTANCE_CREATED: {
        code: 'INSTANCE_CREATED',
        level: 'info',
        userMessage: 'Dubit service connected.',
        description: 'Successfully created the DubitInstance after API confirmation.'
      },
      INSTANCE_CREATE_FAILED: {
        code: 'INSTANCE_CREATE_FAILED',
        level: 'error',
        userMessage: 'Failed to connect to Dubit service. Please check connection or token.',
        description: 'Error occurred during the API call to create a new meeting instance.'
      },
      LOGGER_CALLBACK_SET: {
        code: 'LOGGER_CALLBACK_SET',
        level: 'debug',
        userMessage: 'Logger configured.',
        description: 'The logger callback function has been successfully set or updated.'
      },
      LOGGER_CALLBACK_INVALID: {
        code: 'LOGGER_CALLBACK_INVALID',
        level: 'warn',
        userMessage: 'Invalid logger configuration provided.',
        description: 'An invalid value was provided for the logger callback.'
      },
      // Translator Lifecycle
      TRANSLATOR_ADDING: {
        code: 'TRANSLATOR_ADDING',
        level: 'info',
        userMessage: 'Adding translator...',
        description: 'Starting the process to add a new Translator instance.'
      },
      TRANSLATOR_INITIALIZING: {
        code: 'TRANSLATOR_INITIALIZING',
        level: 'info',
        userMessage: 'Initializing translation session...',
        description: 'Creating the underlying call object and preparing to join the room.'
      },
      TRANSLATOR_INIT_FAILED_CALL_OBJECT: {
        code: 'TRANSLATOR_INIT_FAILED_CALL_OBJECT',
        level: 'error',
        userMessage: 'Failed to create translation session component.',
        description: 'Error creating the Daily call object.'
      },
      TRANSLATOR_JOINING_ROOM: {
        code: 'TRANSLATOR_JOINING_ROOM',
        level: 'info',
        userMessage: 'Connecting to translation room...',
        description: 'Attempting to join the Daily room.'
      },
      TRANSLATOR_JOIN_FAILED: {
        code: 'TRANSLATOR_JOIN_FAILED',
        level: 'error',
        userMessage: 'Failed to connect to translation room.',
        description: 'Error joining the Daily room.'
      },
      TRANSLATOR_REGISTERING: {
        code: 'TRANSLATOR_REGISTERING',
        level: 'debug',
        userMessage: 'Registering translator participant...',
        description: 'Calling the API to register the local participant for translation.'
      },
      TRANSLATOR_REGISTER_FAILED: {
        code: 'TRANSLATOR_REGISTER_FAILED',
        level: 'error',
        userMessage: 'Failed to register translator participant.',
        description: 'Error during the participant registration API call.'
      },
      TRANSLATOR_REQUESTING: {
        code: 'TRANSLATOR_REQUESTING',
        level: 'info',
        userMessage: 'Requesting translator from {fromLang} to {toLang}...',
        description: 'Calling the API to request the translator service to join the room.'
      },
      TRANSLATOR_REQUEST_FAILED: {
        code: 'TRANSLATOR_REQUEST_FAILED',
        level: 'error',
        userMessage: 'Failed to request {fromLang} to {toLang} translator.',
        description: 'Error during the API call to add the translation service.'
      },
      TRANSLATOR_PARTICIPANT_JOINED: {
        code: 'TRANSLATOR_PARTICIPANT_JOINED',
        level: 'debug',
        userMessage: 'Translator participant connected.',
        description: 'The remote translator participant has joined the Daily room.'
      },
      TRANSLATOR_TRACK_READY: {
        code: 'TRANSLATOR_TRACK_READY',
        level: 'info',
        userMessage: 'Translator ready ({fromLang} to {toLang}).',
        description: 'The translated audio track from the translator service is now available.'
      },
      TRANSLATOR_CAPTIONS_READY: {
        code: 'TRANSLATOR_CAPTIONS_READY',
        level: 'debug',
        userMessage: 'Captions callback configured.',
        description: 'The caption callback has been set by the user.'
      },
      TRANSLATOR_INIT_COMPLETE: {
        code: 'TRANSLATOR_INIT_COMPLETE',
        level: 'info',
        userMessage: 'Translator initialized.',
        description: 'The core initialization process for the translator completed successfully (service requested, event listeners set).'
      },
      TRANSLATOR_PARTICIPANT_LEFT: {
        code: 'TRANSLATOR_PARTICIPANT_LEFT',
        level: 'warn',
        userMessage: 'Translator participant disconnected.',
        description: 'The remote translator participant has left the room.'
      },
      TRANSLATOR_DESTROYED: {
        code: 'TRANSLATOR_DESTROYED',
        level: 'info',
        userMessage: 'Translator stopped.',
        description: 'The translator instance has been destroyed and left the room.'
      },
      TRANSLATOR_REMOVED: {
        code: 'TRANSLATOR_REMOVED',
        level: 'info',
        userMessage: 'Translator removed from instance.',
        description: 'Translator instance removed from the DubitInstance active translators map.'
      },
      // Translator Actions
      INPUT_TRACK_UPDATING: {
        code: 'INPUT_TRACK_UPDATING',
        level: 'debug',
        userMessage: 'Updating audio input...',
        description: 'Attempting to update the input audio track for the translator.'
      },
      INPUT_TRACK_UPDATED: {
        code: 'INPUT_TRACK_UPDATED',
        level: 'info',
        userMessage: 'Audio input updated.',
        description: 'Successfully updated the input audio track.'
      },
      INPUT_TRACK_UPDATE_FAILED: {
        code: 'INPUT_TRACK_UPDATE_FAILED',
        level: 'error',
        userMessage: 'Failed to update audio input.',
        description: 'An error occurred while updating the input audio track.'
      },
      INPUT_TRACK_ENDED_RECOVERING: {
        code: 'INPUT_TRACK_ENDED_RECOVERING',
        level: 'warn',
        userMessage: 'Audio input ended unexpectedly, attempting recovery...',
        description: 'The provided input track ended; attempting to get a new one via getUserMedia.'
      },
      INPUT_TRACK_RECOVERY_FAILED: {
        code: 'INPUT_TRACK_RECOVERY_FAILED',
        level: 'error',
        userMessage: 'Failed to recover audio input.',
        description: 'Failed to get a new audio track via getUserMedia after the previous one ended.'
      },
      // Generic Error (Fallback)
      INTERNAL_ERROR: {
        code: 'INTERNAL_ERROR',
        level: 'error',
        userMessage: 'An internal error occurred.',
        description: 'An unexpected error occurred within the SDK.'
      }
    };

    exports.DubitEventEmitter = DubitEventEmitter;
    exports.DubitInstance = DubitInstance;
    exports.DubitLogEvents = DubitLogEvents;
    exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
    exports.SUPPORTED_TRANSLATOR_VERSIONS = SUPPORTED_TRANSLATOR_VERSIONS;
    exports.Translator = Translator;
    exports.createNewInstance = createNewInstance;
    exports.getCompleteTranscript = getCompleteTranscript;
    exports.getSupportedLanguages = getSupportedLanguages;
    exports.listenEvents = listenEvents;
    exports.routeTrackToDevice = routeTrackToDevice;
    exports.validateApiKey = validateApiKey;

}));
