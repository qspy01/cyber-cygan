import { type CyberCyganSettingsV4 } from "$lib/types/settings/v4";

export type CyberCyganSettingsV5 = Omit<CyberCyganSettingsV4, 'schemaVersion' | 'advanced' | 'save' | 'privacy' | 'appearance'> & {
    schemaVersion: 5,
    appearance: Omit<CyberCyganSettingsV4['appearance'], 'reduceMotion' | 'reduceTransparency'> & {
        hideRemuxTab: boolean,
    },
    accessibility: {
        reduceMotion: boolean;
        reduceTransparency: boolean;
        disableHaptics: boolean;
        dontAutoOpenQueue: boolean;
    },
    advanced: CyberCyganSettingsV4['advanced'] & {
        useWebCodecs: boolean;
    },
    privacy: Omit<CyberCyganSettingsV4['privacy'], 'alwaysProxy'>,
    save: Omit<CyberCyganSettingsV4['save'], 'tiktokH265' | 'twitterGif'> & {
        alwaysProxy: boolean;
        localProcessing: boolean;
        allowH265: boolean;
        convertGif: boolean;
        youtubeBetterAudio: boolean;
    },
};
