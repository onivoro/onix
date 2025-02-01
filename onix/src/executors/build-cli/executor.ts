import { logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { executorFactory } from '../../functions/executor-factory.function';
import { extractProjectBuildOutputs } from '../../functions/extract-project-build-outputs.function';

export default executorFactory(async (options: ExecutorSchema, context) => {
  const [outputPath] = extractProjectBuildOutputs(context, context.projectName);
  const tempPath = `${outputPath}/temp`;
  const executableOutputPath = `${outputPath}/main.js`;
  logger.info(`add a bin entry to root package.json pointing at this executable => ${executableOutputPath} and re-run this if the bin entry hasn't been added yet`);
  const command = `npx nx build ${context.projectName} && echo '#! /usr/bin/env node' > ${tempPath} && cat ${executableOutputPath} >> ${tempPath} && mv ${tempPath} ${executableOutputPath} && chmod +x ${executableOutputPath} && npm link`;

  logger.info(command);

  execSync(command, { stdio: 'inherit' });
});
