import { ExecutorContext, PromiseExecutor, logger } from '@nx/devkit';
import { ExecutorSchema } from './schema';
import { execSync } from 'child_process';
import { extractProjectBuildOutputs } from '../../functions/extract-project-build-outputs.function';
import { deployLambda } from '../../functions/deploy-lambda.function';
import { extractTargetConfiguration } from '../../functions/extract-target-configuration.function';

const stdio = 'inherit';

const executor: PromiseExecutor<ExecutorSchema> = async (
  options: ExecutorSchema,
  context: ExecutorContext
) => {
  try {
    if (!extractTargetConfiguration(context)) {
      return { success: true };
    }

    const { functionName, region, bucket, profile } = options;
    const [apiProjectOutput] = extractProjectBuildOutputs(context, context.projectName);

    execSync(`npx nx build ${context.projectName}`, { stdio });

    await deployLambda({ functionName: functionName || context.projectName, sourcePath: apiProjectOutput, region, bucket });

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
