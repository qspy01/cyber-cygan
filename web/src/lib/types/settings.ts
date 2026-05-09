import type { RecursivePartial } from "$lib/types/generic";
import type { CyberCyganSettingsV2 } from "$lib/types/settings/v2";
import type { CyberCyganSettingsV3 } from "$lib/types/settings/v3";
import type { CyberCyganSettingsV4 } from "$lib/types/settings/v4";
import type { CyberCyganSettingsV5 } from "$lib/types/settings/v5";
import type { CyberCyganSettingsV6 } from "$lib/types/settings/v6";

export * from "$lib/types/settings/v2";
export * from "$lib/types/settings/v3";
export * from "$lib/types/settings/v4";
export * from "$lib/types/settings/v5";
export * from "$lib/types/settings/v6";

export type CyberCyganSettings = CyberCyganSettingsV6;

export type AnyCyberCyganSettings = CyberCyganSettingsV5 | CyberCyganSettingsV4 | CyberCyganSettingsV3 | CyberCyganSettingsV2 | CyberCyganSettings;

export type PartialSettings = RecursivePartial<CyberCyganSettings>;

export type AllPartialSettingsWithSchema = RecursivePartial<AnyCyberCyganSettings> & { schemaVersion: number };

export type DownloadModeOption = CyberCyganSettings['save']['downloadMode'];
