import {
    ExecutorContext,
    logger
} from '@nx/devkit';
import { execSync, spawnSync } from 'child_process';
import { pm } from './pm.function';

export function pmxSpawn(context: ExecutorContext, command: string) {
    const { dlx } = pm(context);

    const completeCommand = `${dlx} ${command}`;

    logger.info(completeCommand);

    const [program, ...args] = completeCommand.split(' ');

    spawnSync(program, args, { stdio: 'inherit' });
}

export function pmxExec(context: ExecutorContext, command: string) {
    const { dlx } = pm(context);

    const completeCommand = `${dlx} ${command}`;

    logger.info(completeCommand);

    execSync(completeCommand, { stdio: 'inherit' });
}
