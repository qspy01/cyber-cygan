import { browser } from "$app/environment";

import { get } from "svelte/store";
import { currentApiURL } from "$lib/api/api-url";
import { turnstileCreated, turnstileEnabled, turnstileSolved } from "$lib/state/turnstile";
import cachedInfo from "$lib/state/server-info";
import type { CyberCyganServerInfoResponse, CyberCyganErrorResponse, CyberCyganServerInfo } from "$lib/types/api";

export type CyberCyganServerInfoCache = {
    info: CyberCyganServerInfo,
    origin: string,
}

const request = async () => {
    const apiEndpoint = `${currentApiURL()}/`;

    const response: CyberCyganServerInfoResponse = await fetch(apiEndpoint, {
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
    })
    .then(r => r.json())
    .catch((e) => {
        if (e?.message?.includes("timed out")) {
            return {
                status: "error",
                error: {
                    code: "error.api.timed_out"
                }
            } as CyberCyganErrorResponse
        }
    });

    return response;
}

// reload the page if turnstile is now disabled, but was previously loaded and not solved
const reloadIfTurnstileDisabled = () => {
    if (browser && !get(turnstileEnabled) && get(turnstileCreated) && !get(turnstileSolved)) {
        window.location.reload();
    }
}

export const getServerInfo = async () => {
    const cache = get(cachedInfo);

    if (cache && cache.origin === currentApiURL()) {
        reloadIfTurnstileDisabled();
        return true
    }

    const freshInfo = await request();

    if (!freshInfo || !("CyberCygan" in freshInfo)) {
        return false;
    }

    if (!("status" in freshInfo)) {
        cachedInfo.set({
            info: freshInfo,
            origin: currentApiURL(),
        });

        // reload the page if turnstile sitekey changed
        if (browser && get(turnstileEnabled) && cache && cache?.info?.CyberCygan?.turnstileSitekey !== freshInfo?.CyberCygan?.turnstileSitekey) {
            window.location.reload();
        }

        reloadIfTurnstileDisabled();

        return true;
    }

    return false;
}
