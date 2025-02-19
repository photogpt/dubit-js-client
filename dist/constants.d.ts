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
    version: string;
    label: string;
};
/**
 * An array of available translator versions.
 */
export declare const SUPPORTED_TRANSLATOR_VERSIONS: VersionType[];
/**
 * Represents a language with its code and label.
 *
 * @example
 * const englishUS: LanguageType = {
 *   langCode: 'en-US',
 *   label: 'English (United States)'
 * };
 *
 * const french: LanguageType = {
 *   langCode: 'fr',
 *   label: 'French'
 * };
 */
export type LanguageType = {
    langCode: string;
    label: string;
};
export declare const SUPPORTED_FROM_LANGUAGES: LanguageType[];
export declare const SUPPORTED_TO_LANGUAGES: LanguageType[];
