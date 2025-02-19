import { LanguageType } from "./constants";
import { Translator } from "./translator";
import { DubitCreateParams, TranslatorParams } from "./types";
/**
 * Creates and returns a new DubitInstance
 */
export declare function createNewInstance({ token, apiUrl, }: DubitCreateParams): Promise<DubitInstance>;
export declare class DubitInstance {
    instanceId: string;
    private roomUrl;
    ownerToken: string;
    private apiUrl;
    private activeTranslators;
    constructor(instanceId: string, roomUrl: string, ownerToken: string, apiUrl: string);
    private validateTranslatorParams;
    /**
     * Creates a new translator bot (with its own call instance)
     */
    addTranslator(params: TranslatorParams): Promise<Translator>;
}
export declare function getSupportedFromLanguages(): LanguageType[];
export declare function getSupportedToLanguages(): LanguageType[];
export declare function getCompleteTranscript({ instanceId, token, apiUrl, }: {
    instanceId: string;
    token: string;
    apiUrl?: string;
}): Promise<any>;
declare const _default: {
    createNewInstance: typeof createNewInstance;
    getSupportedFromLanguages: typeof getSupportedFromLanguages;
    getSupportedToLanguages: typeof getSupportedToLanguages;
    getCompleteTranscript: typeof getCompleteTranscript;
};
export default _default;
