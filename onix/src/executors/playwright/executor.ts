import { logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { executorFactory } from '../../functions/executor-factory.function';
import { loadEnvFile } from '../../functions/load-env-file.function';
import { extractProjectConfiguration } from '../../functions/extract-project-configuration.function';

export default executorFactory(async (options: ExecutorSchema, context) => {
  const { envFile } = options;

  loadEnvFile(envFile);

  const root = extractProjectConfiguration(context, context.projectName).root;

  const command = `playwright test -c ${root}/playwright.config.ts`;

  logger.info(command);

  execSync(command, { stdio: 'inherit' });
});
