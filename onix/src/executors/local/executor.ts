import {
  ExecutorContext,
} from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { loadEnvFile } from '../../functions/load-env-file.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { pmxSpawn } from '../../functions/pmx.function';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { debugPort, envFile } = options;

  loadEnvFile(envFile);

  const inspectStatement = debugPort ? `--port=${debugPort}` : '';

  pmxSpawn(context, `nx run ${context.projectName}:serve ${inspectStatement}`);
});