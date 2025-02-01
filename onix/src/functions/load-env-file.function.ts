import { logger } from "@nx/devkit";
import { existsSync } from "fs";
import { loadEnvFile as nodeLoadEnvFile } from "process";

export function loadEnvFile(envFile: string) {
    if (envFile) {
        if(existsSync(envFile)) {
            nodeLoadEnvFile(envFile);
        } else {
            logger.warn(`specified environment path "${envFile}" does not exist`);
        }
    }
}