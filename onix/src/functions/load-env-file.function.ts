import { logger } from "@nx/devkit";
import { existsSync } from "fs";

export function loadEnvFile(envFile: string) {
    if (envFile) {
        if(existsSync(envFile)) {
            loadEnvFile(envFile);
        } else {
            logger.warn(`specified environment path "${envFile}" does not exist`);
        }
    }
}