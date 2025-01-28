import { ExecutorContext, PromiseExecutor, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { extractProjectBuildOutputs } from '../../functions/extract-project-build-outputs.function';
import { deployLambda } from '../../functions/deploy-lambda.function';

const stdio = 'inherit';

const executor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  try {

    const { functionName, region, bucket, profile, roleArn, environment, memorySize, delayMs, handler, runtime } = options;
    const [apiProjectOutput] = extractProjectBuildOutputs(context, context.projectName);

    execSync(`npx nx build ${context.projectName}`, { stdio });
    execSync(`npm i -f`, { stdio, cwd: apiProjectOutput });

    await deployLambda({ functionName: functionName || context.projectName, sourcePath: apiProjectOutput, region, bucket, roleArn, profile, environment, memorySize, delayMs, handler, runtime });

    return {
      success: true,
    };
  } catch (error) {
    logger.error(error?.message);
    logger.error({ error });
    return {
      success: false,
    };
  }
};

export default executor;
