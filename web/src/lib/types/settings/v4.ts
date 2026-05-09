import { type CyberCyganSettingsV3 } from "$lib/types/settings/v3";

export type CyberCyganSettingsV4 = Omit<CyberCyganSettingsV3, 'schemaVersion' | 'processing'> & {
    schemaVersion: 4,
    processing: Omit<CyberCyganSettingsV3['processing'], 'allowDefaultOverride' | 'seenOverrideWarning'> & {
        customApiKey: string;
        enableCustomApiKey: boolean;
    };
};
