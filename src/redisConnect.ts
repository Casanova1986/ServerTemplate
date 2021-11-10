import * as redis from 'redis';
export const clientRedis = redis.createClient({
    host: '192.168.1.187',
    port: 6379,
});