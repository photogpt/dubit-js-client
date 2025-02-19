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
export const SUPPORTED_TRANSLATOR_VERSIONS: VersionType[] = [
  {
    label: "V1 (Flash)",
    version: "1",
  },
  {
    label: "V2 (Pro)",
    version: "2",
  },
  {
    label: "V3' (Noise Reduction)",
    version: "3",
  },
];

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

export const SUPPORTED_FROM_LANGUAGES: LanguageType[] = [
  {
    langCode: "multi",
    label: "Multilingual (Spanish + English)",
  },
  {
    langCode: "bg",
    label: "Bulgarian",
  },
  {
    langCode: "ca",
    label: "Catalan",
  },
  {
    langCode: "zh-CN",
    label: "Chinese (Mainland China)",
  },
  {
    langCode: "zh-TW",
    label: "Chinese (Taiwan)",
  },
  {
    langCode: "zh-HK",
    label: "Chinese (Traditional, Hong Kong)",
  },
  {
    langCode: "cs",
    label: "Czech",
  },
  {
    langCode: "da",
    label: "Danish",
  },
  {
    langCode: "da-DK",
    label: "Danish",
  },
  {
    langCode: "nl",
    label: "Dutch",
  },
  {
    langCode: "en",
    label: "English",
  },
  {
    langCode: "en-US",
    label: "English (United States)",
  },
  {
    langCode: "en-AU",
    label: "English (Australia)",
  },
  {
    langCode: "en-GB",
    label: "English (United Kingdom)",
  },
  {
    langCode: "en-NZ",
    label: "English (New Zealand)",
  },
  {
    langCode: "en-IN",
    label: "English (India)",
  },
  {
    langCode: "et",
    label: "Estonian",
  },
  {
    langCode: "fi",
    label: "Finnish",
  },
  {
    langCode: "nl-BE",
    label: "Flemish",
  },
  {
    langCode: "fr",
    label: "French",
  },
  {
    langCode: "fr-CA",
    label: "French (Canada)",
  },
  {
    langCode: "de",
    label: "German",
  },
  {
    langCode: "de-CH",
    label: "German (Switzerland)",
  },
  {
    langCode: "el",
    label: "Greek",
  },
  {
    langCode: "hi",
    label: "Hindi",
  },
  {
    langCode: "hu",
    label: "Hungarian",
  },
  {
    langCode: "id",
    label: "Indonesian",
  },
  {
    langCode: "it",
    label: "Italian",
  },
  {
    langCode: "ja",
    label: "Japanese",
  },
  {
    langCode: "ko-KR",
    label: "Korean",
  },
  {
    langCode: "lv",
    label: "Latvian",
  },
  {
    langCode: "lt",
    label: "Lithuanian",
  },
  {
    langCode: "ms",
    label: "Malay",
  },
  {
    langCode: "no",
    label: "Norwegian",
  },
  {
    langCode: "pl",
    label: "Polish",
  },
  {
    langCode: "pt",
    label: "Portuguese",
  },
  {
    langCode: "pt-BR",
    label: "Portuguese (Brazil)",
  },
  {
    langCode: "pt-PT",
    label: "Portuguese (Portugal)",
  },
  {
    langCode: "ro",
    label: "Romanian",
  },
  {
    langCode: "ru",
    label: "Russian",
  },
  {
    langCode: "sk",
    label: "Slovak",
  },
  {
    langCode: "es",
    label: "Spanish",
  },
  {
    langCode: "es-419",
    label: "Spanish (Latin America & Caribbean)",
  },
  {
    langCode: "sv-SE",
    label: "Swedish (Sweden)",
  },
  {
    langCode: "th-TH",
    label: "Thai (Thailand)",
  },
  {
    langCode: "tr",
    label: "Turkish",
  },
  {
    langCode: "uk",
    label: "Ukrainian",
  },
  {
    langCode: "vi",
    label: "Vietnamese",
  },
];

export const SUPPORTED_TO_LANGUAGES: LanguageType[] = [
  {
    langCode: "af-ZA",
    label: "Afrikaans (South Africa)",
  },
  {
    langCode: "am-ET",
    label: "Amharic (Ethiopia)",
  },
  {
    langCode: "ar-AE",
    label: "Arabic (United Arab Emirates)",
  },
  {
    langCode: "ar-BH",
    label: "Arabic (Bahrain)",
  },
  {
    langCode: "ar-DZ",
    label: "Arabic (Algeria)",
  },
  {
    langCode: "ar-EG",
    label: "Arabic (Egypt)",
  },
  {
    langCode: "ar-IQ",
    label: "Arabic (Iraq)",
  },
  {
    langCode: "ar-JO",
    label: "Arabic (Jordan)",
  },
  {
    langCode: "ar-KW",
    label: "Arabic (Kuwait)",
  },
  {
    langCode: "ar-LB",
    label: "Arabic (Lebanon)",
  },
  {
    langCode: "ar-LY",
    label: "Arabic (Libya)",
  },
  {
    langCode: "ar-MA",
    label: "Arabic (Morocco)",
  },
  {
    langCode: "ar-OM",
    label: "Arabic (Oman)",
  },
  {
    langCode: "ar-QA",
    label: "Arabic (Qatar)",
  },
  {
    langCode: "ar-SA",
    label: "Arabic (Saudi Arabia)",
  },
  {
    langCode: "ar-SY",
    label: "Arabic (Syria)",
  },
  {
    langCode: "ar-TN",
    label: "Arabic (Tunisia)",
  },
  {
    langCode: "ar-YE",
    label: "Arabic (Yemen)",
  },
  {
    langCode: "as-IN",
    label: "Assamese (India)",
  },
  {
    langCode: "az-AZ",
    label: "Azerbaijani (Latin, Azerbaijan)",
  },
  {
    langCode: "bg-BG",
    label: "Bulgarian (Bulgaria)",
  },
  {
    langCode: "bn-BD",
    label: "Bangla (Bangladesh)",
  },
  {
    langCode: "bn-IN",
    label: "Bengali (India)",
  },
  {
    langCode: "bs-BA",
    label: "Bosnian (Bosnia and Herzegovina)",
  },
  {
    langCode: "ca-ES",
    label: "Catalan",
  },
  {
    langCode: "cs-CZ",
    label: "Czech (Czechia)",
  },
  {
    langCode: "cy-GB",
    label: "Welsh (United Kingdom)",
  },
  {
    langCode: "da-DK",
    label: "Danish (Denmark)",
  },
  {
    langCode: "de-AT",
    label: "German (Austria)",
  },
  {
    langCode: "de-CH",
    label: "German (Switzerland)",
  },
  {
    langCode: "de-DE",
    label: "German (Germany)",
  },
  {
    langCode: "el-GR",
    label: "Greek (Greece)",
  },
  {
    langCode: "en-AU",
    label: "English (Australia)",
  },
  {
    langCode: "en-CA",
    label: "English (Canada)",
  },
  {
    langCode: "en-GB",
    label: "English (United Kingdom)",
  },
  {
    langCode: "en-HK",
    label: "English (Hong Kong SAR)",
  },
  {
    langCode: "en-IE",
    label: "English (Ireland)",
  },
  {
    langCode: "en-IN",
    label: "English (India)",
  },
  {
    langCode: "en-KE",
    label: "English (Kenya)",
  },
  {
    langCode: "en-NG",
    label: "English (Nigeria)",
  },
  {
    langCode: "en-NZ",
    label: "English (New Zealand)",
  },
  {
    langCode: "en-PH",
    label: "English (Philippines)",
  },
  {
    langCode: "en-SG",
    label: "English (Singapore)",
  },
  {
    langCode: "en-TZ",
    label: "English (Tanzania)",
  },
  {
    langCode: "en-US",
    label: "English (United States)",
  },
  {
    langCode: "en-ZA",
    label: "English (South Africa)",
  },
  {
    langCode: "es-AR",
    label: "Spanish (Argentina)",
  },
  {
    langCode: "es-BO",
    label: "Spanish (Bolivia)",
  },
  {
    langCode: "es-CL",
    label: "Spanish (Chile)",
  },
  {
    langCode: "es-CO",
    label: "Spanish (Colombia)",
  },
  {
    langCode: "es-CR",
    label: "Spanish (Costa Rica)",
  },
  {
    langCode: "es-CU",
    label: "Spanish (Cuba)",
  },
  {
    langCode: "es-DO",
    label: "Spanish (Dominican Republic)",
  },
  {
    langCode: "es-EC",
    label: "Spanish (Ecuador)",
  },
  {
    langCode: "es-ES",
    label: "Spanish (Spain)",
  },
  {
    langCode: "es-GQ",
    label: "Spanish (Equatorial Guinea)",
  },
  {
    langCode: "es-GT",
    label: "Spanish (Guatemala)",
  },
  {
    langCode: "es-HN",
    label: "Spanish (Honduras)",
  },
  {
    langCode: "es-MX",
    label: "Spanish (Mexico)",
  },
  {
    langCode: "es-NI",
    label: "Spanish (Nicaragua)",
  },
  {
    langCode: "es-PA",
    label: "Spanish (Panama)",
  },
  {
    langCode: "es-PE",
    label: "Spanish (Peru)",
  },
  {
    langCode: "es-PR",
    label: "Spanish (Puerto Rico)",
  },
  {
    langCode: "es-PY",
    label: "Spanish (Paraguay)",
  },
  {
    langCode: "es-SV",
    label: "Spanish (El Salvador)",
  },
  {
    langCode: "es-US",
    label: "Spanish (United States)",
  },
  {
    langCode: "es-UY",
    label: "Spanish (Uruguay)",
  },
  {
    langCode: "es-VE",
    label: "Spanish (Venezuela)",
  },
  {
    langCode: "et-EE",
    label: "Estonian (Estonia)",
  },
  {
    langCode: "eu-ES",
    label: "Basque",
  },
  {
    langCode: "fa-IR",
    label: "Persian (Iran)",
  },
  {
    langCode: "fi-FI",
    label: "Finnish (Finland)",
  },
  {
    langCode: "fil-PH",
    label: "Filipino (Philippines)",
  },
  {
    langCode: "fr-BE",
    label: "French (Belgium)",
  },
  {
    langCode: "fr-CA",
    label: "French (Canada)",
  },
  {
    langCode: "fr-CH",
    label: "French (Switzerland)",
  },
  {
    langCode: "fr-FR",
    label: "French (France)",
  },
  {
    langCode: "ga-IE",
    label: "Irish (Ireland)",
  },
  {
    langCode: "gl-ES",
    label: "Galician",
  },
  {
    langCode: "gu-IN",
    label: "Gujarati (India)",
  },
  {
    langCode: "he-IL",
    label: "Hebrew (Israel)",
  },
  {
    langCode: "hi-IN",
    label: "Hindi (India)",
  },
  {
    langCode: "hr-HR",
    label: "Croatian (Croatia)",
  },
  {
    langCode: "hu-HU",
    label: "Hungarian (Hungary)",
  },
  {
    langCode: "hy-AM",
    label: "Armenian (Armenia)",
  },
  {
    langCode: "id-ID",
    label: "Indonesian (Indonesia)",
  },
  {
    langCode: "is-IS",
    label: "Icelandic (Iceland)",
  },
  {
    langCode: "it-IT",
    label: "Italian (Italy)",
  },
  {
    langCode: "iu-CANS-CA",
    label: "Inuktitut (Syllabics, Canada)",
  },
  {
    langCode: "iu-LATN-CA",
    label: "Inuktitut (Latin, Canada)",
  },
  {
    langCode: "ja-JP",
    label: "Japanese (Japan)",
  },
  {
    langCode: "jv-ID",
    label: "Javanese (Latin, Indonesia)",
  },
  {
    langCode: "ka-GE",
    label: "Georgian (Georgia)",
  },
  {
    langCode: "kk-KZ",
    label: "Kazakh (Kazakhstan)",
  },
  {
    langCode: "km-KH",
    label: "Khmer (Cambodia)",
  },
  {
    langCode: "kn-IN",
    label: "Kannada (India)",
  },
  {
    langCode: "ko-KR",
    label: "Korean (Korea)",
  },
  {
    langCode: "lo-LA",
    label: "Lao (Laos)",
  },
  {
    langCode: "lt-LT",
    label: "Lithuanian (Lithuania)",
  },
  {
    langCode: "lv-LV",
    label: "Latvian (Latvia)",
  },
  {
    langCode: "mk-MK",
    label: "Macedonian (North Macedonia)",
  },
  {
    langCode: "ml-IN",
    label: "Malayalam (India)",
  },
  {
    langCode: "mn-MN",
    label: "Mongolian (Mongolia)",
  },
  {
    langCode: "mr-IN",
    label: "Marathi (India)",
  },
  {
    langCode: "ms-MY",
    label: "Malay (Malaysia)",
  },
  {
    langCode: "mt-MT",
    label: "Maltese (Malta)",
  },
  {
    langCode: "my-MM",
    label: "Burmese (Myanmar)",
  },
  {
    langCode: "nb-NO",
    label: "Norwegian Bokmål (Norway)",
  },
  {
    langCode: "ne-NP",
    label: "Nepali (Nepal)",
  },
  {
    langCode: "nl-BE",
    label: "Dutch (Belgium)",
  },
  {
    langCode: "nl-NL",
    label: "Dutch (Netherlands)",
  },
  {
    langCode: "or-IN",
    label: "Oriya (India)",
  },
  {
    langCode: "pa-IN",
    label: "Punjabi (India)",
  },
  {
    langCode: "pl-PL",
    label: "Polish (Poland)",
  },
  {
    langCode: "ps-AF",
    label: "Pashto (Afghanistan)",
  },
  {
    langCode: "pt-BR",
    label: "Portuguese (Brazil)",
  },
  {
    langCode: "pt-PT",
    label: "Portuguese (Portugal)",
  },
  {
    langCode: "ro-RO",
    label: "Romanian (Romania)",
  },
  {
    langCode: "ru-RU",
    label: "Russian (Russia)",
  },
  {
    langCode: "si-LK",
    label: "Sinhala (Sri Lanka)",
  },
  {
    langCode: "sk-SK",
    label: "Slovak (Slovakia)",
  },
  {
    langCode: "sl-SI",
    label: "Slovenian (Slovenia)",
  },
  {
    langCode: "so-SO",
    label: "Somali (Somalia)",
  },
  {
    langCode: "sq-AL",
    label: "Albanian (Albania)",
  },
  {
    langCode: "sr-LATN-RS",
    label: "Serbian (Latin, Serbia)",
  },
  {
    langCode: "sr-RS",
    label: "Serbian (Cyrillic, Serbia)",
  },
  {
    langCode: "su-ID",
    label: "Sundanese (Indonesia)",
  },
  {
    langCode: "sv-SE",
    label: "Swedish (Sweden)",
  },
  {
    langCode: "sw-KE",
    label: "Kiswahili (Kenya)",
  },
  {
    langCode: "sw-TZ",
    label: "Kiswahili (Tanzania)",
  },
  {
    langCode: "ta-IN",
    label: "Tamil (India)",
  },
  {
    langCode: "ta-LK",
    label: "Tamil (Sri Lanka)",
  },
  {
    langCode: "ta-MY",
    label: "Tamil (Malaysia)",
  },
  {
    langCode: "ta-SG",
    label: "Tamil (Singapore)",
  },
  {
    langCode: "te-IN",
    label: "Telugu (India)",
  },
  {
    langCode: "th-TH",
    label: "Thai (Thailand)",
  },
  {
    langCode: "tr-TR",
    label: "Turkish (Türkiye)",
  },
  {
    langCode: "uk-UA",
    label: "Ukrainian (Ukraine)",
  },
  {
    langCode: "ur-IN",
    label: "Urdu (India)",
  },
  {
    langCode: "ur-PK",
    label: "Urdu (Pakistan)",
  },
  {
    langCode: "uz-UZ",
    label: "Uzbek (Latin, Uzbekistan)",
  },
  {
    langCode: "vi-VN",
    label: "Vietnamese (Vietnam)",
  },
  {
    langCode: "wuu-CN",
    label: "Chinese (Wu, Simplified)",
  },
  {
    langCode: "yue-CN",
    label: "Chinese (Cantonese, Simplified)",
  },
  {
    langCode: "zh-CN",
    label: "Chinese (Mandarin, Simplified)",
  },
  {
    langCode: "zh-CN-GUANGXI",
    label: "Chinese (Guangxi Accent Mandarin, Simplified)",
  },
  {
    langCode: "zh-CN-henan",
    label: "Chinese (Zhongyuan Mandarin Henan, Simplified)",
  },
  {
    langCode: "zh-CN-liaoning",
    label: "Chinese (Northeastern Mandarin, Simplified)",
  },
  {
    langCode: "zh-CN-shaanxi",
    label: "Chinese (Zhongyuan Mandarin Shaanxi, Simplified)",
  },
  {
    langCode: "zh-CN-shandong",
    label: "Chinese (Jilu Mandarin, Simplified)",
  },
  {
    langCode: "zh-CN-sichuan",
    label: "Chinese (Southwestern Mandarin, Simplified)",
  },
  {
    langCode: "zh-HK",
    label: "Chinese (Cantonese, Traditional)",
  },
  {
    langCode: "zh-TW",
    label: "Chinese (Taiwanese Mandarin, Traditional)",
  },
  {
    langCode: "zu-ZA",
    label: "isiZulu (South Africa)",
  },
];
