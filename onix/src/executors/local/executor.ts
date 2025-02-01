import {
  ExecutorContext,
  logger,
} from '@nx/devkit';
import { spawnSync } from 'child_process';
import { ExecutorSchema } from './schema';
import { loadEnvFile } from '../../functions/load-env-file.function';
import { executorFactory } from '../../functions/executor-factory.function';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { debugPort, envFile } = options;

  loadEnvFile(envFile);

  const inspectStatement = debugPort ? `--port=${debugPort}` : '';

  const command = `npx nx run ${context.projectName}:serve ${inspectStatement}`;

  logger.debug(command);

  const [program, ...args] = command.split(' ');

  spawnSync(program, args, { stdio: 'inherit' });
});