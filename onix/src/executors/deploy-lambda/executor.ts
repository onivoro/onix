import { ExecutorContext } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { extractProjectBuildOutputs } from '../../functions/extract-project-build-outputs.function';
import { deployLambda } from '../../functions/deploy-lambda.function';
import { pmxSpawn } from '../../functions/pmx.function';
import { pm } from '../../functions/pm.function';
import { executorFactory } from '../../functions/executor-factory.function';
import { loadEnvFile } from '../../functions/load-env-file.function';

const stdio = 'inherit';

export default executorFactory(async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  const { functionName, region, bucket, profile, roleArn, environment, memorySize, delayMs, handler, runtime, installFlags, envFile } = options;
  const [apiProjectOutput] = extractProjectBuildOutputs(context, context.projectName);

  pmxSpawn(context, `nx build ${context.projectName}`);
  execSync(pm(context).install + (installFlags ? ` ${installFlags}` : ''), { stdio, cwd: apiProjectOutput });

  if (envFile) {
    loadEnvFile(envFile);
  }

  await deployLambda({ functionName: functionName || context.projectName, sourcePath: apiProjectOutput, region, bucket, roleArn, profile, environment, memorySize, delayMs, handler, runtime });

});
