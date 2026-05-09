<script lang="ts">
    export let label: string;
    export let usage: number;
    export let limit: number;

    $: percentage = Math.min((usage / limit) * 100, 100);
</script>

<div class="usage-card">
    <div class="header">
        <span class="label">{label}</span>
        <span class="stats">{usage} / {limit}</span>
    </div>
    <div class="progress-bar-container">
        <div class="progress-bar" style="width: {percentage}%"></div>
    </div>
</div>

<style>
    .usage-card {
        padding: 1rem;
        background-color: var(--sidebar-bg);
        border: 1px solid var(--content-border);
        border-radius: 8px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }

    .label {
        font-weight: bold;
    }

    .progress-bar-container {
        height: 8px;
        background-color: var(--content-border);
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background-color: var(--sidebar-highlight);
    }
</style>
