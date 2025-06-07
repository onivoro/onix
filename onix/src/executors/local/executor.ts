import {
  ExecutorContext,
} from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { loadEnvFile } from '../../functions/load-env-file.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { pmxSpawn } from '../../functions/pmx.function';
import { copyFromS3 as copy } from '../../functions/copy-from-s3.function';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { debugPort, envFile, copyFromS3 } = options;

  if(copyFromS3) {
    await copy(copyFromS3);
  }

  loadEnvFile(envFile);

  const inspectStatement = debugPort ? `--port=${debugPort}` : '';

  pmxSpawn(context, `nx run ${context.projectName}:serve ${inspectStatement}`);
});