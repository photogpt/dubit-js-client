import Daily, {
  DailyCall,
  DailyEventObjectAppMessage,
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft,
  DailyEventObjectTrack,
  DailyNetworkStats,
  DailyParticipantsObject,
} from '@daily-co/daily-js'

export type CaptionEvent = {
  participant_id: string
  timestamp: string
  transcript: string
  type: string
}

/**
 * For now, only API_KEY is supported as a token.
 * To generate, go to https://www.dubit.live/dashboard/account?selectedTab=apikey
 */
export type DubitCreateParams = {
  token: string
  apiUrl?: string
  loggerCallback?: ((log: DubitUserLog) => void) | null
}

export type NetworkStats = DailyNetworkStats

export type TranslatorParams = {
  fromLang: string
  toLang: string
  voiceType: 'male' | 'female'
  version?: string
  keywords?: boolean
  hqVoices?: boolean
  translationBeep?: boolean
  inputAudioTrack: MediaStreamTrack | null
  metadata?: Record<string, any>
  outputDeviceId?: string
  onTranslatedTrackReady?: (track: MediaStreamTrack) => void
  onCaptions?: (caption: CaptionEvent) => void
  onNetworkQualityChange?: (stats: NetworkStats) => void
}

export type LanguageType = {
  langCode: string
  label: string
}

const API_URL = 'https://test-api.dubit.live'

interface DubitLogEventDef {
  readonly code: string
  readonly level: 'error' | 'warn' | 'info' | 'debug'
  readonly userMessage: string
  readonly description: string
}

export interface DubitUserLog {
  eventCode: string
  level: 'error' | 'warn' | 'info' | 'debug'
  userMessage: string
  className: string
  timestamp: string
  internalData?: any
  error?: Error
}

function enhanceError(baseMessage: string, originalError: any): Error {
  let errorMessage = baseMessage
  if (originalError?.message) {
    errorMessage += ` Original error: ${originalError?.message}`
  }
  const enhancedError = new Error(errorMessage)
  enhancedError.stack = originalError?.stack
  try {
    if (typeof structuredClone === 'function') {
      enhancedError.cause = structuredClone(originalError)
    } else {
      enhancedError.cause = originalError
    }
  } catch (cloneError) {
    enhancedError.cause = originalError
  }
  return enhancedError
}

function formatUserMessage(template: string, params?: Record<string, any>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params.hasOwnProperty(key) ? String(params[key]) : `{${key}}`,
  )
}

function logUserEvent(
  loggerCallback: ((log: DubitUserLog) => void) | null,
  eventDef: DubitLogEventDef,
  className: string,
  internalData?: any,
  originalError?: Error,
  messageParams?: Record<string, any>,
) {
  const userMessage = formatUserMessage(eventDef.userMessage, messageParams)

  const logEntry: DubitUserLog = {
    eventCode: eventDef.code,
    level: eventDef.level,
    userMessage: userMessage,
    className,
    timestamp: new Date().toISOString(),
    internalData: internalData,
    error: originalError,
  }

  if (loggerCallback) {
    try {
      loggerCallback(logEntry)
    } catch (callbackError: any) {
      if (loggerCallback !== console.error) {
        console.error('Error occurred within the provided loggerCallback:', callbackError)
        console.error('Original Dubit log event:', logEntry)
      }
    }
  } else {
    const logArgs: any[] = [
      `[${logEntry.timestamp}] [${logEntry.className}] ${logEntry.level.toUpperCase()} (${logEntry.eventCode}): ${logEntry.userMessage}`,
    ]
    if (logEntry.internalData && Object.keys(logEntry.internalData).length > 0) {
      logArgs.push('Data:', logEntry.internalData)
    }
    if (logEntry.error) {
      logArgs.push('Error:', logEntry.error)
    }

    switch (logEntry.level) {
      case 'error':
        console.error(...logArgs)
        break
      case 'warn':
        console.warn(...logArgs)
        break
      case 'info':
        console.info(...logArgs)
        break
      case 'debug':
        console.debug(...logArgs)
        break
      default:
        console.log(...logArgs)
    }
  }
}

export async function createNewInstance({
  token,
  apiUrl = API_URL,
  loggerCallback = null,
}: DubitCreateParams): Promise<DubitInstance> {
  logUserEvent(loggerCallback, DubitLogEvents.INSTANCE_CREATING, 'DubitSDK')

  try {
    const response = await fetch(`${apiUrl}/meeting/new-meeting`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    let errorData: any = null
    if (!response.ok) {
      try {
        errorData = await response.json()
      } catch (jsonError) {
        errorData = {
          message: `Received non-JSON error response (HTTP ${response.status})`,
        }
      }
      const errorMessage =
        errorData?.message ||
        `Failed to create connection with Dubit servers (HTTP ${response.status})`
      const error = new Error(errorMessage)
      logUserEvent(
        loggerCallback,
        DubitLogEvents.INSTANCE_CREATE_FAILED,
        'DubitSDK',
        { status: response.status, responseData: errorData },
        error,
      )
      throw error
    }

    type NewMeetingResponseData = {
      status: string
      roomUrl: string
      roomName: string
      meeting_id: string
      owner_token: string
    }
    const data: NewMeetingResponseData = await response.json()
    const instanceId = data.meeting_id
    const roomUrl = data.roomUrl
    const instance = new DubitInstance(instanceId, roomUrl, token, apiUrl)
    instance.setLoggerCallback(loggerCallback)

    instance._log(DubitLogEvents.INSTANCE_CREATED, { instanceId })
    return instance
  } catch (error: any) {
    const completeError = enhanceError('Unable to create Dubit instance', error)
    const baseMessageFromError = completeError.message.split('. Original error:')[0]
    if (error.message !== baseMessageFromError) {
      logUserEvent(
        loggerCallback,
        DubitLogEvents.INTERNAL_ERROR,
        'DubitSDK',
        undefined,
        completeError,
      )
    }
    throw completeError
  }
}

export function getSupportedLanguages(): LanguageType[] {
  return SUPPORTED_LANGUAGES
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/user/validate/api_key/${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const result = await response.json()

    return result.data?.is_exists || false
  } catch (error: any) {
    const completeError = enhanceError(
      'Unable to validate API key. Please check your network connection and API key',
      error,
    )
    console.error('dubit.validateApiKey error:', completeError)
    throw completeError
  }
}

export async function getCompleteTranscript({
  instanceId,
  token,
  apiUrl = API_URL,
}: {
  instanceId: string
  token: string
  apiUrl?: string
}): Promise<any> {
  try {
    const response = await fetch(`${apiUrl}/meeting/${instanceId}/transcripts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = errorData?.message || 'Failed to fetch complete transcript'
      throw new Error(errorMessage)
    }
    return response.json()
  } catch (error: any) {
    console.error('dubit.getCompleteTranscript error:', error)
    throw error
  }
}

function validateTranslatorParams(params: TranslatorParams): Error | null {
  if (!SUPPORTED_LANGUAGES.map((x) => x.langCode).includes(params.fromLang)) {
    return new Error(
      `Unsupported fromLang: ${params.fromLang}. Supported from languages: ${SUPPORTED_LANGUAGES.map((x) => x.langCode)}`,
    )
  }
  if (!SUPPORTED_LANGUAGES.map((x) => x.langCode).includes(params.toLang)) {
    return new Error(
      `Unsupported toLang: ${params.toLang}. Supported to languages: ${SUPPORTED_LANGUAGES.map((x) => x.langCode)}`,
    )
  }
  if (params.voiceType !== 'male' && params.voiceType !== 'female') {
    return new Error(
      `Unsupported voiceType: ${params.voiceType}. Supported voice types: male, female`,
    )
  }
  if (params.inputAudioTrack === null) {
    return new Error('inputAudioTrack is required')
  }
  if (
    params.version &&
    !SUPPORTED_TRANSLATOR_VERSIONS.map((x) => x.version).includes(params.version)
  ) {
    return new Error(
      `Unsupported version: ${params.version}. Supported versions: ${SUPPORTED_TRANSLATOR_VERSIONS}`,
    )
  }
  return null
}

export class DubitInstance {
  public instanceId: string
  private roomUrl: string
  public token: string
  private apiUrl: string
  private activeTranslators: Map<string, Translator> = new Map()
  private loggerCallback: ((log: DubitUserLog) => void) | null = null

  constructor(instanceId: string, roomUrl: string, token: string, apiUrl: string) {
    this.instanceId = instanceId
    this.roomUrl = roomUrl
    this.token = token
    this.apiUrl = apiUrl
  }

  public setLoggerCallback(callback: ((log: DubitUserLog) => void) | null) {
    if (typeof callback === 'function' || callback === null) {
      const hadCallback = !!this.loggerCallback
      this.loggerCallback = callback
      if (!!callback !== hadCallback || !hadCallback) {
        this._log(DubitLogEvents.LOGGER_CALLBACK_SET, {
          hasCallback: !!callback,
        })
      }
    } else {
      logUserEvent(
        this.loggerCallback,
        DubitLogEvents.LOGGER_CALLBACK_INVALID,
        this.constructor.name,
        { providedType: typeof callback },
      )
      this.loggerCallback = null
    }
  }

  _log(
    eventDef: DubitLogEventDef,
    internalData?: any,
    originalError?: Error,
    messageParams?: Record<string, any>,
  ) {
    logUserEvent(
      this.loggerCallback,
      eventDef,
      this.constructor.name,
      internalData,
      originalError,
      messageParams,
    )
  }

  public async addTranslator(params: TranslatorParams): Promise<Translator> {
    this._log(DubitLogEvents.TRANSLATOR_ADDING, { params })

    const validationError = validateTranslatorParams(params)
    if (validationError) {
      return Promise.reject(validationError)
    }

    const translator = new Translator({
      instanceId: this.instanceId,
      roomUrl: this.roomUrl,
      token: this.token,
      apiUrl: this.apiUrl,
      loggerCallback: this.loggerCallback,
      ...params,
    })

    translator.onDestroy = () => {
      const participantId = translator.getParticipantId()
      this.activeTranslators.delete(participantId)
      this._log(DubitLogEvents.TRANSLATOR_REMOVED, { participantId })
    }

    try {
      await translator.init()
      this.activeTranslators.set(translator.getParticipantId(), translator)
      return translator
    } catch (error: any) {
      const enhancedError = enhanceError('Failed to add and initialize translator', error)
      this._log(DubitLogEvents.INTERNAL_ERROR, { params, stage: 'addTranslator' }, enhancedError)
      return Promise.reject(enhancedError)
    }
  }

  public getActiveTranslators(): Map<string, Translator> {
    return this.activeTranslators
  }

  public getRoomId(): string {
    const parts = this.roomUrl.split('/');
    return parts[parts.length - 1] || '';
  }
}

export class Translator {
  private instanceId: string
  private roomUrl: string
  private token: string
  private apiUrl: string
  private fromLang: string
  private toLang: string
  private voiceType: 'male' | 'female'
  private version: string = 'latest'
  private keywords: boolean = false
  private translationBeep: boolean = false
  private hqVoices: boolean = false
  private inputAudioTrack: MediaStreamTrack | null
  private metadata?: Record<string, any>

  private callObject: DailyCall | null = null
  private translatedTrack: MediaStreamTrack | null = null
  private participantId = ''
  private translatorParticipantId = ''
  // private participantTracks: Map<string, MediaStreamTrack> = new Map();
  private outputDeviceId: string | null = null
  private loggerCallback: ((log: DubitUserLog) => void) | null = null

  private onTranslatedTrackCallback: ((track: MediaStreamTrack) => void) | null = null
  private onCaptionsCallback: ((caption: CaptionEvent) => void) | null = null
  private onNetworkQualityChangeCallback: ((event: NetworkStats) => void) | null = null

  public onDestroy?: () => void
  public getInstanceId = () => this.instanceId

  constructor(
    params: {
      instanceId: string
      roomUrl: string
      token: string
      apiUrl: string
      loggerCallback?: ((log: DubitUserLog) => void) | null
    } & TranslatorParams,
  ) {
    this.instanceId = params.instanceId
    this.roomUrl = params.roomUrl
    this.token = params.token
    this.apiUrl = params.apiUrl
    this.fromLang = params.fromLang
    this.toLang = params.toLang
    this.voiceType = params.voiceType
    this.version = params.version || this.version
    this.keywords = params.keywords
    this.translationBeep = params.translationBeep
    this.hqVoices = params.hqVoices
    this.inputAudioTrack = params.inputAudioTrack
    this.metadata = params.metadata ? safeSerializeMetadata(params.metadata) : {}
    this.outputDeviceId = params.outputDeviceId
    this.loggerCallback = params.loggerCallback || null
    if (params.onTranslatedTrackReady)
      this.onTranslatedTrackCallback = params.onTranslatedTrackReady
    if (params.onCaptions) this.onCaptionsCallback = params.onCaptions
    if (params.onNetworkQualityChange)
      this.onNetworkQualityChangeCallback = params.onNetworkQualityChange
  }

  private _log(
    eventDef: DubitLogEventDef,
    internalData?: any,
    originalError?: Error,
    messageParams?: Record<string, any>,
  ) {
    logUserEvent(
      this.loggerCallback,
      eventDef,
      this.constructor.name,
      internalData,
      originalError,
      messageParams,
    )
  }

  // TODO: improve this label, it should rather be some kind of metadata or user_participant_id
  private _getTranslatorLabel(): string {
    let fromLangLabel = SUPPORTED_LANGUAGES.find((x) => x.langCode == this.fromLang)?.label
    let toLangLabel = SUPPORTED_LANGUAGES.find((x) => x.langCode == this.toLang)?.label
    return `Translator ${fromLangLabel} -> ${toLangLabel}`
  }

  public async init(): Promise<void> {
    try {
      this.callObject = Daily.createCallObject({
        allowMultipleCallInstances: true,
        videoSource: false,
        subscribeToTracksAutomatically: false,
      })
      this._log(DubitLogEvents.TRANSLATOR_INITIALIZING, {
        stage: 'callObjectCreated',
      })
    } catch (error) {
      const enhancedError = enhanceError('Failed to create call object', error)
      this._log(DubitLogEvents.TRANSLATOR_INIT_FAILED_CALL_OBJECT, undefined, enhancedError)
      throw enhancedError
    }

    let audioSource: MediaStreamTrack | false = false
    if (this.inputAudioTrack && this.inputAudioTrack.readyState === 'live') {
      audioSource = this.inputAudioTrack
    }
    try {
      this._log(DubitLogEvents.TRANSLATOR_JOINING_ROOM, {
        roomUrl: this.roomUrl,
        hasAudioSource: !!audioSource,
      })
      await this.callObject.join({
        url: this.roomUrl,
        audioSource,
        videoSource: false,
        subscribeToTracksAutomatically: false,
        startAudioOff: audioSource === false,
        inputSettings: {
          audio: {
            processor: {
              type: 'noise-cancellation',
            },
          },
        },
      })
    } catch (error) {
      const enhancedError = enhanceError('Failed to establish connection', error)
      this._log(DubitLogEvents.TRANSLATOR_JOIN_FAILED, { roomUrl: this.roomUrl }, enhancedError)
      await this.callObject?.destroy() // Clean up partially created call object
      this.callObject = null
      throw enhancedError
    }

    const participants: DailyParticipantsObject = this.callObject.participants()
    this.participantId = participants.local.session_id
    try {
      this._log(DubitLogEvents.TRANSLATOR_REGISTERING, {
        participantId: this.participantId,
      })
      await this.registerParticipant(this.participantId)
    } catch (error: any) {
      await this.callObject?.leave()
      await this.callObject?.destroy()
      this.callObject = null
      throw error
    }

    try {
      const messageParams = { fromLang: this.fromLang, toLang: this.toLang }
      this._log(
        DubitLogEvents.TRANSLATOR_REQUESTING,
        {
          /* bot params could go here */
        },
        undefined,
        messageParams,
      )
      await this.addTranslationBot(
        this.roomUrl,
        this.participantId,
        this.fromLang,
        this.toLang,
        this.voiceType,
        this.version,
        this.keywords,
        this.translationBeep,
        this.hqVoices,
      )
    } catch (error: any) {
      await this.callObject?.leave()
      await this.callObject?.destroy()
      this.callObject = null
      throw error
    }

    this.callObject.on('track-started', this.handleTrackStarted)
    this.callObject.on('participant-joined', this.handleParticipantJoined)
    this.callObject.on('app-message', this.handleAppMessage)
    this.callObject.on('participant-left', this.handleParticipantLeft)
    this.callObject.on('network-quality-change', this.handleNetworkQualityChange)

    this._log(DubitLogEvents.TRANSLATOR_INIT_COMPLETE, {
      fromLang: this.fromLang,
      toLang: this.toLang,
      version: this.version,
    })
  }

  private handleTrackStarted = (event: DailyEventObjectTrack) => {
    // TODO: add better identifier like some kind of id in metadata or user_participant_id in translator name
    const isValidTranslatorTrack =
      event.track &&
      event.track.kind === 'audio' &&
      !event?.participant?.local &&
      event.participant.user_name.includes(this._getTranslatorLabel())
    if (isValidTranslatorTrack) {
      this._log(
        DubitLogEvents.TRANSLATOR_TRACK_READY,
        {
          participantName: event.participant.user_name,
          trackId: event.track.id,
        },
        undefined,
        { fromLang: this.fromLang, toLang: this.toLang },
      )

      if (this.onTranslatedTrackCallback) {
        try {
          this.onTranslatedTrackCallback(event.track)
          this.translatedTrack = event.track
        } catch (callbackError: any) {
          this._log(
            DubitLogEvents.INTERNAL_ERROR,
            { handler: 'onTranslatedTrackCallback' },
            enhanceError('Error in onTranslatedTrackReady callback', callbackError),
          )
        }
      }
    }
  }

  private handleParticipantJoined = (event: DailyEventObjectParticipant) => {
    if (event?.participant?.local) return

    if (event.participant.user_name.includes(this._getTranslatorLabel())) {
      this.translatorParticipantId = event.participant.session_id;
      this._log(DubitLogEvents.TRANSLATOR_PARTICIPANT_JOINED, {
        participantId: this.translatorParticipantId,
        participantName: event.participant.user_name,
      })
      this.callObject?.updateParticipant(this.translatorParticipantId, {
        setSubscribedTracks: {
          audio: true,
        },
      })
    }
  }

  private handleAppMessage = (event: DailyEventObjectAppMessage) => {
    const data = event.data
    if (data?.type?.includes('transcript') && data?.transcript && this.onCaptionsCallback) {
      const validTypes = ['user-transcript', 'translation-transcript', 'user-interim-transcript']
      if (validTypes.includes(data.type) && data.participant_id === this.participantId) {
        try {
          this.onCaptionsCallback(data as CaptionEvent)
        } catch (callbackError: any) {
          this._log(
            DubitLogEvents.INTERNAL_ERROR,
            { handler: 'onCaptionsCallback', messageData: data },
            enhanceError('Error in onCaptions callback', callbackError),
          )
        }
      }
    }
  }

  private handleParticipantLeft = (event: DailyEventObjectParticipantLeft) => {
    if (
      !event.participant.local &&
      event.participant.user_name.includes(this._getTranslatorLabel())
    ) {
      this._log(DubitLogEvents.TRANSLATOR_PARTICIPANT_LEFT, {
        participantId: event.participant.session_id,
        participantName: event.participant.user_name,
      })
      if (this.translatedTrack) {
        this.translatedTrack = null
      }
    }
  }

  private handleNetworkQualityChange = (event: NetworkStats) => {
    this.onNetworkQualityChangeCallback?.(event as NetworkStats)
  }

  private async registerParticipant(participantId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/participant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ id: participantId }),
      })

      let errorData: any = null
      if (!response.ok) {
        try {
          errorData = await response.json()
        } catch { }
        const errorMessage =
          errorData?.message || `Failed API call to register participant (HTTP ${response.status})`
        const error = new Error(errorMessage)
        const enhancedError = enhanceError('Participant registration failed', error)
        this._log(
          DubitLogEvents.TRANSLATOR_REGISTER_FAILED,
          { participantId, status: response.status, responseData: errorData },
          enhancedError,
        )
        throw enhancedError
      }
    } catch (error: any) {
      const enhancedError = enhanceError('Error during participant registration', error)
      if (error.eventCode !== DubitLogEvents.TRANSLATOR_REGISTER_FAILED.code) {
        this._log(DubitLogEvents.TRANSLATOR_REGISTER_FAILED, { participantId }, enhancedError)
      }
      throw enhancedError
    }
  }

  // Adds a translation bot for the given participant
  private async addTranslationBot(
    roomUrl: string,
    participantId: string,
    fromLanguage: string,
    toLanguage: string,
    voiceType: 'male' | 'female',
    version: string,
    keywords: boolean,
    translationBeep: boolean,
    hqVoices: boolean,
  ): Promise<void> {
    const apiPayload = {
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
      metadata: {
        ...this.metadata,
      },
    }
    const messageParams = { fromLang: fromLanguage, toLang: toLanguage }
    try {
      const response = await fetch(`${this.apiUrl}/meeting/bot/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(apiPayload),
      })
      let errorData: any = null
      if (!response.ok) {
        try {
          errorData = await response.json()
        } catch { }
        const errorMessage =
          errorData?.message ||
          `Failed API call to request translator service (HTTP ${response.status})`
        const error = new Error(errorMessage)
        const enhancedError = enhanceError('Translator request failed', error) // Enhance here
        this._log(
          DubitLogEvents.TRANSLATOR_REQUEST_FAILED,
          {
            payload: apiPayload,
            status: response.status,
            responseData: errorData,
          },
          enhancedError,
          messageParams,
        )
        throw enhancedError
      }
    } catch (error: any) {
      const enhancedError = enhanceError('Error requesting translation service', error)
      if (error.eventCode !== DubitLogEvents.TRANSLATOR_REQUEST_FAILED.code) {
        this._log(
          DubitLogEvents.TRANSLATOR_REQUEST_FAILED,
          { payload: apiPayload },
          enhancedError,
          messageParams,
        )
      }
      throw enhancedError
    }
  }

  public onTranslatedTrackReady(callback: (translatedTrack: MediaStreamTrack) => void): void {
    if (typeof callback !== 'function') {
      this._log(DubitLogEvents.INTERNAL_ERROR, {
        reason: 'Invalid callback provided to onTranslatedTrackReady',
      })
      return
    }
    this.onTranslatedTrackCallback = callback
    if (this.translatedTrack) {
      try {
        callback(this.translatedTrack)
      } catch (callbackError: any) {
        this._log(
          DubitLogEvents.INTERNAL_ERROR,
          { handler: 'onTranslatedTrackReadyImmediate' },
          enhanceError(
            'Error in onTranslatedTrackReady callback (immediate invoke)',
            callbackError,
          ),
        )
      }
    }
  }

  public onCaptions(callback: (caption: CaptionEvent) => void): void {
    if (typeof callback !== 'function') {
      this._log(DubitLogEvents.INTERNAL_ERROR, {
        reason: 'Invalid callback provided to onCaptions',
      })
      return
    }
    this.onCaptionsCallback = callback
    this._log(DubitLogEvents.TRANSLATOR_CAPTIONS_READY)
  }

  public async updateInputTrack(newInputTrack: MediaStreamTrack | null): Promise<void> {
    const trackId = newInputTrack?.id
    const trackState = newInputTrack?.readyState
    this._log(DubitLogEvents.INPUT_TRACK_UPDATING, {
      hasNewTrack: !!newInputTrack,
      trackId,
      trackState,
    })

    if (!this.callObject) {
      const error = new Error('Translator not initialized (callObject is null)')
      this._log(DubitLogEvents.INPUT_TRACK_UPDATE_FAILED, { reason: 'Not initialized' }, error)
      throw error
    }

    let targetTrack = newInputTrack

    if (targetTrack && targetTrack.readyState === 'ended') {
      this._log(DubitLogEvents.INPUT_TRACK_ENDED_RECOVERING, {
        trackId: targetTrack.id,
      })
      try {
        const constraints = {
          audio: {
            deviceId: targetTrack.getSettings().deviceId
              ? { exact: targetTrack.getSettings().deviceId }
              : undefined,
          },
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        targetTrack = stream.getAudioTracks()[0]
        this._log(DubitLogEvents.INPUT_TRACK_UPDATED, {
          trackId: targetTrack.id,
          reason: 'Recovered ended track',
        })
      } catch (e: any) {
        const error = enhanceError('Failed to get new audio track via getUserMedia', e)
        this._log(DubitLogEvents.INPUT_TRACK_RECOVERY_FAILED, { originalTrackId: trackId }, error)
        targetTrack = null
        this._log(DubitLogEvents.INPUT_TRACK_UPDATE_FAILED, {
          reason: 'Recovery failed, setting input to null',
        })
      }
    }

    this.inputAudioTrack = targetTrack

    try {
      const audioSource = targetTrack || false
      await this.callObject.setInputDevicesAsync({ audioSource })
      this.callObject.setLocalAudio(!!targetTrack)
      this._log(DubitLogEvents.INPUT_TRACK_UPDATED, {
        trackId: targetTrack?.id,
        enabled: !!targetTrack,
      })
    } catch (e: any) {
      const error = enhanceError('Failed call to setInputDevicesAsync or setLocalAudio', e)
      this._log(DubitLogEvents.INPUT_TRACK_UPDATE_FAILED, { trackId: targetTrack?.id }, error)
      throw error
    }
  }

  public getParticipantId(): string {
    return this.participantId
  }

  public getTranslatedTrack(): MediaStreamTrack | null {
    return this.translatedTrack
  }

  public async getNetworkStats(): Promise<NetworkStats> {
    return this.callObject.getNetworkStats()
  }

  public getTranslatorVolumeLevel(): number {
    if (!this.translatorParticipantId) {
      return 0;
    }

    const remoteParticipantsAudioLevels = this.callObject.getRemoteParticipantsAudioLevel();

    return remoteParticipantsAudioLevels[this.translatorParticipantId] ?? 0;

  }

  public async destroy(): Promise<void> {
    const participantId = this.participantId // Capture before nulling
    this._log(DubitLogEvents.TRANSLATOR_DESTROYED, {
      stage: 'starting',
      participantId,
    })

    if (this.callObject) {
      this.callObject.off('track-started', this.handleTrackStarted)
      this.callObject.off('participant-joined', this.handleParticipantJoined)
      this.callObject.off('app-message', this.handleAppMessage)
      this.callObject.off('participant-left', this.handleParticipantLeft)
      this.callObject.off('network-quality-change', this.handleNetworkQualityChange)

      try {
        await this.callObject.leave()
      } catch (leaveError: any) {
        this._log(
          DubitLogEvents.INTERNAL_ERROR,
          { stage: 'destroyLeaveCall' },
          enhanceError('Error leaving call during destroy', leaveError),
        )
      }

      try {
        await this.callObject.destroy()
      } catch (destroyError: any) {
        this._log(
          DubitLogEvents.INTERNAL_ERROR,
          { stage: 'destroyCallObject' },
          enhanceError('Error destroying call object during destroy', destroyError),
        )
      }
      this.callObject = null
    }

    this.onTranslatedTrackCallback = null
    this.onCaptionsCallback = null
    this.translatedTrack = null

    if (this.onDestroy) {
      try {
        this.onDestroy()
      } catch (destroyCbError: any) {
        this._log(
          DubitLogEvents.INTERNAL_ERROR,
          { stage: 'onDestroyCallback' },
          enhanceError('Error in onDestroy callback', destroyCbError),
        )
      }
    }

    this._log(DubitLogEvents.TRANSLATOR_DESTROYED, {
      stage: 'complete',
      participantId,
    })
  }


}

const audioContexts = new Map()
const activeRoutings = new Map()

/**
 * Routes a WebRTC audio track to a specific output device using WebAudio
 * This implementation avoids the WebRTC track mixing issue by using the WebAudio API
 */
export function routeTrackToDevice(
  track: MediaStreamTrack,
  outputDeviceId: string,
  elementId: string,
): object {
  console.log(`Routing track ${track.id} to device ${outputDeviceId}`)
  if (!elementId) {
    elementId = `audio-${track.id}`
  }

  // Clean up any existing routing for this element ID
  if (activeRoutings.has(elementId)) {
    const oldRouting = activeRoutings.get(elementId)
    oldRouting.stop()
    activeRoutings.delete(elementId)
    console.log(`Cleaned up previous routing for ${elementId}`)
  }

  // Create or get AudioContext for this output device
  let audioContext: AudioContext
  if (audioContexts.has(outputDeviceId)) {
    audioContext = audioContexts.get(outputDeviceId)
    console.log(`Reusing existing AudioContext for device ${outputDeviceId}`)
  } else {
    audioContext = new AudioContext()
    audioContexts.set(outputDeviceId, audioContext)
    console.log(`Created new AudioContext for device ${outputDeviceId}`)
  }

  // Resume AudioContext if suspended (autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext
      .resume()
      .then(() => console.log(`AudioContext resumed for device ${outputDeviceId}`))
      .catch((err) => console.error(`Failed to resume AudioContext: ${err}`))
  }

  const mediaStream = new MediaStream([track])
  const sourceNode = audioContext.createMediaStreamSource(mediaStream)
  console.log(`Created source node for track ${track.id}`)
  const destinationNode = audioContext.destination
  sourceNode.connect(destinationNode)
  console.log(`Connected track ${track.id} to destination for device ${outputDeviceId}`)

  // If the AudioContext API supports setSinkId directly, use it
  if ('setSinkId' in AudioContext.prototype) {
    audioContext //@ts-ignore
      .setSinkId(outputDeviceId)
      .then(() => console.log(`Set sinkId ${outputDeviceId} on AudioContext directly`))
      .catch((err: DOMException) => console.error(`Failed to set sinkId on AudioContext: ${err}`))
  }

  // Create a hidden audio element that will pull from the WebRTC stream
  // This is necessary to get the WebRTC subsystem to deliver the audio to WebAudio
  const pullElement = document.createElement('audio')
  pullElement.id = `pull-${elementId}`
  pullElement.srcObject = mediaStream
  pullElement.style.display = 'none'
  pullElement.muted = true // Don't actually play through the default device
  document.body.appendChild(pullElement)

  // Start pulling audio through the element
  pullElement
    .play()
    .then(() => console.log(`Pull element started for track ${track.id}`))
    .catch((err) => console.error(`Failed to start pull element: ${err}`))

  // Create routing info object with stop method
  const routingInfo = {
    context: audioContext,
    sourceNode: sourceNode,
    pullElement: pullElement,
    stop: function() {
      this.sourceNode.disconnect()
      this.pullElement.pause()
      this.pullElement.srcObject = null
      if (this.pullElement.parentNode) {
        document.body.removeChild(this.pullElement)
      }

      console.log(`Stopped routing track ${track.id} to device ${outputDeviceId}`)
    },
  }

  // Store the routing for future cleanup
  activeRoutings.set(elementId, routingInfo)

  return routingInfo
}

function safeSerializeMetadata(metadata: Record<string, any>): Record<string, any> {
  try {
    JSON.stringify(metadata)
    return metadata
  } catch (error) {
    console.error('Metadata serialization error; falling back to empty object.', error)
    return {}
  }
}

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
  version: string
  label: string
}

/**
 * An array of available translator versions.
 */
export const SUPPORTED_TRANSLATOR_VERSIONS: VersionType[] = [
  {
    label: 'V1 (Flash)',
    version: '1',
  },
  {
    label: 'V2 (Pro)',
    version: '2',
  },
  {
    label: "V3' (Noise Reduction)",
    version: '3',
  },
]

export const SUPPORTED_LANGUAGES: LanguageType[] = [
  {
    langCode: 'multi',
    label: 'Multilingual (Spanish + English)',
  },
  {
    langCode: 'bg',
    label: 'Bulgarian',
  },
  {
    langCode: 'ca',
    label: 'Catalan',
  },
  {
    langCode: 'zh-CN',
    label: 'Chinese (Mainland China)',
  },
  {
    langCode: 'zh-TW',
    label: 'Chinese (Taiwan)',
  },
  {
    langCode: 'zh-HK',
    label: 'Chinese (Traditional, Hong Kong)',
  },
  {
    langCode: 'cs',
    label: 'Czech',
  },
  {
    langCode: 'da',
    label: 'Danish',
  },
  {
    langCode: 'da-DK',
    label: 'Danish',
  },
  {
    langCode: 'nl',
    label: 'Dutch',
  },
  {
    langCode: 'en',
    label: 'English',
  },
  {
    langCode: 'en-US',
    label: 'English (United States)',
  },
  {
    langCode: 'en-AU',
    label: 'English (Australia)',
  },
  {
    langCode: 'en-GB',
    label: 'English (United Kingdom)',
  },
  {
    langCode: 'en-NZ',
    label: 'English (New Zealand)',
  },
  {
    langCode: 'en-IN',
    label: 'English (India)',
  },
  {
    langCode: 'et',
    label: 'Estonian',
  },
  {
    langCode: 'fi',
    label: 'Finnish',
  },
  {
    langCode: 'nl-BE',
    label: 'Flemish',
  },
  {
    langCode: 'fr',
    label: 'French',
  },
  {
    langCode: 'fr-CA',
    label: 'French (Canada)',
  },
  {
    langCode: 'de',
    label: 'German',
  },
  {
    langCode: 'de-CH',
    label: 'German (Switzerland)',
  },
  {
    langCode: 'el',
    label: 'Greek',
  },
  {
    langCode: 'hi',
    label: 'Hindi',
  },
  {
    langCode: 'hu',
    label: 'Hungarian',
  },
  {
    langCode: 'id',
    label: 'Indonesian',
  },
  {
    langCode: 'it',
    label: 'Italian',
  },
  {
    langCode: 'ja',
    label: 'Japanese',
  },
  {
    langCode: 'ko-KR',
    label: 'Korean',
  },
  {
    langCode: 'lv',
    label: 'Latvian',
  },
  {
    langCode: 'lt',
    label: 'Lithuanian',
  },
  {
    langCode: 'ms',
    label: 'Malay',
  },
  {
    langCode: 'no',
    label: 'Norwegian',
  },
  {
    langCode: 'pl',
    label: 'Polish',
  },
  {
    langCode: 'pt',
    label: 'Portuguese',
  },
  {
    langCode: 'pt-BR',
    label: 'Portuguese (Brazil)',
  },
  {
    langCode: 'pt-PT',
    label: 'Portuguese (Portugal)',
  },
  {
    langCode: 'ro',
    label: 'Romanian',
  },
  {
    langCode: 'ru',
    label: 'Russian',
  },
  {
    langCode: 'sk',
    label: 'Slovak',
  },
  {
    langCode: 'es',
    label: 'Spanish',
  },
  {
    langCode: 'es-419',
    label: 'Spanish (Latin America & Caribbean)',
  },
  {
    langCode: 'sv-SE',
    label: 'Swedish (Sweden)',
  },
  {
    langCode: 'th-TH',
    label: 'Thai (Thailand)',
  },
  {
    langCode: 'tr',
    label: 'Turkish',
  },
  {
    langCode: 'uk',
    label: 'Ukrainian',
  },
  {
    langCode: 'vi',
    label: 'Vietnamese',
  },
]

export const DubitLogEvents = {
  // Instance Lifecycle
  INSTANCE_CREATING: {
    code: 'INSTANCE_CREATING',
    level: 'info',
    userMessage: 'Connecting to Dubit service...',
    description: 'Attempting to fetch initial meeting details from the API.',
  },
  INSTANCE_CREATED: {
    code: 'INSTANCE_CREATED',
    level: 'info',
    userMessage: 'Dubit service connected.',
    description: 'Successfully created the DubitInstance after API confirmation.',
  },
  INSTANCE_CREATE_FAILED: {
    code: 'INSTANCE_CREATE_FAILED',
    level: 'error',
    userMessage: 'Failed to connect to Dubit service. Please check connection or token.',
    description: 'Error occurred during the API call to create a new meeting instance.',
  },
  LOGGER_CALLBACK_SET: {
    code: 'LOGGER_CALLBACK_SET',
    level: 'debug',
    userMessage: 'Logger configured.',
    description: 'The logger callback function has been successfully set or updated.',
  },
  LOGGER_CALLBACK_INVALID: {
    code: 'LOGGER_CALLBACK_INVALID',
    level: 'warn',
    userMessage: 'Invalid logger configuration provided.',
    description: 'An invalid value was provided for the logger callback.',
  },

  // Translator Lifecycle
  TRANSLATOR_ADDING: {
    code: 'TRANSLATOR_ADDING',
    level: 'info',
    userMessage: 'Adding translator...',
    description: 'Starting the process to add a new Translator instance.',
  },
  TRANSLATOR_INITIALIZING: {
    code: 'TRANSLATOR_INITIALIZING',
    level: 'info',
    userMessage: 'Initializing translation session...',
    description: 'Creating the underlying call object and preparing to join the room.',
  },
  TRANSLATOR_INIT_FAILED_CALL_OBJECT: {
    code: 'TRANSLATOR_INIT_FAILED_CALL_OBJECT',
    level: 'error',
    userMessage: 'Failed to create translation session component.',
    description: 'Error creating the Daily call object.',
  },
  TRANSLATOR_JOINING_ROOM: {
    code: 'TRANSLATOR_JOINING_ROOM',
    level: 'info',
    userMessage: 'Connecting to translation room...',
    description: 'Attempting to join the Daily room.',
  },
  TRANSLATOR_JOIN_FAILED: {
    code: 'TRANSLATOR_JOIN_FAILED',
    level: 'error',
    userMessage: 'Failed to connect to translation room.',
    description: 'Error joining the Daily room.',
  },
  TRANSLATOR_REGISTERING: {
    code: 'TRANSLATOR_REGISTERING',
    level: 'debug',
    userMessage: 'Registering translator participant...',
    description: 'Calling the API to register the local participant for translation.',
  },
  TRANSLATOR_REGISTER_FAILED: {
    code: 'TRANSLATOR_REGISTER_FAILED',
    level: 'error',
    userMessage: 'Failed to register translator participant.',
    description: 'Error during the participant registration API call.',
  },
  TRANSLATOR_REQUESTING: {
    code: 'TRANSLATOR_REQUESTING',
    level: 'info',
    userMessage: 'Requesting translator from {fromLang} to {toLang}...',
    description: 'Calling the API to request the translator service to join the room.',
  },
  TRANSLATOR_REQUEST_FAILED: {
    code: 'TRANSLATOR_REQUEST_FAILED',
    level: 'error',
    userMessage: 'Failed to request {fromLang} to {toLang} translator.',
    description: 'Error during the API call to add the translation service.',
  },
  TRANSLATOR_PARTICIPANT_JOINED: {
    code: 'TRANSLATOR_PARTICIPANT_JOINED',
    level: 'debug',
    userMessage: 'Translator participant connected.',
    description: 'The remote translator participant has joined the Daily room.',
  },
  TRANSLATOR_TRACK_READY: {
    code: 'TRANSLATOR_TRACK_READY',
    level: 'info',
    userMessage: 'Translator ready ({fromLang} to {toLang}).',
    description: 'The translated audio track from the translator service is now available.',
  },
  TRANSLATOR_CAPTIONS_READY: {
    code: 'TRANSLATOR_CAPTIONS_READY',
    level: 'debug',
    userMessage: 'Captions callback configured.',
    description: 'The caption callback has been set by the user.',
  },
  TRANSLATOR_INIT_COMPLETE: {
    code: 'TRANSLATOR_INIT_COMPLETE',
    level: 'info',
    userMessage: 'Translator initialized.',
    description:
      'The core initialization process for the translator completed successfully (service requested, event listeners set).',
  },
  TRANSLATOR_PARTICIPANT_LEFT: {
    code: 'TRANSLATOR_PARTICIPANT_LEFT',
    level: 'warn',
    userMessage: 'Translator participant disconnected.',
    description: 'The remote translator participant has left the room.',
  },
  TRANSLATOR_DESTROYED: {
    code: 'TRANSLATOR_DESTROYED',
    level: 'info',
    userMessage: 'Translator stopped.',
    description: 'The translator instance has been destroyed and left the room.',
  },
  TRANSLATOR_REMOVED: {
    code: 'TRANSLATOR_REMOVED',
    level: 'info',
    userMessage: 'Translator removed from instance.',
    description: 'Translator instance removed from the DubitInstance active translators map.',
  },

  // Translator Actions
  INPUT_TRACK_UPDATING: {
    code: 'INPUT_TRACK_UPDATING',
    level: 'debug',
    userMessage: 'Updating audio input...',
    description: 'Attempting to update the input audio track for the translator.',
  },
  INPUT_TRACK_UPDATED: {
    code: 'INPUT_TRACK_UPDATED',
    level: 'info',
    userMessage: 'Audio input updated.',
    description: 'Successfully updated the input audio track.',
  },
  INPUT_TRACK_UPDATE_FAILED: {
    code: 'INPUT_TRACK_UPDATE_FAILED',
    level: 'error',
    userMessage: 'Failed to update audio input.',
    description: 'An error occurred while updating the input audio track.',
  },
  INPUT_TRACK_ENDED_RECOVERING: {
    code: 'INPUT_TRACK_ENDED_RECOVERING',
    level: 'warn',
    userMessage: 'Audio input ended unexpectedly, attempting recovery...',
    description: 'The provided input track ended; attempting to get a new one via getUserMedia.',
  },
  INPUT_TRACK_RECOVERY_FAILED: {
    code: 'INPUT_TRACK_RECOVERY_FAILED',
    level: 'error',
    userMessage: 'Failed to recover audio input.',
    description: 'Failed to get a new audio track via getUserMedia after the previous one ended.',
  },

  // Generic Error (Fallback)
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    level: 'error',
    userMessage: 'An internal error occurred.',
    description: 'An unexpected error occurred within the SDK.',
  },
} as const
