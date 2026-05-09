import { createClient, RedisClientType } from "redis";
import { env } from "../config.js";

let client: RedisClientType | null = null;
const memoryFallback = new Set<string>();

export const initClient = async () => {
    if (!client && env.redisURL) {
        client = createClient({ url: env.redisURL });
        client.on('error', (err) => console.error('Redis Client Error', err));
        await client.connect();
    }
};

export const revokeAccessToken = async (token: string, expiryTime: number) => {
    await initClient();
    
    const now = Math.floor(Date.now() / 1000);
    const ttl = expiryTime - now;

    if (ttl > 0) {
        if (client) {
            await client.set(`revoked:${token}`, '1', { EX: ttl });
        } else {
            memoryFallback.add(token);
            setTimeout(() => memoryFallback.delete(token), ttl * 1000).unref();
        }
    }
};

export const isTokenRevoked = async (token: string) => {
    await initClient();
    
    if (client) {
        const exists = await client.exists(`revoked:${token}`);
        return exists === 1;
    } else {
        return memoryFallback.has(token);
    }
};

export const _resetMemoryFallback = () => memoryFallback.clear();
