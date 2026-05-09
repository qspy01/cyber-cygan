import { createClient, RedisClientType } from "redis";
import { env } from "../config.js";

let client: RedisClientType | null = null;
const memoryFallback = new Set<string>();
let memoryFallbackWarningLogged = false;

export const initClient = async () => {
    if (!client && env.redisURL) {
        try {
            client = createClient({ url: env.redisURL });
            client.on('error', (err) => console.error('Redis Client Error', err));
            await client.connect();
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            client = null;
            throw error;
        }
    } else if (!client && !env.redisURL && !memoryFallbackWarningLogged) {
        console.warn('WARNING: API_REDIS_URL not provided, using memory fallback for tokens. This should only be used in development.');
        memoryFallbackWarningLogged = true;
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
