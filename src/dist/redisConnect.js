"use strict";
exports.__esModule = true;
exports.clientRedis = void 0;
var redis = require("redis");
exports.clientRedis = redis.createClient({
    host: '192.168.1.187',
    port: 6379
});
