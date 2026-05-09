import type { YoutubeDubLang } from "$lib/settings/audio-sub-language";
import { type CyberCyganSettingsV2 } from "$lib/types/settings/v2";

export type CyberCyganSettingsV3 = Omit<CyberCyganSettingsV2, 'schemaVersion' | 'save'> & {
    schemaVersion: 3,
    save: Omit<CyberCyganSettingsV2['save'], 'youtubeDubBrowserLang'> & {
        youtubeDubLang: YoutubeDubLang;
    };
};
