import { writable } from "svelte/store";
import type { CyberCyganDownloadButtonState } from "$lib/types/omnibox";

export const link = writable("");
export const downloadButtonState = writable<CyberCyganDownloadButtonState>("idle");
