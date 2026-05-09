<script lang="ts">
    import { onMount } from "svelte";
    import UsageCard from "$components/dashboard/UsageCard.svelte";
    import { api } from "$lib/api/api";
    import { t } from "$lib/i18n/translations";

    let usageData: any = null;
    let activityData: any[] = [];
    let loading = true;

    onMount(async () => {
        try {
            const [usageRes, activityRes] = await Promise.all([
                api.get("/api/user/usage"),
                api.get("/api/user/activity")
            ]);
            usageData = usageRes.data;
            activityData = activityRes.data;
        } catch (e) {
            console.error("Failed to load dashboard data", e);
        } finally {
            loading = false;
        }
    });
</script>

<div class="dashboard">
    <h1>Dashboard</h1>
    {#if loading}
        <p>Loading...</p>
    {:else if usageData}
        <div class="usage-grid">
            <UsageCard label="Daily Usage" usage={usageData.dailyUsage} limit={usageData.planLimit} />
            <UsageCard label="Monthly Usage" usage={usageData.monthlyUsage} limit={usageData.planLimit} />
        </div>

        <h2>Recent Activity</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Media</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {#each activityData as activity}
                    <tr>
                        <td>{new Date(activity.createdAt).toLocaleDateString()}</td>
                        <td>{activity.mediaUrl}</td>
                        <td>{activity.status}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <p>Failed to load usage data.</p>
    {/if}
</div>

<style>
    .dashboard {
        padding: 2rem;
    }

    .usage-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 0.5rem;
        border-bottom: 1px solid var(--content-border);
        text-align: left;
    }
</style>
