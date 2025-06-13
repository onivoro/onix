import {
    ExecutorContext,
    logger
} from '@nx/devkit';
import { execSync, spawnSync } from 'child_process';
import { pm } from './pm.function';
import { objectToEnvExports } from './object-to-env-exports.function';

export function pmxSpawn(context: ExecutorContext, command: string, env: Record<string, any> = {}) {
    const { dlx } = pm(context);

    const envLiteral = ''; // objectToEnvExports(env);

    const completeCommand = `${envLiteral} ${dlx} ${command}`.trim();

    logger.info(completeCommand);

    try {
        // Use execSync instead of spawnSync for better shell command support
        execSync(completeCommand, {
            stdio: 'inherit',
            env: { ...process.env, ...env }
        });
    } catch (error) {
        throw new Error(`Command failed: ${completeCommand}. Error: ${error.message}`);
    }
}

export function pmxExec(context: ExecutorContext, command: string) {
    const { dlx } = pm(context);

    const completeCommand = `${dlx} ${command}`;

    logger.info(completeCommand);

    execSync(completeCommand, { stdio: 'inherit' });
}
