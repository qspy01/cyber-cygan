<script>
    import { t } from "$lib/i18n/translations";

    import Omnibox from "$components/save/Omnibox.svelte";
    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import SupportedServices from "$components/save/SupportedServices.svelte";
</script>

<svelte:head>
    <title>{$t("general.CyberCygan")}</title>
    <meta property="og:title" content={$t("general.CyberCygan")} />
</svelte:head>

<div id="CyberCygan-save-container" class="center-column-container">
    <SupportedServices />
    <main
        id="CyberCygan-save"
        tabindex="-1"
        data-first-focus
    >
        <Meowbalt emotion="smile" />
        <Omnibox />
    </main>
    <div id="terms-note">
        {$t("save.terms.note.agreement")}
        <a href="/about/terms">{$t("save.terms.note.link")}</a>
    </div>
</div>

<style>
    #CyberCygan-save-container {
        padding: var(--padding);
        overflow: hidden;
    }

    #CyberCygan-save {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 15px;
    }

    #terms-note {
        bottom: 0;
        color: var(--gray);
        font-size: 12px;
        text-align: center;
        padding-bottom: 6px;
        font-weight: 500;
    }

    @media screen and (max-width: 535px) {
        #CyberCygan-save-container {
            padding-top: calc(var(--padding) / 2);
        }

        #terms-note {
            font-size: 11px;
            padding-bottom: 0;
        }
    }
</style>
