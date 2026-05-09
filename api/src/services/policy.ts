import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { env } from '../config.js';
import type { User, Plan, QuotaOverride } from '@prisma/client';

let redisClient: RedisClientType | null = null;
let redisClientPromise: Promise<RedisClientType> | null = null;

export async function getRedisClient(): Promise<RedisClientType | null> {
    if (!env.redisURL) return null;
    
    if (redisClient) return redisClient;
    if (redisClientPromise) return redisClientPromise;

    redisClientPromise = (async () => {
        const client = createClient({ url: env.redisURL });
        await client.connect();
        redisClient = client as RedisClientType;
        return redisClient;
    })();

    return redisClientPromise;
}

export type UserWithPlanAndOverrides = User & {
    plan: Plan | null;
    overrides: QuotaOverride[];
};

export interface Quota {
    dailyLimit: number;
    monthlyLimit: number;
    concurrencyLimit: number;
}

export function resolveQuota(user: UserWithPlanAndOverrides | null): Quota {
    const defaults: Quota = {
        dailyLimit: 100,
        monthlyLimit: 3000,
        concurrencyLimit: 2,
    };

    if (!user) return defaults;

    const quota: Quota = {
        dailyLimit: user.plan?.dailyLimit ?? defaults.dailyLimit,
        monthlyLimit: user.plan?.monthlyLimit ?? defaults.monthlyLimit,
        concurrencyLimit: user.plan?.concurrencyLimit ?? defaults.concurrencyLimit,
    };

    if (user.overrides) {
        for (const override of user.overrides) {
            if (override.metric === 'dailyLimit') quota.dailyLimit = override.value;
            if (override.metric === 'monthlyLimit') quota.monthlyLimit = override.value;
            if (override.metric === 'concurrencyLimit') quota.concurrencyLimit = override.value;
        }
    }

    return quota;
}

export async function checkAndIncrementUsage(
    identifier: string,
    quota: Quota
): Promise<{ allowed: boolean; remaining: number }> {
    const client = await getRedisClient();
    if (!client) {
        // Fallback if no redis configured
        return { allowed: true, remaining: quota.dailyLimit };
    }

    const today = new Date().toISOString().split('T')[0];
    const key = `usage:${identifier}:${today}`;

    const multi = client.multi();
    multi.incr(key);
    multi.expire(key, 86400); // 24 hours
    
    const results = await multi.exec();
    if (!results || results.length === 0) {
        return { allowed: true, remaining: quota.dailyLimit };
    }

    const count = results[0] as number;

    if (count > quota.dailyLimit) {
        return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: quota.dailyLimit - count };
}
