import {
  SUPPORTED_FROM_LANGUAGES,
  LanguageType,
  SUPPORTED_TO_LANGUAGES,
  SUPPORTED_TRANSLATOR_VERSIONS,
} from "./constants";
import { Translator } from "./translator";
import { DubitCreateParams, TranslatorParams } from "./types";

/**
 * Creates and returns a new DubitInstance
 */

export async function createNewInstance({
  token,
  apiUrl = "https://test-api.dubit.live",
}: DubitCreateParams): Promise<DubitInstance> {
  try {
    const response = await fetch(`${apiUrl}/meeting/new-meeting`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to create meeting room");
    }
    type NewMeetingResponseData = {
      status: string;
      roomUrl: string;
      roomName: string;
      meeting_id: string;
      owner_token: string;
    };
    const data: NewMeetingResponseData = await response.json();
    const instanceId = data.meeting_id;
    const roomUrl = data.roomUrl;
    return new DubitInstance(instanceId, roomUrl, token, apiUrl);
  } catch (error) {
    console.error("dubit.createNewInstance error:", error);
    throw error;
  }
}

//
// The Dubit Instance, tracks all active translators
//
export class DubitInstance {
  public instanceId: string;
  private roomUrl: string;
  public ownerToken: string;
  private apiUrl: string;
  private activeTranslators: Map<string, Translator> = new Map();

  constructor(
    instanceId: string,
    roomUrl: string,
    ownerToken: string,
    apiUrl: string,
  ) {
    this.instanceId = instanceId;
    this.roomUrl = roomUrl;
    this.ownerToken = ownerToken;
    this.apiUrl = apiUrl;
  }

  private validateTranslatorParams(params: TranslatorParams): Error | null {
    if (
      !SUPPORTED_FROM_LANGUAGES.map((x) => x.langCode).includes(params.fromLang)
    ) {
      return new Error(
        `Unsupported fromLang: ${params.fromLang}. Supported from languages: ${SUPPORTED_FROM_LANGUAGES.map((x) => x.langCode)}`,
      );
    }
    if (
      !SUPPORTED_TO_LANGUAGES.map((x) => x.langCode).includes(params.toLang)
    ) {
      return new Error(
        `Unsupported toLang: ${params.toLang}. Supported to languages: ${SUPPORTED_TO_LANGUAGES.map((x) => x.langCode)}`,
      );
    }
    if (params.voiceType !== "male" && params.voiceType !== "female") {
      return new Error(
        `Unsupported voiceType: ${params.voiceType}. Supported voice types: male, female`,
      );
    }
    if (params.inputAudioTrack === null) {
      return new Error("inputAudioTrack is required");
    }
    if (
      params.version &&
      !SUPPORTED_TRANSLATOR_VERSIONS.map((x) => x.version).includes(
        params.version,
      )
    ) {
      return new Error(
        `Unsupported version: ${params.version}. Supported versions: ${SUPPORTED_TRANSLATOR_VERSIONS}`,
      );
    }
    return null;
  }

  /**
   * Creates a new translator bot (with its own call instance)
   */
  public async addTranslator(params: TranslatorParams): Promise<Translator> {
    const validationError = this.validateTranslatorParams(params);
    if (validationError) {
      return Promise.reject(validationError);
    }

    const translator = new Translator({
      instanceId: this.instanceId,
      roomUrl: this.roomUrl,
      token: this.ownerToken,
      apiUrl: this.apiUrl,
      ...params,
    });
    // Set up cleanup callback to remove from this.translators when destroyed
    translator.onDestroy = () => {
      this.activeTranslators.delete(translator.getParticipantId());
    };

    await translator.init();
    this.activeTranslators.set(translator.getParticipantId(), translator);
    return translator;
  }
}

export function getSupportedFromLanguages(): LanguageType[] {
  return SUPPORTED_FROM_LANGUAGES;
}

export function getSupportedToLanguages(): LanguageType[] {
  return SUPPORTED_TO_LANGUAGES;
}

export async function getCompleteTranscript({
  instanceId,
  token,
  apiUrl = "https://test-api.dubit.live",
}: {
  instanceId: string;
  token: string;
  apiUrl?: string;
}): Promise<any> {
  const response = await fetch(`${apiUrl}/meeting/${instanceId}/transcripts`, {
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
}

//
// Default export for ease-of-use (import dubit from '@taic/dubit')
//
export default {
  createNewInstance,
  getSupportedFromLanguages,
  getSupportedToLanguages,
  getCompleteTranscript,
};
