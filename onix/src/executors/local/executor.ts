import {
  ExecutorContext,
  logger,
  PromiseExecutor,
} from '@nx/devkit';
import { execSync } from 'child_process';
import { ExecutorSchema } from './schema';
import { loadEnvFile } from '../../functions/load-env-file.function';

const runExecutor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { debugPort, envFile } = options;

  try {
    loadEnvFile(envFile);

    const inspectStatement = debugPort ? `--port=${debugPort}` : '';
    const command = `npx nx run ${context.projectName}:serve ${inspectStatement}`;
    logger.debug(command);
    execSync(command, { stdio: 'inherit' });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
}

export default runExecutor;