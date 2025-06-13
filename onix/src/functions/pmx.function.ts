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

    const [program, ...args] = completeCommand.trim().split(' ');

    // spawnSync(program, args, { stdio: 'inherit', env });
    execSync(completeCommand, {stdio: 'inherit', env});
}

export function pmxExec(context: ExecutorContext, command: string) {
    const { dlx } = pm(context);

    const completeCommand = `${dlx} ${command}`;

    logger.info(completeCommand);

    execSync(completeCommand, { stdio: 'inherit' });
}
