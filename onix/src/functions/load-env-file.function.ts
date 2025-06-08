import { logger } from "@nx/devkit";
import { existsSync, readFileSync } from "fs";
import { parseEnv } from "util";

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

function nodeLoadEnvFile(envFile: string) {
    const overrides = parseEnv(readFileSync(envFile, 'utf8'));
    Object.assign(process.env, overrides);
}