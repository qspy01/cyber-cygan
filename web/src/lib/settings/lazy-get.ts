import defaults from "$lib/settings/defaults";
import type { CyberCyganSettings } from "$lib/types/settings";

export default function lazySettingGetter(settings: CyberCyganSettings) {
    // Returns the setting value only if it differs from the default.
    return <
        Context extends Exclude<keyof CyberCyganSettings, 'schemaVersion'>,
        Id extends keyof CyberCyganSettings[Context]
    >(context: Context, key: Id) => {
        if (defaults[context][key] !== settings[context][key]) {
            return settings[context][key];
        }
    }
}
