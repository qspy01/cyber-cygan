<script>
    import IconCyberCygan from "$components/icons/CyberCygan.svelte";
</script>

<div id="CyberCygan-logo">
    <IconCyberCygan />
</div>

<style>
    #CyberCygan-logo {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: calc(var(--sidebar-tab-padding) * 2);

        /* accommodate space for scaling animation */
        padding-bottom: calc(var(--sidebar-tab-padding) * 2 - var(--sidebar-inner-padding));
    }

    #CyberCygan-logo :global(path) {
        fill: var(--sidebar-highlight);
    }

    @media screen and (max-width: 535px) {
        #CyberCygan-logo {
            display: none;
        }
    }
</style>
