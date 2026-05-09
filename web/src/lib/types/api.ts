import type { CyberCyganSettings } from "$lib/types/settings";

enum CyberCyganResponseType {
    Error = 'error',
    Picker = 'picker',
    Redirect = 'redirect',
    Tunnel = 'tunnel',
    LocalProcessing = 'local-processing',
}

export type CyberCyganErrorResponse = {
    status: CyberCyganResponseType.Error,
    error: {
        code: string,
        context?: {
            service?: string,
            limit?: number,
        }
    },
};

type CyberCyganPartialURLResponse = {
    url: string,
    filename: string,
}

type CyberCyganPickerResponse = {
    status: CyberCyganResponseType.Picker
    picker: {
        type: 'photo' | 'video' | 'gif',
        url: string,
        thumb?: string,
    }[];
    audio?: string,
    audioFilename?: string,
};

type CyberCyganRedirectResponse = {
    status: CyberCyganResponseType.Redirect,
} & CyberCyganPartialURLResponse;

type CyberCyganTunnelResponse = {
    status: CyberCyganResponseType.Tunnel,
} & CyberCyganPartialURLResponse;

export const CyberCyganFileMetadataKeys = [
    'album',
    'composer',
    'genre',
    'copyright',
    'title',
    'artist',
    'album_artist',
    'track',
    'date',
    'sublanguage',
];

export type CyberCyganFileMetadata = Record<
    typeof CyberCyganFileMetadataKeys[number], string | undefined
>;

export type CyberCyganLocalProcessingType = 'merge' | 'mute' | 'audio' | 'gif' | 'remux' | 'proxy';

export type CyberCyganLocalProcessingResponse = {
    status: CyberCyganResponseType.LocalProcessing,

    type: CyberCyganLocalProcessingType,
    service: string,
    tunnel: string[],

    output: {
        type: string, // mimetype
        filename: string,
        metadata?: CyberCyganFileMetadata,
        subtitles?: boolean,
    },

    audio?: {
        copy: boolean,
        format: string,
        bitrate: string,
        cover?: boolean,
        cropCover?: boolean,
    },

    isHLS?: boolean,
}

export type CyberCyganFileUrlType = "redirect" | "tunnel";

export type CyberCyganSession = {
    token: string,
    exp: number,
}

export type CyberCyganServerInfo = {
    CyberCygan: {
        version: string,
        url: string,
        startTime: string,
        turnstileSitekey?: string,
        services: string[]
    },
    git: {
        branch: string,
        commit: string,
        remote: string,
    }
}

// TODO: strict partial
// this allows for extra properties, which is not ideal,
// but i couldn't figure out how to make a strict partial :(
export type CyberCyganSaveRequestBody =
    { url: string } & Partial<Omit<CyberCyganSettings['save'], 'savingMethod'>>;

export type CyberCyganSessionResponse = CyberCyganSession | CyberCyganErrorResponse;
export type CyberCyganServerInfoResponse = CyberCyganServerInfo | CyberCyganErrorResponse;

export type CyberCyganAPIResponse = CyberCyganErrorResponse
                              | CyberCyganPickerResponse
                              | CyberCyganRedirectResponse
                              | CyberCyganTunnelResponse
                              | CyberCyganLocalProcessingResponse;
