import { ExecutorContext, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { executorFactory } from '../../functions/executor-factory.function';
import { parseEnvFileForTerraform } from '../../functions/parse-env-file-for-terraform.function';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { envFile, terraformRoot, terraformCommand, filterRegex } = options;

  const env = parseEnvFileForTerraform({file: envFile, filterRegex: filterRegex ? new RegExp(filterRegex) : undefined});

  logger.info(`YOU NEED TO HAVE TERRAFORM INSTALLED IN ORDER TO USE THIS EXECUTOR`);

  execSync(`terraform init -reconfigure`, { stdio: 'inherit', cwd: terraformRoot });
  execSync(`terraform ${terraformCommand}`, { stdio: 'inherit', cwd: terraformRoot, env });
});
