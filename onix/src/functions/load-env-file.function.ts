import { logger } from "@nx/devkit";
import { existsSync } from "fs";
import { loadEnvFile as nodeLoadEnvFile } from "process";

const dotLocal = '.local';

export function loadEnvFile(envFile?: string | undefined) {
    if (envFile) {
        if (existsSync(envFile)) {
            nodeLoadEnvFile(envFile);

            logger.info(`loaded environment variables from file "${envFile}"`);

            if (!envFile.endsWith(dotLocal)) {
                loadEnvFile(`${envFile}${dotLocal}`);
            }
        } else {
            logger.warn(`optionally define environment variables in a file named "${envFile}"`);
        }
    }
}