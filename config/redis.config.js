const Redis = require("ioredis");

class RedisManager {
    static client = null;

    constructor(host = "localhost", port = 6379) {
        if (!RedisManager.client) {
            this.client = new Redis({
                host,
                port,
                lazyConnect: true,
                connectTimeout: 5000,
                retryStrategy: false,
            });

            this.client.on("error", (err) => {
                console.error(">> Redis Error:", err);
            });

            this.client.on("connect", () => {
                console.log(`>> Redis connected at ${host}:${port}`);
            });

            RedisManager.client = this.client;
        }

        return RedisManager.client;
    }

    static getClient() {
        if (!RedisManager.client) {
            console.error(">> Redis connection is not initialized.");
            return null;
        }
        return RedisManager.client;
    }

    static async setKey(key, value, ttl = 86400) { // TTL default: 24 jam
        const client = RedisManager.getClient();
        if (!client) return false;

        try {
            await client.setex(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`>> Error setting Redis key ${key}:`, error);
            return false;
        }
    }

    static async getKey(key) {
        const client = RedisManager.getClient();
        if (!client) return null;

        try {
            const data = await client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`>> Error getting Redis key ${key}:`, error);
            return null;
        }
    }

    static async deleteKey(key) {
        const client = RedisManager.getClient();
        if (!client) return false;

        try {
            await client.del(key);
            return true;
        } catch (error) {
            console.error(`>> Error deleting Redis key ${key}:`, error);
            return false;
        }
    }
}

module.exports = RedisManager;
