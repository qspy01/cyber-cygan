<script
    lang="ts"
    generics="
        Context extends Exclude<keyof CyberCyganSettings, 'schemaVersion'>,
        Id extends keyof CyberCyganSettings[Context],
        Value extends CyberCyganSettings[Context][Id]
    "
>
    import { hapticSwitch } from "$lib/haptics";

    import settings, { updateSetting } from "$lib/state/settings";
    import type { CyberCyganSettings } from "$lib/types/settings";

    export let settingContext: Context;
    export let settingId: Id;
    export let settingValue: Value;

    $: setting = $settings[settingContext][settingId];
    $: isActive = setting === settingValue;
</script>

<button
    id="setting-button-{settingContext}-{String(settingId)}-{settingValue}"
    class="button"
    class:active={isActive}
    aria-pressed={isActive}
    on:click={() => {
        hapticSwitch();
        updateSetting({
            [settingContext]: {
                [settingId]: settingValue,
            },
        });
    }}
>
    <slot></slot>
</button>
