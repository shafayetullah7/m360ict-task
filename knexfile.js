"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __importDefault(require("./src/config/env"));
const config = {
    client: 'pg',
    connection: {
        host: env_1.default.DB.HOST,
        port: env_1.default.DB.PORT,
        user: env_1.default.DB.USER,
        password: env_1.default.DB.PASSWORD,
        database: env_1.default.DB.NAME,
    },
    pool: {
        min: env_1.default.DB.POOL_MIN,
        max: env_1.default.DB.POOL_MAX,
    },
    migrations: {
        directory: './src/db/migrations',
        extension: 'ts',
    },
    seeds: {
        directory: './src/db/seeds',
        extension: 'ts',
    },
};
exports.default = config;
